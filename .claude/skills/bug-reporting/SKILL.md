---
name: bug-reporting
description: Record a suspected or confirmed defect with steps to reproduce, in the bug tracker when one is connected and the write is approved, otherwise in the task journal's Defects section, and handle the affected test case (expected value + @Ignore). Use whenever exploration, a run or a review shows behaviour that contradicts a requirement, a test case, or what the product itself claims.
---

# Bug reporting

A defect is behaviour that contradicts a requirement, an acceptance criterion, a test case, or what the product itself claims (page text, labels, prices, promotions). You don't decide whether it's a bug: you record it so the stakeholder can.

## 1. Record it at once (status `suspected`)

Add an entry to the task journal's **Defects** section (no journal: put it in your reply to the coordinator). Ids are `BUG-<KEY>-NN` (the test case key, e.g. `BUG-PC-01`) and are never renumbered.

```md
### BUG-<KEY>-NN: <what is wrong, in one line>
- Status: suspected
- Found: <date> by <agent> (Plan #<n>), <environment / URL>
- Severity: High | Medium | Low (<why>)
- Steps to reproduce:
  1. <step, with URL and test data>
- Expected: <value> (source: <AC, test case, or the product's own claim>)
- Actual: <observed values, exact text and amounts>
- Reported to: <tracker key> | none: steps recorded here
- Automation: <test case id and handling> | none
```

Facts only: exact texts, amounts, dates; no secrets or personal data.

## 2. Raise it

- Add a **Decisions needed** line ("BUG-<KEY>-NN: defect or accepted behaviour?"). Mark your Plan task `blocked` only if your work depends on the answer; otherwise carry on.
- List it in your return to the coordinator, even when it's outside the task's scope.
- The coordinator brings it to the stakeholder, who sets the status to `confirmed` or `not a bug` (then the observed behaviour is the accepted baseline, recorded in Decisions).

## 3. Report it to a tracker (only when allowed)

If a bug tracker MCP is connected (e.g. Jira through the `atlassian-jira` skill) **and** the Plan's "Approved external writes" lists the bug report, create the issue from the entry and put its key in "Reported to". Otherwise write "none: steps recorded here". Never write to a tracker without that approval (Standing Rule 6).

## 4. Handle the affected test case (confirmed defects)

- The test asserts the **expected** value (Standing Rule 4), never the defect value, and never with a commented-out assert.
- Put a method-level `@Ignore` (from `@bellatrix/core/decorators`, no arguments) on it with a trailing comment: `@Ignore // BUG-<KEY>-NN <summary>`. Set the entry's Automation line to the test case id.
- A defect with no matching test case (e.g. wrong page copy) is recorded only, unless the stakeholder asks for a test.
- When the defect is fixed, remove the `@Ignore` and set the Status to `fixed`.
