# Target Identity

A Recorder target key is a semantic identifier inside a recording.

It is not automatically a globally unique repository identifier.

Effective target identity should consider:

targetKey
+ functional context
+ semantic fingerprint
+ repository owner

Two controls may legitimately share the same targetKey while belonging to
different screens and different locator owners.

Repository planning must therefore avoid global targetKey-only matching.

## Static target

Stable application control whose identity does not depend on scenario data.

## Contextual target

Semantically similar control appearing in different application contexts.

Keep ownership scoped to the appropriate page/component.

## Parameterized target

A target whose recorded selector contains scenario-specific data.

Preserve the Recorder locator strategy, but model the variable portions as
runtime parameters instead of static hardcoded values.
