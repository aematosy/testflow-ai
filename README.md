# TestFlow AI

AI-native test automation platform that transforms recorded user flows into maintainable, incremental and self-healing Playwright tests.

> From recorded user flows to maintainable test automation.

## Current architecture

TestFlow Recorder JSON
→ Validation
→ Flow Compiler
→ Canonical Model
→ Repository Indexer
→ Repository-aware Planning
→ Approval
→ Generation
→ Review
→ Playwright Execution
→ Failure Analysis
→ Controlled Healing

## Core principles

- Playwright + TypeScript
- Test → Flow → Page/Component → Locator → Playwright
- Locators separated from Pages and Components
- Repository-first automation
- REUSE → MODIFY → CREATE
- Non-destructive generation by default
- SOLID and maintainable automation practices
- Recorder JSON as structured evidence
- Agent-assisted architecture and implementation
- Controlled self-healing
