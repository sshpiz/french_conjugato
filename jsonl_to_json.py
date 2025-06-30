import json

input_file = "sentences.jsonl"
output_file = "js/sentences.js"

with open(input_file, "r", encoding="utf-8") as fin:
    data = [json.loads(line) for line in fin if line.strip()]

with open(output_file, "w", encoding="utf-8") as fout:
    fout.write("const sentences = ")
    json.dump(data, fout, ensure_ascii=False, indent=2)
    fout.write(";")  # Close the JS statement

print(f"Converted {len(data)} entries to {output_file}")
