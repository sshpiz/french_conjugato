const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
process.chdir(require('node:path').resolve(__dirname, '..'));
for(const repo of ['proj1','spanish-verbs','catalan-verbs']){const s=fs.readFileSync(repo+'/js/script.js','utf8');const ctx={};vm.createContext(ctx);vm.runInContext(s.slice(s.indexOf('function groupUsageEntries'),s.indexOf('function renderGroupedUsages')),ctx);const g=ctx.groupUsageEntries;
assert.equal(g([{pattern:'x',meaning_en:'a',example_fr:'Un exemple.'},{pattern:'x',meaning_en:'a',example_fr:'Un exemple.',example_en:'alternate'}])[0].examples.length,1);
assert.equal(g([{pattern:'x',meaning_en:'a'},{pattern:'x',meaning_en:'b'}]).length,2);
assert.equal(g([{pattern:'x',meaning_en:'a',example_fr:'A.'},{pattern:'x + object',example_fr:'A.'}]).length,1);
assert.equal(g([{pattern:'x',meaning_en:'a',example_fr:'A.'},{pattern:'x + object',example_fr:'B.'}]).length,2);
assert.equal(g([{pattern:'x',meaning_en:'a',example_fr:'A.'},{pattern:'x + object',notes:'Important',example_fr:'A.'}]).length,2);
console.log(repo,'grouping PASS');}
