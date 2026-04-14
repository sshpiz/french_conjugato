import argparse
import hashlib
import json
import shutil
import subprocess
import wave
from pathlib import Path

from generate_french_tts_inventory import OUTPUT_PATH as INVENTORY_OUTPUT_PATH
from generate_french_tts_inventory import generate_inventory


ROOT = Path(__file__).resolve().parent
GENERATED_DIR = ROOT / "generated_tts"
CACHE_DIR = ROOT / "generated_tts_cache"
CLIP_CACHE_DIR = CACHE_DIR / "clips"
PACK_TEMP_DIR = CACHE_DIR / "packs"
INVENTORY_PATH = INVENTORY_OUTPUT_PATH

DEFAULT_ENGINE = "say"
DEFAULT_SAY_VOICE = "Thomas"
DEFAULT_BITRATE = "64k"
DEFAULT_TEMPO = 1.0
DEFAULT_SILENCE_MS = 20
DEFAULT_START_TRIM_THRESHOLD = "-45dB"
DEFAULT_END_TRIM_THRESHOLD = "-45dB"
DEFAULT_LAYOUT = "packed"
TENSE_ORDER = [
    "present",
    "passeCompose",
    "imparfait",
    "futurSimple",
    "plusQueParfait",
    "subjonctifPresent",
    "conditionnelPresent",
]
PRONOUN_ORDER = [
    "je",
    "tu",
    "il",
    "elle",
    "on",
    "il/elle/on",
    "nous",
    "vous",
    "ils",
    "elles",
    "ils/elles",
]


def run(cmd, cwd=None):
    print("+", " ".join(map(str, cmd)))
    subprocess.run(cmd, cwd=cwd, check=True)


def ensure_say_installed():
    if not shutil.which("say"):
        raise RuntimeError("macOS 'say' is required for the say engine.")


def ensure_ffmpeg_installed():
    if not shutil.which("ffmpeg"):
        raise RuntimeError("ffmpeg is required to build compressed TTS packs.")


def ensure_dirs():
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    CLIP_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    PACK_TEMP_DIR.mkdir(parents=True, exist_ok=True)


def reset_generated_dir():
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    for child in GENERATED_DIR.iterdir():
        if child.is_dir():
            shutil.rmtree(child)
        else:
            child.unlink()


def load_inventory(path):
    if not path.exists():
        raise FileNotFoundError(f"{path} not found")
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or "items" not in data:
        raise ValueError("Inventory must be an object with an 'items' array")
    return data


def slugify(value):
    safe = []
    for ch in str(value or ""):
        if ch.isalnum():
            safe.append(ch.lower())
        elif ch in {"-", "_"}:
            safe.append(ch)
        else:
            safe.append("-")
    slug = "".join(safe).strip("-")
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug or "item"


def clip_cache_key(engine, voice_name, text, tempo):
    digest = hashlib.sha256(
        f"{engine}\n{voice_name}\n{tempo}\n{DEFAULT_START_TRIM_THRESHOLD}\n{DEFAULT_END_TRIM_THRESHOLD}\n{text}".encode("utf-8")
    ).hexdigest()
    return f"{digest}.wav"


def build_ffmpeg_atempo_chain(tempo):
    factors = []
    remaining = float(tempo)
    while remaining > 2.0:
        factors.append(2.0)
        remaining /= 2.0
    while remaining < 0.5:
        factors.append(0.5)
        remaining /= 0.5
    factors.append(round(remaining, 5))
    return ",".join(f"atempo={factor}" for factor in factors)


def build_clip_filter_chain(tempo):
    filters = [
        (
            "silenceremove="
            f"start_periods=1:start_duration=0.03:start_threshold={DEFAULT_START_TRIM_THRESHOLD}:"
            f"stop_periods=1:stop_duration=0.10:stop_threshold={DEFAULT_END_TRIM_THRESHOLD}"
        )
    ]
    if abs(float(tempo) - 1.0) >= 0.001:
        filters.append(build_ffmpeg_atempo_chain(tempo))
    return ",".join(filters)


def synthesize_or_reuse_clip(engine, voice_name, item, tempo):
    spoken_text = item["spoken_text"]
    cache_path = CLIP_CACHE_DIR / clip_cache_key(engine, voice_name, spoken_text, tempo)
    if cache_path.exists():
        return cache_path

    raw_path = CLIP_CACHE_DIR / f"{cache_path.stem}.raw.aiff"
    run(["say", "-v", voice_name, "-o", str(raw_path), spoken_text])
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(raw_path),
            "-filter:a",
            build_clip_filter_chain(tempo),
            str(cache_path),
        ]
    )
    raw_path.unlink(missing_ok=True)
    return cache_path


