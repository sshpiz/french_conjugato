const fs = require('fs'), vm = require('vm'), assert = require('assert/strict');
const context = { window: {} }; vm.createContext(context);
vm.runInContext(fs.readFileSync('js/referenceCards.js','utf8'), context);
const prepare = context.window.referenceCards.prepare;
const cases = [
 ['chercher','present','je','je cherche','ce truc','je le cherche'],
 ['chercher','present','je','je cherche','cette chose','je la cherche'],
 ['chercher','present','nous','nous cherchons','ces choses','nous les cherchons'],
 ['aimer','present','je',"j'aime",'cette chose',"je l'aime"],
 ['voir','passeCompose','je',"j'ai vu",'cette chose',"je l'ai vue"],
 ['prendre','plusQueParfait','tu','tu avais pris','ces choses','tu les avais prises'],
 ['chercher','passeCompose','je',"j'ai cherché",'ces choses',"je les ai cherchées"],
 ['penser','imparfait','je','je pensais','cette chose',"j'y pensais"],
 ['parler','futurSimple','nous','nous parlerons','ces choses','nous en parlerons'],
 ['avoir besoin','present','je',"j'ai besoin de quelque chose",'cette chose',"j'en ai besoin"],
 ['avoir envie','passeCompose','je',"j'ai eu envie de quelque chose",'ce truc',"j'en ai eu envie"],
 ['faire attention','subjonctifPresent','tu','tu fasses attention à quelque chose','ce truc','tu y fasses attention'],
 ['aller','present','je','je vais','cet endroit',"j'y vais"],
 ['aller','passeCompose','elles','elles sont allées','cet endroit','elles y sont allées'],
 ['parler','present','je','je parle','cet homme','je lui parle'],
 ['parler','present','je','je parle','cette femme','je lui parle'],
 ['parler','present','je','je parle','ces hommes','je leur parle'],
 ['parler','present','je','je parle','ces femmes','je leur parle'],
 ['répondre','present','je','je réponds','cette chose',"j'y réponds"],
 ['répondre','present','je','je réponds','cette femme','je lui réponds'],
 ['répondre','passeCompose','elle','elle a répondu','ces femmes','elle leur a répondu'],
 ['écrire','passeCompose','je',"j'ai écrit",'cette femme',"je lui ai écrit"],
 ['écrire','plusQueParfait','nous','nous avions écrit','ces femmes','nous leur avions écrit'],
 ['téléphoner','futurSimple','tu','tu téléphoneras','ces hommes','tu leur téléphoneras'],
 ['sourire','subjonctifPresent','nous','nous souriions','cet homme','nous lui souriions'],
 ['penser','present','je','je pense','cet homme','je pense à lui'],
 ['penser','present','je','je pense','cette femme','je pense à elle'],
 ['penser','present','je','je pense','ces hommes','je pense à eux'],
 ['penser','present','je','je pense','ces femmes','je pense à elles'],
 ['penser','passeCompose','je',"j'ai pensé",'cette femme',"j'ai pensé à elle"],
 ['penser','plusQueParfait','je',"j'avais pensé",'ces femmes',"j'avais pensé à elles"],
 ['penser','futurSimple','nous','nous penserons','ces hommes','nous penserons à eux'],
 ['penser','conditionnelPresent','tu','tu penserais','cette femme','tu penserais à elle'],
 ['penser','subjonctifPresent','elle','elle pense','cet homme','elle pense à lui'],
 ['faire attention','present','je','je fais attention à quelque chose','cette femme','je fais attention à elle'],
 ['faire attention','passeCompose','je',"j'ai fait attention à quelque chose",'ces hommes',"j'ai fait attention à eux"],
 ['songer','present','je','je songe','cette femme','je songe à elle'],
 ['songer','present','je','je songe','ce truc',"j'y songe"],
 ['tenir','present','je','je tiens','ces hommes','je tiens à eux'],
 ['tenir','imparfait','tu','tu tenais','cette chose','tu y tenais'],
 ['renoncer','passeCompose','je',"j'ai renoncé",'cette femme',"j'ai renoncé à elle"],
 ['renoncer','present','nous','nous renonçons','ces choses','nous y renonçons'],
 ['recourir','present','nous','nous recourons','cet homme','nous recourons à lui'],
 ['recourir','futurSimple','je','je recourrai','ce truc',"j'y recourrai"],
];
for(const [infinitive,tense,pronoun,conjugated,reference,expected] of cases) {
 const card = {verb:{infinitive},tense,pronoun,conjugated};
 const result=prepare(card,reference); assert.equal(result.conjugated,expected); assert.equal(card.conjugated,conjugated);
 assert.equal(prepare(result),result);
}
console.log(`PASS: ${cases.length} independently specified pronoun/tense/agreement cases.`);

assert.equal(prepare({verb:{infinitive:'parler'},tense:'present',pronoun:'je',conjugated:'je parle'},'cette femme').referenceLabel,'parler à');
assert(context.window.referenceCards.referencesFor('penser').includes('cet homme'));

for (const [verb, tense, pronoun, conjugated, reference, expected] of [
 ['acheter','present','je',"j'achète",'cette chose',"je l'achète"],
 ['résoudre','passeCompose','nous','nous avons résolu','ces choses','nous les avons résolues'],
 ['détruire','passeCompose','elle','elle a détruit','cette chose',"elle l'a détruite"],
 ['dépendre','present','je','je dépends','cette chose',"j'en dépends"],
 ['participer','imparfait','vous','vous participiez','ces choses','vous y participiez']
]) assert.equal(prepare({verb:{infinitive:verb},tense,pronoun,conjugated},reference).conjugated,expected);
assert(Object.keys(context.window.referenceCards.specs).length >= 130);
console.log('PASS expanded direct, en/y and participle agreement cases');
