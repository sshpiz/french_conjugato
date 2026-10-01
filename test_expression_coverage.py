import json
import unittest
import generate_french_verb_expressions as e

class ExpressionCoverage(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  source=e.VERB_DATA_PATH.read_text()
  cls.verbs={v['infinitive']:v for v in e.extract_const(source,'verbs')}
  cls.tenses=e.extract_const(source,'tenses')
  cls.usages=json.loads(e.USAGES_JSON_PATH.read_text())
 def test_inventory(self):
  names=[s['expression'] for s in e.EXPRESSIONS]
  self.assertEqual(len(names),len(set(names)))
  for spec in e.EXPRESSIONS:
   lemma=spec['expression']
   with self.subTest(lemma=lemma):
    self.assertTrue(self.verbs[lemma]['verbExpression'])
    self.assertEqual(self.verbs[lemma]['expressionOf'],spec['base'])
    self.assertTrue(any(u['verb']==lemma and ((u.get('example_fr') and u.get('example_en')) or u.get('construction_review')) for u in self.usages))
    for tense,forms in e.build_expression_forms(self.tenses,spec).items():
     self.assertEqual(self.tenses[tense][lemma],forms)
     self.assertTrue(all(isinstance(f,str) and f.strip() for f in forms.values()))
     if 'il/elle/on' in forms:self.assertIn('elle',forms)
 def test_compound_agreement(self):
  cases=[('passer un examen','elle',"elle a passé un examen"),('passer du temps','nous','nous avons passé du temps à faire quelque chose'),('avoir besoin','je',"j'ai eu besoin de quelque chose"),('faire attention','nous','nous avons fait attention à quelque chose'),('se rendre compte','elle',"elle s'est rendu compte de quelque chose"),('se rendre compte','elles','elles se sont rendu compte de quelque chose'),("s'y prendre",'elle',"elle s'y est prise"),("s'y prendre",'elles',"elles s'y sont prises"),('se faire du souci','elles','elles se sont fait du souci'),('se poser une question','elles','elles se sont posé une question'),('se mettre au travail','elles','elles se sont mises au travail'),('tomber en panne','elle','elle est tombée en panne'),('se rappeler','elle',"elle s'est rappelé")]
  for lemma,subject,expected in cases:
   with self.subTest(lemma=lemma,subject=subject):self.assertEqual(self.tenses['passeCompose'][lemma][subject],expected)
 def test_subject_restrictions(self):
  for lemma in ['avoir lieu','prendre fin','aller de soi']:
   for tense in self.tenses.values():self.assertNotIn('je',tense[lemma])
 def test_families_and_definitions(self):
  def load(path,name):return json.loads(path.read_text().split('window.'+name+' = ',1)[1].strip().removesuffix(';'))
  families=load(e.ROOT/'js/wordFamilies.fr.js','VF_WORD_FAMILIES')
  defs=load(e.ROOT/'js/wordFamilyDefinitions.fr.js','VF_FAMILY_DEFINITIONS')
  records={r['lemma']:r for r in families['records']}
  for spec in e.EXPRESSIONS:
   record=records[spec['expression']]
   self.assertEqual(record['familyOf'],spec['base'])
   self.assertIn(spec['base'],record['verbs'])
   for group in ['verbs','nouns','adjectives','adverbs']:
    for word in record[group]:self.assertTrue(defs[group][word]['definition'])
if __name__=='__main__':unittest.main()
