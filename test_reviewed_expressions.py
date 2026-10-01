import unittest
import generate_french_verb_expressions as expressions

class ReviewedExpressions(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.tables=expressions.extract_const(expressions.VERB_DATA_PATH.read_text(),'tenses')
 def generated(self,lemma):
  spec=next(row for row in expressions.EXPRESSIONS if row['expression']==lemma)
  result=expressions.build_expression_forms(self.tables,spec)
  for tense,forms in result.items():self.assertEqual(forms,self.tables[tense][lemma])
  return result
 def test_not_caring_uses_fichu_not_the_other_ficher_participle(self):
  forms=self.generated("s'en ficher")
  self.assertEqual(forms['passeCompose']['je'],"je m'en suis fichu")
  self.assertEqual(forms['passeCompose']['nous'],'nous nous en sommes fichus')
  self.assertEqual(forms['plusQueParfait']['ils/elles'],"ils s'en étaient fichus")
 def test_se_rappeler_keeps_following_direct_object_agreement(self):
  forms=self.generated('se rappeler')
  self.assertEqual(forms['passeCompose']['nous'],'nous nous sommes rappelé')
  self.assertEqual(forms['plusQueParfait']['tu'],"tu t'étais rappelé")
 def test_impressing_others_is_not_reflexive(self):
  forms=self.generated('en mettre plein la vue')
  self.assertEqual(forms['passeCompose']['je'],"j'en ai mis plein la vue")
  self.assertEqual(forms['present']['nous'],'nous en mettons plein la vue')
if __name__=='__main__':unittest.main()
