# English Outline — The Data Flow from a JustSend Seed to Research, Evidence, and Review

- document type: `architecture-decision`
- language: `en`
- audience outcome: The reader can trace each decision to source Evidence and explain the primary semantic axis and remaining boundary.

## S01 · Treat JustSend as a seed, not as the source of truth
- purpose: Treat JustSend as a seed, not as the source of truth
- evidence_ids: JS-E101, JS-E102
- visual_candidate: false
- visual_reason: Prose, tables, and code communicate this section more precisely.

## S02 · Structure the source twice before writing
- purpose: Structure the source twice before writing
- evidence_ids: JS-E102, JS-E103
- visual_candidate: true
- visual_reason: The selected diagram expresses this section’s primary semantic axis more accurately than prose alone.

## S03 · Let Writing consume Evidence, not raw records
- purpose: Let Writing consume Evidence, not raw records
- evidence_ids: JS-E101, JS-E102, JS-E104
- visual_candidate: false
- visual_reason: Prose, tables, and code communicate this section more precisely.

## S04 · Select a diagram type from the primary semantic axis
- purpose: Select a diagram type from the primary semantic axis
- evidence_ids: JS-E103, JS-E104
- visual_candidate: false
- visual_reason: Prose, tables, and code communicate this section more precisely.

## S05 · Humanize after the technical structure is fixed
- purpose: Humanize after the technical structure is fixed
- evidence_ids: JS-E101, JS-E103, JS-E104
- visual_candidate: false
- visual_reason: Prose, tables, and code communicate this section more precisely.

## S06 · Isolate each run with Git worktrees
- purpose: Isolate each run with Git worktrees
- evidence_ids: JS-E101, JS-E105
- visual_candidate: false
- visual_reason: Prose, tables, and code communicate this section more precisely.

## S07 · Make Fidelity Audit the publish-candidate gate
- purpose: Make Fidelity Audit the publish-candidate gate
- evidence_ids: JS-E104, JS-E106
- visual_candidate: false
- visual_reason: Prose, tables, and code communicate this section more precisely.

## S08 · Keep publication outside the automatic data flow
- purpose: Keep publication outside the automatic data flow
- evidence_ids: JS-E101, JS-E102, JS-E103, JS-E104, JS-E105, JS-E106, JS-E108
- visual_candidate: true
- visual_reason: The selected diagram expresses this section’s primary semantic axis more accurately than prose alone.

