# Mistral Small French Complement Gold Set

Use this to test whether a local model can distinguish learner-relevant
verb-selected `à/de` complements from bad or irrelevant ones.

Prompt template:

```text
For the sentence below, answer only:
yes
no

Question:
Is the highlighted prepositional phrase part of the verb's core meaning, rather than a place, time, manner, or other loose modifier?

Sentence: ...
Target phrase: ...
```

## Gold Cases

1. Good `à`
- Sentence: `Je pense à ce projet.`
- Target phrase: `à ce projet`
- Expected: `yes`
- Why: core `penser à`

2. Bad `à` place
- Sentence: `Je travaille à Paris.`
- Target phrase: `à Paris`
- Expected: `no`
- Why: location, not target complementation

3. Bad `à` time
- Sentence: `Je mange à midi.`
- Target phrase: `à midi`
- Expected: `no`
- Why: time adjunct

4. Good `à`
- Sentence: `Je parle à Paul.`
- Target phrase: `à Paul`
- Expected: `yes`
- Why: core `parler à`

5. Bad `à` place on noun
- Sentence: `Je vois un film au cinéma.`
- Target phrase: `au cinéma`
- Expected: `no`
- Why: location of event, not verb complement

6. Good `de`
- Sentence: `Nous parlons de ce film.`
- Target phrase: `de ce film`
- Expected: `yes`
- Why: core `parler de`

7. Good `de`
- Sentence: `Cela dépend de cette décision.`
- Target phrase: `de cette décision`
- Expected: `yes`
- Why: core `dépendre de`

8. Bad `de` manner
- Sentence: `Elle pense de manière réfléchie.`
- Target phrase: `de manière réfléchie`
- Expected: `no`
- Why: manner phrase, not `penser de`

9. Shaky / should reject
- Sentence: `Elle pense de ce film.`
- Target phrase: `de ce film`
- Expected: `no`
- Why: not a strong learner-facing modern example

10. Good `à`
- Sentence: `Elle tient à son amie.`
- Target phrase: `à son amie`
- Expected: `yes`
- Why: core `tenir à`

11. Good `de`
- Sentence: `Paul tient de sa mère.`
- Target phrase: `de sa mère`
- Expected: `yes`
- Why: core `tenir de`

12. Bad fixed-ish / not target
- Sentence: `Je garde cela à l'esprit.`
- Target phrase: `à l'esprit`
- Expected: `no`
- Why: lexicalized expression, not target deck
