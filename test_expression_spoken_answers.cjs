const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('js/script.js','utf8');
const fn=source.slice(source.indexOf('function expressionSpokenAnswerVariants('),source.indexOf('function normalizeCardTypeMode('));
const context={};vm.createContext(context);vm.runInContext(fn,context);
const card={verb:{verbExpression:true}};
const variants=text=>Array.from(context.expressionSpokenAnswerVariants(card,text));
assert(variants("j'ai besoin de quelque chose").includes("j'ai besoin"));
assert(variants("j'ai besoin de quelque chose").includes("j'ai besoin de"));
assert(variants("tu fais attention à quelque chose").includes('tu fais attention'));
assert(variants("elle en veut à quelqu’un").includes('elle en veut'));
assert(variants("nous prenons quelque chose en compte").includes('nous prenons en compte'));
assert(variants("tu donnes quelque chose à quelqu'un").includes('tu donnes'));
assert(!variants("tu as besoin de quelque chose").includes("tu avais besoin"));
assert(!variants("elle en veut à quelqu'un").includes('elle veut'));
assert(!variants("nous prenons quelque chose en compte").includes('nous prenons'));
assert.deepEqual(variants('tu as vingt ans'),['tu as vingt ans']);
for(const other of [{verb:{}},{verb:{verbExpression:true},reference:'cette chose'},{...card,isFrameCard:true}]) {
 assert.deepEqual(Array.from(context.expressionSpokenAnswerVariants(other,"j'ai besoin de quelque chose")),["j'ai besoin de quelque chose"]);
}
console.log('PASS: optional generic arguments; prepositions, idiom words, pronouns and tense remain constrained.');

assert.equal(context.expressionAnswerText(card, "j'ai peur de quelque chose"), "j'ai peur");
assert.equal(context.expressionAnswerText(card, "tu fais attention à quelqu'un"), "tu fais attention");
assert.equal(context.expressionAnswerText(card, "nous mettons quelque chose au point"), "nous mettons au point");
assert.equal(context.expressionAnswerText(card, "elle en veut à quelqu’un"), "elle en veut");
assert.equal(context.expressionAnswerText(card, "tu as vingt ans"), "tu as vingt ans");
assert.equal(context.expressionAnswerText({...card, reference: 'cette chose'}, "il a besoin de quelque chose"), "il a besoin de quelque chose");
console.log('PASS: concise expression answers retain essential idiom words and reference cards.');
