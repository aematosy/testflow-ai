import fs from 'node:fs';

import type {
  PlannerContext,
} from './planner-context';

export function buildPlannerPrompt(
  context: PlannerContext,
  instructionsPath: string,
): string {
  const instructions =
    fs.readFileSync(
      instructionsPath,
      'utf-8',
    );

  const repositoryIntelligenceSkill =
    fs.readFileSync(
      '.github/skills/testflow-repository-intelligence/SKILL.md',
      'utf-8',
    );

  const targetIdentityReference =
    fs.readFileSync(
      '.github/skills/testflow-repository-intelligence/references/target-identity.md',
      'utf-8',
    );

  const recordingId =
    `TF-${context.recording.recording.sessionId}`;

  const repositoryIndexVersion =
    context.repository.version;

  return `
You are the TestFlow Architecture Planner.

PLANNING ONLY.

You MUST NOT:
- modify files
- create files
- delete files
- rename files
- execute commands
- run tests
- use browser tools
- use filesystem tools
- change the repository

Your response is consumed by a strict machine parser.

RETURN EXACTLY ONE JSON OBJECT.

Do not return markdown.
Do not use code fences.
Do not add commentary.
Do not omit required fields.
Do not invent additional top-level fields.

REQUIRED TOP-LEVEL SHAPE:

{
  "version": "1.0",
  "recordingId": "${recordingId}",
  "repositoryIndexVersion": "${repositoryIndexVersion}",
  "generatedBy": "planner-agent",
  "artifacts": [],
  "forbiddenOperations": [
    "DELETE_EXISTING_FILE",
    "DELETE_EXISTING_METHOD",
    "DELETE_EXISTING_LOCATOR",
    "RENAME_EXISTING_API",
    "REPLACE_EXISTING_FILE"
  ]
}

Every artifacts[] item MUST have:

{
  "change": "REUSE | MODIFY | CREATE",
  "type": "locator | page | component | flow | test",
  "name": "string",
  "path": "string",
  "owns": ["string"],
  "reason": "string",
  "confidence": 0.0
}

For MODIFY only, also include:

{
  "additions": {
    "targets": ["string"],
    "methods": ["string"]
  }
}

MANDATORY DECISION ORDER:

REUSE -> MODIFY -> CREATE

CREATE is allowed only when no suitable existing owner exists.

Recorder steps are evidence.
Recorder steps are NOT repository architecture.

Do not automatically create one Page per Recorder step.

Shared navigation, headers, menus, dialogs and reusable widgets
should be Components when appropriate.

Flows represent functional orchestration, not route count.

Locators must remain separate from Pages and Components.

LOCATOR OWNERSHIP CONTRACT:

For every artifact whose type is "locator":

- "owns" MUST contain ONLY exact target keys from
  TESTFLOW CONTEXT recording.targets[].key.
- Never put descriptions, labels, semantic names,
  control types, or prose in locator owns.
- Every target required by the recording MUST have
  exactly one locator owner.
- Do not invent target keys.

Example:

Correct:
"owns": ["USERNAME", "PASSWORD", "LOGIN"]

Forbidden:
"owns": [
  "Username textbox",
  "Password field",
  "Login button"
]

For non-locator artifacts, "owns" may describe
functional responsibilities.

Existing repository artifacts are protected.

=== ARCHITECTURE RULES ===

${instructions}

=== REPOSITORY INTELLIGENCE SKILL ===

${repositoryIntelligenceSkill}

=== TARGET IDENTITY REFERENCE ===

${targetIdentityReference}

=== TESTFLOW CONTEXT ===

${JSON.stringify(context, null, 2)}

=== FINAL REMINDER ===

recordingId MUST be exactly:

"${recordingId}"

repositoryIndexVersion MUST be exactly:

"${repositoryIndexVersion}"

generatedBy MUST be exactly:

"planner-agent"

Return ONLY the JSON object.
`.trim();
}