def wav_params(path):
    with wave.open(str(path), "rb") as handle:
        return {
            "nchannels": handle.getnchannels(),
            "sampwidth": handle.getsampwidth(),
            "framerate": handle.getframerate(),
            "nframes": handle.getnframes(),
        }


def make_silence_bytes(ms, nchannels, sampwidth, framerate):
    frames = int(round(ms * framerate / 1000.0))
    return b"\x00" * (frames * nchannels * sampwidth), frames


def transcode_pack_to_mp3(wav_path, mp3_path, bitrate):
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(wav_path),
            "-ac",
            "1",
            "-b:a",
            bitrate,
            "-compression_level",
            "0",
            str(mp3_path),
        ]
    )


def item_sort_key(item):
    kind_order = {"lemma": 0, "conjugation": 1, "usage_example": 2, "pronoun": 3, "tense_label": 4}
    tense_rank = TENSE_ORDER.index(item["tense"]) if item["tense"] in TENSE_ORDER else 99
    pronoun_rank = PRONOUN_ORDER.index(item["pronoun"]) if item["pronoun"] in PRONOUN_ORDER else 99
    sense_rank = item["sense_id"] or item["id"]
    return (
        kind_order.get(item["kind"], 99),
        tense_rank,
        pronoun_rank,
        sense_rank,
        item["id"],
    )


def build_item_output_relpath(item):
    pack_slug = item["pack_slug"]
    if item["kind"] == "lemma":
        filename = "lemma.mp3"
    elif item["kind"] == "conjugation":
        filename = f"conj-{slugify(item['tense'] or 'unknown')}-{slugify(item['pronoun'] or 'unknown')}.mp3"
    elif item["kind"] == "usage_example":
        filename = f"usage-{slugify(item['sense_id'] or item['id'])}.mp3"
    elif item["kind"] == "pronoun":
        filename = f"pronoun-{slugify(item['pronoun'] or item['display_text'])}.mp3"
    elif item["kind"] == "tense_label":
        filename = f"tense-{slugify(item['tense'] or item['display_text'])}.mp3"
    else:
        filename = f"{slugify(item['id'])}.mp3"
    return Path(pack_slug) / filename


def build_pack_file(pack_items, engine, voice_name, bitrate, tempo, silence_ms):
    clip_paths = []
    for item in pack_items:
        clip_paths.append((item, synthesize_or_reuse_clip(engine, voice_name, item, tempo)))

    first = wav_params(clip_paths[0][1])
    silence_bytes, silence_frames = make_silence_bytes(
        silence_ms,
        first["nchannels"],
        first["sampwidth"],
        first["framerate"],
    )

    slug = pack_items[0]["pack_slug"]
    temp_wav_path = PACK_TEMP_DIR / f"{slug}.wav"
    mp3_path = GENERATED_DIR / f"{slug}.mp3"
    current_frame = 0
    pack_index = {}

    with wave.open(str(temp_wav_path), "wb") as out_wav:
        out_wav.setnchannels(first["nchannels"])
        out_wav.setsampwidth(first["sampwidth"])
        out_wav.setframerate(first["framerate"])

        for idx, (item, clip_path) in enumerate(clip_paths):
            params = wav_params(clip_path)
            if (
                params["nchannels"] != first["nchannels"]
                or params["sampwidth"] != first["sampwidth"]
                or params["framerate"] != first["framerate"]
            ):
                raise ValueError(f"Audio format mismatch in {clip_path.name}")

            with wave.open(str(clip_path), "rb") as clip_wav:
                frames = clip_wav.readframes(clip_wav.getnframes())

            start_frame = current_frame
            out_wav.writeframes(frames)
            current_frame += params["nframes"]
            end_frame = current_frame

            pack_index[item["id"]] = {
                "start": round(start_frame / first["framerate"], 6),
                "end": round(end_frame / first["framerate"], 6),
                "display_text": item["display_text"],
                "spoken_text": item["spoken_text"],
                "kind": item["kind"],
                "verb": item["verb"],
                "tense": item["tense"],
                "pronoun": item["pronoun"],
                "sense_id": item["sense_id"],
            }

            if idx != len(clip_paths) - 1:
                out_wav.writeframes(silence_bytes)
                current_frame += silence_frames

    transcode_pack_to_mp3(temp_wav_path, mp3_path, bitrate)
    temp_wav_path.unlink(missing_ok=True)
    return mp3_path, pack_index


