# Portuguese `verbecc` Upstream Check + Bug Report

Goal:
- determine whether the Portuguese `pretérito perfeito` `nós` truncation bug is already fixed in newer upstream `verbecc`
- if not fixed, prepare and file a clean upstream bug report against `verbecc`

Context:
- Our Portuguese app had bad outputs like:
  - `contar` -> `nós cont`
  - `pensar` -> `nós pens`
  - `chegar` -> `nós cheg`
- We already patched our local generator as a product-side fix.
- The question now is whether upstream `verbecc` still has the bug.

Known local evidence:
- In our vendored copy:
  - `/Users/simeon/Desktop/proj1/verbecc`
- the bug reproduces through the conjugator itself, not just app UI
- malformed Portuguese template data was found in:
  - `/Users/simeon/Desktop/proj1/verbecc/verbecc/data/conjugations-pt.xml`
- we observed suspicious malformed `pretérito-perfeito` `nós` slot values like:
  - `)`
  - `r)`

Upstream to test:
- PyPI latest known version:
  - `verbecc 2.0.2`
- upstream repo:
  - [https://github.com/bretttolbert/verbecc](https://github.com/bretttolbert/verbecc)
- changelog:
  - [https://github.com/bretttolbert/verbecc/blob/main/CHANGELOG.md](https://github.com/bretttolbert/verbecc/blob/main/CHANGELOG.md)

Important:
- the changelog mentions Portuguese fixes in 2.0.1 and 2.0.2, but not this exact `pretérito-perfeito` `nós` bug
- do not assume it is fixed

## Tasks

### 1. Reproduce against modern upstream `verbecc`

Create a clean disposable environment and test the latest upstream/PyPI release, preferably `2.0.2`.

Test at least these verbs:
- `contar`
- `pensar`
- `chegar`
- `passar`
- `deixar`
- `ajudar`
- `cantar`
- `comprar`

For each verb, extract the Portuguese `indicativo` `pretérito-perfeito` `nós` form.

Need a concrete answer:
- fixed upstream
- still broken upstream
- or inconclusive due to install/runtime issue

If the new upstream is fixed:
- summarize exactly which version fixed it
- include concrete before/after evidence
- do not file a bug

If the new upstream is still broken:
- continue to step 2

### 2. Prepare and file an upstream bug report

If the bug still reproduces in current upstream:
- open a GitHub issue in the upstream repo:
  - [https://github.com/bretttolbert/verbecc/issues](https://github.com/bretttolbert/verbecc/issues)

The issue should include:
- short descriptive title
- reproducible example code
- observed outputs
- expected outputs
- note that this appears to come from Portuguese template/conjugation data, not downstream UI
- mention the suspicious malformed XML values in the local investigation if relevant, but clearly label that as local inspection evidence

Suggested issue shape:

Title:
- `Portuguese pretérito-perfeito 1st person plural (nós) forms truncate to stems for many verbs`

Body should cover:
- tested version of `verbecc`
- exact reproduction snippet
- list of affected verbs and outputs
- expected correct forms:
  - `contámos`
  - `pensámos`
  - `chegámos`
  - `passámos`
  - `deixámos`
  - `ajudámos`
  - `cantámos`
  - `comprámos`
- note whether all tested verbs were regular `-ar` verbs or whether the issue may be broader
- if appropriate, mention that local inspection found malformed Portuguese template values in `conjugations-pt.xml`

### 3. Return a useful handoff summary

At the end, report:
- exact version tested
- whether upstream is fixed
- if bug filed:
  - issue URL
  - final issue title
- if not filed:
  - why not

## Constraints

- research/test carefully before filing
- do not modify our app repos as part of this task
- do not touch `dist` / `dist-gh` / generated deploy outputs
- do not push or deploy anything in our repos
- respond in English

## Helpful local context

Our local Portuguese fix commit:
- `/Users/simeon/Desktop/portuguese-verbs`
- commit on `master`: `5223145`

Our local generator-side patch was:
- detect malformed Portuguese `preterite` `nós` outputs
- repair them deterministically:
  - `-ar` -> `ámos`
  - `-er` -> `emos`
  - `-ir` -> `imos`

That patch is only a downstream safety fix; this task is about upstream verification/reporting.
