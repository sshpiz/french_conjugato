Browser regression suites for the five-app tense-usage rollout.
Run verify.cjs against the isolated preview server on port 8876 (PREVIEW_URL can override). Routes: proj1/french/, spanish-verbs/, catalan-verbs/, portuguese-verbs/, italian-verbs/.
The French repository and spanish-verbs must be siblings for the missing-metadata/storage edge-case fixture. Set PLAYWRIGHT_PATH to a Playwright module if needed; Chrome is required.
verify_integration.cjs checks French welcome-back thresholds and actual French/Italian integration at the same server.
Covers first encounter, dismissal, reload persistence, language isolation, reset, Details reopening, Read more, metadata coverage, mobile fit and share alignment.
