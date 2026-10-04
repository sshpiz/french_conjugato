import re,json,subprocess,collections
from pathlib import Path
root=Path(__file__).resolve().parents[1]
js="const fs=require('fs'),vm=require('vm'),c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/verbs.full.generated.js','utf8')+';globalThis.data={verbs,tenses}',c);console.log(JSON.stringify(c.data));"
data=json.loads(subprocess.check_output(['node','-e',js],cwd=root));verbs={v['infinitive']:v for v in data['verbs']}
records=[];seen=set();known=collections.defaultdict(list)
for b in (root/'_experiments/dicovalence_100625_utf8.txt').read_text().split('\n\n'):
 d={m[0]:m[1].strip() for m in re.findall(r'^([A-Z0-9_]+)\$\t(.*)$',b,re.M)}
 if 'VERB' not in d:continue
 v=d['VERB'].split('/')[-1];known[v].append(d.get('NUM'))
 if v not in verbs or d.get('VTYPE')!='predicator simple' or not d.get('VAL','').startswith(v+':'):continue
 # Require personal subject forms, excluding impersonal/thing-only senses.
 p0=d.get('P0','').split(', ')
 if 'je' not in p0 or 'nous' not in p0:continue
 val=d['VAL'].split(':',1)[1].strip()
 # Only bare P0 and selected complements; optional companions may be omitted.
 required=re.findall(r'\bP[A-Z0-9]+(?:<[^>]+>)?',re.sub(r'\([^)]*\)','',val))
 def terms(p):return set(d.get(p,'').split(', '))
 def allowed(fields):return all(x=='P0' or x in fields for x in required)
 p1,p2,p3,pl=map(terms,['P1','P2','P3','PL'])
 frames=[]
 if d.get('AUX')=='avoir' and {'le','la','les'}<=p1 and allowed(['P1']):
  if 'ça' in p1 or 'ceci' in p1:frames.append(('direct','quelque chose','le/la/les'))
  if {'te','vous'}<=p1:frames.append(('person','quelqu’un','me/te/nous/vous/le/la/les'))
 if allowed(['P2']):
  if {'lui','leur'}<=p2:frames.append(('indirect','à quelqu’un','me/te/nous/vous/lui/leur'))
  if 'y' in p2 and ('ça' in p2 or 'ceci' in p2):frames.append(('y','à quelque chose','y'))
 if allowed(['P3']) and 'en' in p3 and ('ça' in p3 or 'ceci' in p3):frames.append(('en','de quelque chose','en'))
 if allowed(['PL']) and 'y' in pl:frames.append(('place','quelque part','y'))
 if d.get('AUX')=='avoir' and {'le','la','les'}<=p1 and ('ça' in p1 or 'ceci' in p1) and {'lui','leur'}<=p2 and allowed(['P1','P2']):frames.append(('double','quelque chose à quelqu’un','le/la/les + lui/leur/me/te/nous/vous'))
 for typ,tail,targets in frames:
  # Preserve distinct senses where they affect recipient/object behavior; one
  # example per verb/type suffices for the first mechanical rollout.
  key=(v,typ)
  if key in seen:continue
  seen.add(key)
  records.append({'verb':v,'type':typ,'pattern':v+' '+tail,'gloss':d['TR_EN'],'example':d['EG'],'sourceId':d['NUM'],'targets':targets,'sourceFrame':d['FRAME'],'sourceValency':d['VAL'],'auxiliary':d['AUX']})
print('records',len(records),'verbs',len(set(r['verb'] for r in records)),collections.Counter(r['type']for r in records))
(root/'data/pronoun-constructions/candidates.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
(root/'data/pronoun-constructions/source-index.json').write_text(json.dumps(known,ensure_ascii=False))

# Activation requires an independently reviewed, exact construction as well as
# DICOVALENCE's explicit pronoun inventory. Unmatched candidates stay in audit.
lookup={(r['verb'],r['type']):r for r in records}
accepted=[];keys=set();rejected=[]
tails={'quelque chose':'direct',"quelqu'un":'person',"à quelqu'un":'indirect','à quelque chose':'y','de quelque chose':'en',"quelque chose à quelqu'un":'double'}
for entry in json.loads((root/'verb_core_patterns.json').read_text()):
 v=entry['verb']
 for pattern in entry['core_patterns']:
  drill=pattern.get('drill_pattern',{});text=drill.get('text','')
  if not drill.get('verification') or not text.startswith(v+' '):continue
  typ=tails.get(text[len(v)+1:].replace('’',"'"));key=(v,typ)
  if key not in lookup or key in keys:continue
  record=lookup[key];reason=None
  # Keep the runtime mechanical: no auxiliary conversion or defective tables.
  for tense,table in data['tenses'].items():
   rows=table.get(v,{})
   if len(rows)!=6 or any(not f or f=='—' for f in rows.values()):reason='incomplete paradigm';break
   if tense in ['passeCompose','plusQueParfait'] and record['auxiliary']=='avoir':
    first=rows.get('je','')
    if not re.match(r"^j['’](ai|avais) ",first):reason='auxiliary mismatch';break
  if reason:rejected.append({'verb':v,'type':typ,'reason':reason});continue
  keys.add(key)
  accepted.append({**record,'pattern':text,'gloss':drill['meaning_en'],
    'example':pattern.get('example_fr',record['example']),
    'exampleEnglish':pattern.get('example_en',''),
    'verification':drill['verification']})
out=root/'data/pronoun-constructions'
(out/'enabled.json').write_text(json.dumps(accepted,ensure_ascii=False,indent=2)+'\n')
(out/'deferred.json').write_text(json.dumps(rejected,ensure_ascii=False,indent=2)+'\n')
byverb=collections.defaultdict(list)
for r in accepted:byverb[r['verb']].append(r['type'])
audit=[{'verb':v,'enabledTypes':byverb[v],
 'status':'enabled-source-intersection' if byverb[v] else 'candidate-needs-review' if any(r['verb']==v for r in records) else 'source-needs-classification' if v in known else 'no-matching-source',
 'sourceIds':known.get(v,[])} for v in verbs]
(out/'coverage.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
compact=[{k:r[k] for k in ['verb','type','pattern','gloss','example','exampleEnglish','sourceId']} for r in accepted]
(root/'js/referenceInventory.js').write_text('/* Generated by scripts/audit_french_pronoun_inventory.py. See data/pronoun-constructions for provenance. */\nwindow.frenchReferenceInventory = '+json.dumps(compact,ensure_ascii=False,separators=(',',':'))+';\n')
print('Enabled',len(accepted),'constructions /',sum(bool(t) for t in byverb.values()),'verbs; deferred',len(rejected))
print(collections.Counter(a['status'] for a in audit))
