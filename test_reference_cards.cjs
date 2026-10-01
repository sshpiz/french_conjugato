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
];
for(const [infinitive,tense,pronoun,conjugated,reference,expected] of cases) {
 const card = {verb:{infinitive},tense,pronoun,conjugated};
 const result=prepare(card,reference); assert.equal(result.conjugated,expected); assert.equal(card.conjugated,conjugated);
 assert.equal(prepare(result),result);
}
console.log(`PASS: ${cases.length} independently specified pronoun/tense/agreement cases.`);
