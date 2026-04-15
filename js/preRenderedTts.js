(function () {
  const MANIFEST_URL = 'tts/manifest.json';
  const CACHE_NAME = 'french-packed-tts-cache';
  const ENABLED_KEY = 'preRenderedFrenchTtsEnabled';
  const DOWNLOAD_MODE_KEY = 'preRenderedFrenchTtsDownloadMode';
  const MANIFEST_VERSION_KEY = 'preRenderedFrenchTtsManifestVersion';
  const CUMULATIVE_DOWNLOAD_TIERS = ['top20', 'top100', 'top500', 'top1000'];
  const FREQUENCY_ORDER = ['top20', 'top50', 'top100', 'top500', 'top1000', 'rare'];

  let manifestPromise = null;
  let manifestData = null;
  let packIndex = new Map();
  let bufferPromises = new Map();
  let packPromises = new Map();
  let audioContext = null;
  let currentSource = null;

  function appLog(message) {
    if (typeof window.appLog === 'function') {
      window.appLog(`packed-tts ${message}`);
    }
  }

  function isEnabled() {
    return localStorage.getItem(ENABLED_KEY) === 'true';
  }

  function setEnabled(enabled) {
    localStorage.setItem(ENABLED_KEY, enabled ? 'true' : 'false');
    appLog(`enabled=${enabled ? 'true' : 'false'}`);
  }

  function getDownloadMode() {
    return localStorage.getItem(DOWNLOAD_MODE_KEY) || 'none';
  }

  function setDownloadMode(mode) {
    localStorage.setItem(DOWNLOAD_MODE_KEY, mode);
    appLog(`download-mode=${mode}`);
  }

  async function getAudioContext() {
    if (!audioContext) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) {
        throw new Error('Web Audio API unavailable');
      }
      audioContext = new Ctor();
    }
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    return audioContext;
  }

  async function openCache() {
    if (!('caches' in window)) {
      return null;
    }
    return caches.open(CACHE_NAME);
  }

  function packUrl(pack) {
    return `tts/${pack.file}`;
  }

  function itemUrl(item) {
    return item && item.file ? `tts/${item.file}` : null;
  }

  function isClipLayout(manifest) {
    return manifest && manifest.layout === 'clips';
  }

  async function syncManifestVersion(version) {
    const existing = localStorage.getItem(MANIFEST_VERSION_KEY);
    if (existing && existing !== version && 'caches' in window) {
      await caches.delete(CACHE_NAME);
      bufferPromises.clear();
      appLog(`cache-reset old=${existing} new=${version}`);
    }
    localStorage.setItem(MANIFEST_VERSION_KEY, version);
  }

  function buildPackIndex(manifest) {
    packIndex = new Map();
    Object.entries(manifest.packs || {}).forEach(([packId, pack]) => {
      Object.keys(pack.items || {}).forEach((itemId) => {
        packIndex.set(itemId, packId);
      });
    });
  }

  async function loadManifest() {
    if (window.location && window.location.protocol === 'file:') {
      const error = new Error('Packaged French audio cannot load from file://. Use http(s) or a local server.');
      appLog(`manifest-error message="${error.message}"`);
      throw error;
    }
    if (manifestData) return manifestData;
    if (!manifestPromise) {
      manifestPromise = (async () => {
        const cache = await openCache();
        let response = null;
        try {
          response = await fetch(MANIFEST_URL, { cache: 'no-store' });
          if (!response.ok) {
            throw new Error(`manifest fetch failed: ${response.status}`);
          }
          if (cache) {
            await cache.put(MANIFEST_URL, response.clone());
          }
        } catch (error) {
          const cached = cache ? await cache.match(MANIFEST_URL) : null;
          if (!cached) {
            throw error;
          }
          response = cached;
          appLog('manifest-cache-hit');
        }
        return response.json();
      })()
        .then(async (manifest) => {
          manifestData = manifest;
          buildPackIndex(manifest);
          await syncManifestVersion(manifest.version);
          appLog(`manifest-loaded version=${manifest.version} layout=${manifest.layout || 'packed'}`);
          return manifestData;
        })
        .catch((error) => {
          appLog(`manifest-error message="${error.message}"`);
          throw error;
        });
    }
    return manifestPromise;
  }

  async function ensureAssetCached(url, logKey) {
    const cache = await openCache();
    const cached = cache ? await cache.match(url) : null;
    if (cached) {
      appLog(`cache-hit ${logKey}`);
      return cached;
    }

    appLog(`download-start ${logKey}`);
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      appLog(`download-fail ${logKey} status=${response.status}`);
      throw new Error(`asset fetch failed: ${response.status}`);
    }
    if (cache) {
      await cache.put(url, response.clone());
    }
    appLog(`download-success ${logKey}`);
    return response;
  }

  async function isPackCached(packId) {
    const manifest = await loadManifest();
    const pack = manifest.packs[packId];
    if (!pack) return false;
    const cache = await openCache();
    if (!cache) return false;
    if (isClipLayout(manifest)) {
      const itemFiles = [...new Set(Object.values(pack.items || {}).map((item) => item.file).filter(Boolean))];
      for (const file of itemFiles) {
        const match = await cache.match(`tts/${file}`);
        if (!match) return false;
      }
      return itemFiles.length > 0;
    }
    const match = await cache.match(packUrl(pack));
    return !!match;
  }

  async function isAudioIdAvailable(itemId) {
    const manifest = await loadManifest();
    const packId = packIndex.get(itemId);
    if (!packId) return false;
    const pack = manifest.packs[packId];
    if (!pack || !pack.items || !pack.items[itemId]) return false;
    if (isClipLayout(manifest)) {
      const cache = await openCache();
      if (!cache) return false;
      const url = itemUrl(pack.items[itemId]);
      if (!url) return false;
      return !!(await cache.match(url));
    }
    return isPackCached(packId);
  }

  async function ensurePackCached(packId) {
    const manifest = await loadManifest();
    const pack = manifest.packs[packId];
    if (!pack) {
      throw new Error(`unknown pack: ${packId}`);
    }
    if (await isPackCached(packId)) {
      return true;
    }
    if (!packPromises.has(packId)) {
      packPromises.set(packId, (async () => {
        try {
          if (isClipLayout(manifest)) {
            const itemFiles = [...new Set(Object.values(pack.items || {}).map((item) => item.file).filter(Boolean))];
            appLog(`download-start pack=${packId}`);
            for (const file of itemFiles) {
              await ensureAssetCached(`tts/${file}`, `file=${file}`);
            }
            appLog(`download-success pack=${packId}`);
            return true;
          }
          const url = packUrl(pack);
          await ensureAssetCached(url, `pack=${packId}`);
          return true;
        } finally {
          packPromises.delete(packId);
        }
      })());
    }
    return packPromises.get(packId);
  }

  async function prefetchAudioId(itemId) {
    const manifest = await loadManifest();
    const packId = packIndex.get(itemId);
    if (!packId || !manifest.packs[packId]) {
      return false;
    }
    await ensurePackCached(packId);
    return true;
  }

  async function getDecodedAsset(cacheKey, url) {
    if (!bufferPromises.has(cacheKey)) {
      bufferPromises.set(
        cacheKey,
        (async () => {
          const response = await ensureAssetCached(url, cacheKey);
          const arrayBuffer = await response.arrayBuffer();
          const ctx = await getAudioContext();
          return ctx.decodeAudioData(arrayBuffer.slice(0));
        })().catch((error) => {
          bufferPromises.delete(cacheKey);
          throw error;
        })
      );
    }
    return bufferPromises.get(cacheKey);
  }

  async function playAudioId(itemId) {
    if (!isEnabled()) return false;
    const manifest = await loadManifest();
    const packId = packIndex.get(itemId);
    if (!packId) {
      appLog(`lookup-miss id=${itemId}`);
      return false;
    }

    const pack = manifest.packs[packId];
    const item = pack && pack.items && pack.items[itemId];
    if (!item) {
      appLog(`item-miss id=${itemId} pack=${packId}`);
      return false;
    }

    let buffer;
    let start = item.start || 0;
    let end = item.end || 0;

    if (item.file) {
      const url = itemUrl(item);
      if (!url) return false;
      buffer = await getDecodedAsset(`item=${itemId}`, url);
      start = 0;
      end = buffer.duration;
    } else {
      await ensurePackCached(packId);
      buffer = await getDecodedAsset(`pack=${packId}`, packUrl(pack));
    }

    const ctx = await getAudioContext();
    if (currentSource) {
      try {
        currentSource.stop();
      } catch (error) {
        appLog(`stop-error message="${error.message}"`);
      }
      currentSource = null;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
      if (currentSource === source) {
        currentSource = null;
      }
    };

    currentSource = source;
    const duration = Math.max(0, end - start);
    if (item.file) {
      appLog(`play id=${itemId} pack=${packId} file=${item.file}`);
    } else {
      appLog(`play id=${itemId} pack=${packId} start=${start.toFixed(3)} end=${end.toFixed(3)}`);
    }
    source.start(0, start, duration);
    return true;
  }

  function stopPlayback() {
    if (currentSource) {
      try {
        currentSource.stop();
      } catch (error) {
        appLog(`stop-error message="${error.message}"`);
      }
      currentSource = null;
    }
  }

  async function listPackIds(filterFn) {
    const manifest = await loadManifest();
    return Object.entries(manifest.packs || {})
      .filter((entry) => (filterFn ? filterFn(entry[1], entry[0]) : true))
      .map(([packId]) => packId);
  }

  async function prefetchPack(packId) {
    await ensurePackCached(packId);
    return true;
  }

  async function prefetchPacks(packIds, onProgress) {
    let completed = 0;
    for (const packId of packIds) {
      await ensurePackCached(packId);
      completed += 1;
      if (typeof onProgress === 'function') {
        onProgress({ completed, total: packIds.length, packId });
      }
    }
    return true;
  }

  async function prefetchTop20(onProgress) {
    return downloadTier('top20', onProgress);
  }

  function getIncludedFrequenciesForTier(tier) {
    if (tier === 'rare') {
      return ['rare'];
    }
    if (!CUMULATIVE_DOWNLOAD_TIERS.includes(tier)) {
      throw new Error(`unsupported download tier: ${tier}`);
    }
    const cutoff = tier === 'top20' ? 'top20' : tier;
    const included = [];
    for (const frequency of FREQUENCY_ORDER) {
      if (frequency === 'rare') break;
      included.push(frequency);
      if (frequency === cutoff) break;
    }
    return included;
  }

  async function downloadTier(tier, onProgress) {
    const included = getIncludedFrequenciesForTier(tier);
    const frequencySet = new Set(included);
    const packIds = await listPackIds((pack, packId) => packId === 'shared' || frequencySet.has(pack.frequency));
    await prefetchPacks(packIds, onProgress);
    setDownloadMode(tier);
    appLog(`download-tier tier=${tier} packs=${packIds.length}`);
    return true;
  }

  async function downloadAllAudio(onProgress) {
    const packIds = await listPackIds();
    await prefetchPacks(packIds, onProgress);
    setDownloadMode('full');
    return true;
  }

  async function removeAllAudio() {
    if ('caches' in window) {
      await caches.delete(CACHE_NAME);
    }
    bufferPromises.clear();
    stopPlayback();
    setDownloadMode('none');
    appLog('cache-cleared');
  }

  async function getStatus() {
    try {
      const manifest = await loadManifest();
      const packIds = Object.keys(manifest.packs || {});
      let cached = 0;
      for (const packId of packIds) {
        if (await isPackCached(packId)) {
          cached += 1;
        }
      }
      return {
        enabled: isEnabled(),
        mode: getDownloadMode(),
        manifestVersion: manifest.version,
        layout: manifest.layout || 'packed',
        availableFrequencies: manifest.included_frequencies || [],
        totalPacks: packIds.length,
        cachedPacks: cached,
        ready: cached > 0,
      };
    } catch (error) {
      return {
        enabled: isEnabled(),
        mode: getDownloadMode(),
        error: error.message,
        layout: 'unknown',
        availableFrequencies: [],
        totalPacks: 0,
        cachedPacks: 0,
        ready: false,
      };
    }
  }

  window.preRenderedFrenchTts = {
    loadManifest,
    isEnabled,
    setEnabled,
    getDownloadMode,
    setDownloadMode,
    isAudioIdAvailable,
    playAudioId,
    stopPlayback,
    prefetchPack,
    prefetchAudioId,
    prefetchTop20,
    downloadTier,
    downloadAllAudio,
    removeAllAudio,
    getStatus,
  };
})();
