---
name: test-case-design
description: Design test cases from requirements or acceptance criteria using standard techniques, in the repo's test case format. Use when turning a story, bug or feature description into test cases, or when reviewing coverage of existing tests.
---

# Test case design

## Inputs you need before designing

- Business requirement and numbered acceptance criteria (from Jira via `atlassian-jira`, or from the user via the coordinator).
- Explicit out of scope.
- The test data available in the target environment.

If any of these are missing, write them as **open questions** in the Journal and stop. Designing against guessed requirements produces tests that confidently verify the wrong thing.

## Techniques: pick what fits, say which you used

- **Equivalence partitioning**: one case per class of input (valid coupon / expired / unknown / empty).
- **Boundary values**: min-1, min, max, max+1 for every numeric or length limit.
- **Decision table**: when the outcome depends on a combination of conditions (logged-in × has coupon × cart total threshold).
- **State transition**: for flows with states (cart → checkout → order received → cancelled).
- **Error guessing**: double submit, back button after submit, refresh mid-flow, session expiry.

Cover every acceptance criterion with at least one positive case; add negative cases for each validation rule. Then prune: one test per behaviour, not per data permutation. Use `@TestCase` data rows for permutations.

## Automation verdict per case

| Verdict | When |
|---|---|
| `automate-web` | Stable, repeatable, valuable as a regression check, and reachable through the UI in BELLATRIX |
| `automate-later` | Valuable but blocked (missing test data, missing page objects, or mobile: see the `appium-mcp` limits) |
| `manual/exploratory` | Visual judgement, one-off checks, or cost much higher than value |

## Format

One file per story in `qa/test-cases/<STORY-KEY or slug>.md`:

```md
# <STORY-KEY>: <story summary>
Source: <Jira link or task journal path>  |  Designed: <date>  |  Techniques: EP, BVA

## TC-<KEY>-01: <behaviour in one line>
- Covers: AC1
- Priority: High | Medium | Low
- Verdict: automate-web
- Preconditions: <state and data>
| # | Step | Data | Expected |
|---|---|---|---|
| 1 | Add "Falcon 9" to cart | | Cart shows 1 item |
| 2 | Apply coupon | happybirthday | "Coupon code applied successfully." |
```

Ids are stable once published. Never renumber; append new cases. The automation engineer references them with `// TC: TC-<KEY>-01`.

## Coverage table

End the file with a matrix of AC × test cases, so gaps are visible:

```md
| AC | TC-01 | TC-02 | TC-03 |
|---|---|---|---|
| AC1 | x | | |
| AC2 | | x | x |
```
