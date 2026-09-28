# AI Frame Audit

- Total cards inspected: `885`
- Flagged AI cards: `17`
- Removed from deck on this pass: `17`

## Reason Counts

- `bad_de_object_formula`: `1`
- `combo_a_no_clear_recipient`: `13`
- `combo_a_place_or_thing_adjunct`: `7`
- `combo_a_time_adjunct`: `1`
- `edge_learner_lemma`: `1`
- `quarantined_lemma`: `1`
- `weak_a_object`: `1`

## Flagged Cards

- `accompagner` `combo_a` `Je l'accompagne à la gare` -> `accompagne à` [combo_a_no_clear_recipient, combo_a_place_or_thing_adjunct]
- `accélérer` `a_object` `J'accélère à ce rythme` -> `accélère à` [weak_a_object]
- `aider` `combo_a` `Je l'aide à finir` -> `l'aide à` [combo_a_no_clear_recipient]
- `appeler` `combo_a` `Je l'appelle à huit heures` -> `l'appelle à` [combo_a_no_clear_recipient, combo_a_time_adjunct]
- `approprier` `direct_object` `J'approprie ce style à mon projet` -> `approprie` [quarantined_lemma]
- `attirer` `combo_a` `Il l'attire à la soirée` -> `attire à` [combo_a_no_clear_recipient, combo_a_place_or_thing_adjunct]
- `autopsier` `direct_object` `Le médecin autopsie le corps ce matin` -> `autopsie` [edge_learner_lemma]
- `commander` `combo_a` `Je le commande à la boutique` -> `commande à` [combo_a_no_clear_recipient, combo_a_place_or_thing_adjunct]
- `consacrer` `combo_a` `Je le consacre à mon projet` -> `consacre à` [combo_a_no_clear_recipient, combo_a_place_or_thing_adjunct]
- `déposer` `combo_a` `Je le dépose à la gare` -> `dépose à` [combo_a_no_clear_recipient, combo_a_place_or_thing_adjunct]
- `faire` `de_object` `Ça ne fait de doute pour personne` -> `fait de` [bad_de_object_formula]
- `lier` `combo_a` `Je la lie à cette idée` -> `lie à` [combo_a_no_clear_recipient, combo_a_place_or_thing_adjunct]
- `préférer` `combo_a` `Je le préfère à la soupe` -> `préfère à` [combo_a_no_clear_recipient]
- `reconnaître` `combo_a` `Je le reconnais à sa voix` -> `reconnais à` [combo_a_no_clear_recipient]
- `remplacer` `combo_a` `Je le remplace à la réunion` -> `remplace à` [combo_a_no_clear_recipient, combo_a_place_or_thing_adjunct]
- `revenir` `combo_a` `Il revient au jury de choisir` -> `revient au` [combo_a_no_clear_recipient]
- `se mettre` `combo_a` `Je me le mets à côté` -> `mets à` [combo_a_no_clear_recipient]
