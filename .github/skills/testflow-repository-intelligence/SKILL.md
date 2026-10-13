---
name: testflow-repository-intelligence
description: Analyze a TestFlow canonical recording against an existing automation repository and decide REUSE, MODIFY, or CREATE without duplicating architecture. Use when planning implementation for a new recording against an existing Playwright automation repository.
---

# TestFlow Repository Intelligence

Act as architecture intelligence only.

Do not generate implementation code.
Do not invent selectors.
Do not modify repository files.

## Decision order

Always evaluate:

REUSE -> MODIFY -> CREATE

### REUSE

Use REUSE when an existing artifact already owns the required responsibility.

For locator artifacts, REUSE when all required canonical targets for that owner are already represented by the existing locator artifact.

Do not propose MODIFY merely because the same targets appear in another recording.

### MODIFY

Use MODIFY only when an existing compatible owner exists but requires additive behavior or additional targets.

Modification must be additive.

Never delete existing:
- methods;
- locators;
- responsibilities;
- public APIs.

### CREATE

Use CREATE only when no compatible repository owner exists.

Never create a duplicate artifact merely because the Recorder contains another route segment.

## Target identity

Do not treat targetKey as globally unique across an application.

Resolve target identity using context:

- functional screen/page;
- targetKey;
- semantic fingerprint;
- existing repository owner.

For example, the same semantic field may exist on multiple screens and belong to different locator owners.

Do not merge targets solely because their targetKey strings match.

See references/target-identity.md.

## Locator authority

The Recorder is authoritative for locator evidence.

The Planner decides ownership only.

Never:
- invent a selector;
- rewrite a selector;
- prefer a prettier selector;
- replace Recorder locator evidence with an LLM-generated locator.

Locator implementation is owned by deterministic TestFlow Core.

## Dynamic targets

Detect when recorded target identity contains scenario data.

Examples include:
- table rows containing recorded IDs;
- customer names;
- order numbers;
- generated values.

Do not model scenario-specific values as static repository locators.

Classify these as parameterized target responsibilities.

The generated implementation should receive runtime test data.

## Pages and components

Create Pages for screen-specific behavior.

Create Components for reusable UI shared across screens, such as:
- navigation;
- headers;
- menus;
- dialogs;
- reusable widgets.

Do not create one Page per Recorder step.

## Flows

Flows represent functional orchestration.

Do not create one Flow per route.

Reuse existing flows when their functional responsibility matches.
Create a new flow when the business behavior is genuinely different.

## Required planning behavior

For every proposed artifact:

1. Search existing repository ownership.
2. Evaluate REUSE.
3. If incomplete, evaluate additive MODIFY.
4. Only then evaluate CREATE.
5. Explain the ownership decision.
6. Preserve all existing repository behavior.

## Recorded values are not automatically target identity

Treat target keys or semantic names derived from runtime/application data with caution.

Examples of runtime-dependent identity include:
- usernames displayed in account menus;
- employee/customer/order IDs;
- names returned by searches;
- generated identifiers;
- table-row contents.

When the structural locator identifies a stable control but the recorded
semantic name contains runtime data, model the repository responsibility
using the stable UI role instead of the recorded value.

Prefer responsibilities such as:
- user menu trigger;
- account menu trigger;
- result row by runtime identifier.

Do not create repository APIs whose names encode recorded runtime values.

Bad:
- rahulSharma()
- employee774500()

Good:
- userMenuTrigger()
- employeeRow(employeeId)
