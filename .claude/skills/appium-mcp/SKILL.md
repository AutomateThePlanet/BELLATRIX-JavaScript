---
name: appium-mcp
description: Explore Android/iOS apps with the Appium MCP server, verify mobile flows, and build a locator inventory. Use for any mobile test design, mobile exploratory testing, or mobile locator work.
---

# Appium MCP for BELLATRIX

The `appium` MCP server (`.mcp.json`) controls a local emulator, simulator or real device, or attaches to a remote Appium server. Device presets come from `qa/appium-capabilities.json` (set as `CAPABILITIES_CONFIG`). Fill in your app path and device names there first.

## Know the framework's limits first

`@bellatrix/appium` currently provides **drivers only**: `AndroidDriver` / `WindowsDriver` with session handling, permissions, screenshots, notifications, battery info and SMS. It has **no element finding, no page objects and no test-runner integration**. Therefore:

- **Do not** write BELLATRIX mobile test classes or invent a mobile page-object layer.
- **Do** produce: verified flows, a locator inventory, test cases, and exploratory results with screenshots.
- If a request needs automated mobile tests, record it in the Journal under **Decisions needed** for the test-architect (options: extend `@bellatrix/appium` with element and page-object support, or an interim WebdriverIO/Appium suite). Don't pick an option yourself.

## Tools you will use

| Need | Tool |
|---|---|
| Pick a device | `select_device` |
| Start or stop a session | `appium_session_management` (`action=create` with `platform=android` or `ios`; `action=list` / `delete`). Always delete MCP-owned sessions when done. |
| Install, launch or terminate the app | `appium_app_lifecycle` |
| Understand the screen | `appium_get_page_source` (XML hierarchy); `appium_screenshot` only for evidence |
| Find elements | `appium_find_element`, `appium_find_elements` (use the plural to prove uniqueness) |
| Propose locators | `generate_locators`: treat its output as candidates and verify each one |
| Act | `appium_gesture`, `appium_set_value`, `appium_mobile_press_key`, `appium_mobile_keyboard`, `appium_alert`, `appium_drag_and_drop`, `appium_perform_actions` |
| Read state | `appium_get_text`, `appium_get_element_attribute`, `appium_get_active_element` |
| Device | `appium_mobile_permissions`, `appium_orientation`, `appium_geolocation`, `appium_mobile_device_info` |
| Hybrid apps | `appium_context` (switch between NATIVE_APP and WEBVIEW) |

`appium_generate_tests` generates code for a different stack. Don't commit its output into this repo.

## Locator inventory

Save verified locators to `qa/mobile-locators/<app>/<Screen>.md`:

```md
# <Screen> (<platform>, app version x.y.z, verified <date>)
| Element | Strategy | Value | Unique? | Notes |
|---|---|---|---|---|
| Login button | accessibility id | login_button | yes | |
| Error banner | id | com.example:id/error | yes | only visible after a failed login |
```

Strategy priority comes from the `locator-strategies` skill (accessibility id first, XPath last).

## Procedure

1. `select_device`, then `appium_session_management action=create`.
2. Walk the test case: `appium_get_page_source` after every screen change, act through verified elements, note waits and animations.
3. Fill the locator inventory; attach one screenshot per screen to the task journal if useful.
4. `appium_session_management action=delete`.
