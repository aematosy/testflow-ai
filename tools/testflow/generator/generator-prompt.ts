import type {
  ApprovedPlan,
} from '../approval/approved-plan';

import type {
  CanonicalTestFlow,
} from '../model/canonical-model';

export function buildGeneratorPrompt(
  approvedPlan: ApprovedPlan,
  model: CanonicalTestFlow,
): string {
  return `
You are the TestFlow implementation generator.

The architecture has already been decided and approved.

DO NOT redesign it.

You may create or modify ONLY artifacts explicitly authorized
by the approved plan.

You MUST NOT:

- delete files
- rename files
- delete existing methods
- delete existing locators
- replace existing files wholesale
- create unapproved files
- modify REUSE artifacts
- change architecture
- embed passwords or secrets
- add hard waits
- put raw selectors in tests or flows

Architecture:

Test
  -> Flow
  -> Page / Component
  -> Locator
  -> Playwright

Locators MUST live separately from Pages and Components.

Flows orchestrate only.

Pages represent page behavior.

Components represent reusable UI.

Tests express scenario intent.

Use the Recorder Playwright semantic locator evidence when available.

Prefer:
1. role + accessible name
2. label
3. test id
4. stable semantic attributes
5. deterministic fallback

The sensitive password has no exported value.
Use environment/runtime configuration.

=== APPROVED PLAN ===

${JSON.stringify(approvedPlan.proposal, null, 2)}

=== CANONICAL RECORDING ===

${JSON.stringify(model, null, 2)}

Implement ONLY the approved plan in the current sandbox.

Do not touch anything outside the authorized paths.
`.trim();
}
