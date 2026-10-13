import type {
  ApprovedPlan,
} from '../approval/approved-plan';

import type {
  CanonicalTestFlow,
} from '../model/canonical-model';

import {
  GENERATION_POLICY,
} from '../policy/generation-policy';

export function buildGeneratorPrompt(
  approvedPlan: ApprovedPlan,
  model: CanonicalTestFlow,
): string {
  return `
You are the TestFlow implementation generator.

You DO NOT have filesystem access.

Return exactly ONE JSON object.
No markdown.
No code fences.
No commentary.

Required shape:

{
  "version": "1.0",
  "recordingId": "${approvedPlan.proposal.recordingId}",
  "files": [
    {
      "operation": "CREATE or MODIFY",
      "path": "exact approved path",
      "content": "complete TypeScript file content"
    }
  ]
}

Generate exactly every CREATE and MODIFY artifact from the approved
plan.

Do NOT return REUSE artifacts.

Do NOT invent files.

Do NOT change approved paths.

Architecture:

Test
  -> Flow
  -> Page / Component
  -> Locator
  -> Playwright

Rules:

- locators remain separate from Pages and Components
- Flow only orchestrates
- no raw selectors in tests or flows
- no hard waits
- no passwords or secrets
- use runtime/environment credentials for sensitive data
- use Recorder Playwright semantic locator evidence
- preserve existing code for MODIFY
- implement complete compilable TypeScript files
- use @playwright/test
- do not redesign the approved architecture

=== GENERATION POLICY ===

${JSON.stringify(GENERATION_POLICY, null, 2)}

IMPORTANT:

- Do not embed recorded form values directly in spec files.
- Non-sensitive scenario data must be supplied through a test-data object,
  fixture, factory, or runtime input.
- Sensitive values must come from runtime configuration/environment.
- Do not embed the application origin in generated Page classes.
- Use Playwright baseURL and relative navigation.

=== APPROVED PLAN ===

${JSON.stringify(approvedPlan.proposal, null, 2)}

=== CANONICAL MODEL ===

${JSON.stringify(model, null, 2)}

Return ONLY the GenerationManifest JSON.
`.trim();
}
