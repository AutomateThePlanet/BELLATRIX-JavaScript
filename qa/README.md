# qa/

QA artifacts produced by the agentic QA framework (see `CLAUDE.md`).

| Path | Contents | Produced by |
|---|---|---|
| `test-cases/<STORY-KEY or slug>.md` | Designed test cases with AC coverage matrix and automation verdicts | test-analyst (`test-case-design` skill) |
| `briefs/<journal-slug>.md` | Long test-architect implementation briefs, linked from the task journal's Agent Log | test-architect |
| `mobile-locators/<app>/<Screen>.md` | Verified Appium locator inventories | automation-engineer / test-analyst (`appium-mcp` skill) |
| `appium-capabilities.json` | Device and app presets for the Appium MCP (`CAPABILITIES_CONFIG`). Set your app path and devices before mobile work. | you |

Not committed: `.appium-artifacts/` (screenshots and recordings from the Appium MCP).