def build_clip_files(items, engine, voice_name, bitrate, tempo):
    item_index = {}
    for item in items:
        clip_wav = synthesize_or_reuse_clip(engine, voice_name, item, tempo)
        relpath = build_item_output_relpath(item)
        output_path = GENERATED_DIR / relpath
        output_path.parent.mkdir(parents=True, exist_ok=True)
        transcode_pack_to_mp3(clip_wav, output_path, bitrate)
        item_index[item["id"]] = {
            "file": relpath.as_posix(),
            "display_text": item["display_text"],
            "spoken_text": item["spoken_text"],
            "kind": item["kind"],
            "verb": item["verb"],
            "tense": item["tense"],
            "pronoun": item["pronoun"],
            "sense_id": item["sense_id"],
        }
    return item_index


def build_manifest(inventory, engine, voice_name, bitrate, tempo, silence_ms, layout):
    version_seed = json.dumps(
        {
            "engine": engine,
            "voice": voice_name,
            "bitrate": bitrate,
            "tempo": tempo,
            "silence_ms": silence_ms,
            "layout": layout,
            "items": [
                {
                    "id": item["id"],
                    "pack_id": item["pack_id"],
                    "spoken_text": item["spoken_text"],
                }
                for item in inventory["items"]
            ],
        },
        ensure_ascii=False,
        sort_keys=True,
    )
    version = hashlib.sha256(version_seed.encode("utf-8")).hexdigest()[:12]

    manifest = {
        "version": f"tts-{version}",
        "engine": engine,
        "voice": voice_name,
        "format": "mp3",
        "bitrate": bitrate,
        "tempo": tempo,
        "silence_ms": silence_ms,
        "layout": layout,
        "included_frequencies": inventory.get("included_frequencies", []),
        "packs": {},
    }

    pack_groups = {}
    for item in inventory["items"]:
        pack_groups.setdefault(item["pack_id"], []).append(item)

    for pack_id, items in sorted(pack_groups.items()):
        items.sort(key=item_sort_key)
        pack_entry = {
            "slug": items[0]["pack_slug"],
            "frequency": next((item["frequency"] for item in items if item["frequency"]), None),
            "verb": next((item["verb"] for item in items if item["verb"]), None),
            "item_count": len(items),
        }
        if layout == "clips":
            pack_entry["items"] = build_clip_files(items, engine, voice_name, bitrate, tempo)
        else:
            pack_file, pack_index = build_pack_file(items, engine, voice_name, bitrate, tempo, silence_ms)
            pack_entry["file"] = pack_file.name
            pack_entry["items"] = pack_index
        manifest["packs"][pack_id] = pack_entry

    return manifest


def parse_args():
    parser = argparse.ArgumentParser(description="Build packaged French TTS assets.")
    parser.add_argument("--inventory", type=Path, default=INVENTORY_PATH)
    parser.add_argument("--engine", choices=["say"], default=DEFAULT_ENGINE)
    parser.add_argument("--voice-name", default=DEFAULT_SAY_VOICE)
    parser.add_argument("--bitrate", default=DEFAULT_BITRATE)
    parser.add_argument("--tempo", type=float, default=DEFAULT_TEMPO)
    parser.add_argument("--silence-ms", type=int, default=DEFAULT_SILENCE_MS)
    parser.add_argument("--layout", choices=["packed", "clips"], default=DEFAULT_LAYOUT)
    parser.add_argument("--regenerate-inventory", action="store_true")
    parser.add_argument(
        "--tiers",
        nargs="+",
        help="Frequency tiers to include in the generated inventory/build. Examples: top20, top100, top500, top1000, rare.",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    ensure_dirs()
    reset_generated_dir()
    ensure_say_installed()
    ensure_ffmpeg_installed()
    if args.regenerate_inventory or args.tiers or not args.inventory.exists():
        generate_inventory(output_path=args.inventory, tiers=args.tiers)
    inventory = load_inventory(args.inventory)
    manifest = build_manifest(
        inventory,
        args.engine,
        args.voice_name,
        args.bitrate,
        args.tempo,
        args.silence_ms,
        args.layout,
    )
    manifest_path = GENERATED_DIR / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✅ Wrote {manifest_path}")
    print(f"   packs: {len(manifest['packs'])}")
    print(f"   layout: {manifest['layout']}")
    print(f"   engine: {manifest['engine']}")
    print(f"   voice: {manifest['voice']}")


if __name__ == "__main__":
    main()
