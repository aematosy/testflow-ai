# TestFlow Architecture Rules

## Dependency direction

Test -> Flow -> Page/Component -> Locator -> Playwright

Dependencies must not point upward.

## SOLID

Apply SOLID pragmatically.

Prefer focused responsibilities and composition.

Do not introduce abstraction layers without a concrete reuse or
design reason.

## Repository-first generation

Before creating an artifact:

1. inspect repository knowledge;
2. search for semantic ownership;
3. reuse when possible;
4. extend minimally when appropriate;
5. create only when no suitable owner exists.

## Non-destructive default

Generated changes are additive by default.

Existing files, methods, locators and public APIs are protected.

Destructive changes require a separate explicit workflow and human
approval.

## Locators

Locators live separately from Pages and Components.

Pages and Components consume locator classes.

Flows never contain raw selectors.

Tests never contain raw selectors.

## Recorder

The TestFlow Recorder JSON is evidence of user interaction and target
identity.

It is not a direct representation of repository architecture.
