# English Outline — A Provisional–Live–Dead Contract for Asynchronous MCP Work Records

- document type: `architecture-decision`
- language: `en`
- audience outcome: The reader can trace each decision to source Evidence and explain the primary semantic axis and remaining boundary.

## S01 · Separate a successful response from materialization
- purpose: Separate a successful response from materialization
- evidence_ids: JS-E101, JS-E102, JS-E105
- visual_candidate: false
- visual_reason: Prose, tables, and code communicate this section more precisely.

## S02 · Model the anchor lifecycle explicitly
- purpose: Model the anchor lifecycle explicitly
- evidence_ids: JS-E102, JS-E103, JS-E104
- visual_candidate: true
- visual_reason: The selected diagram expresses this section’s primary semantic axis more accurately than prose alone.

## S03 · Create the ID and start intent in one transaction
- purpose: Create the ID and start intent in one transaction
- evidence_ids: JS-E103, JS-E104
- visual_candidate: false
- visual_reason: Prose, tables, and code communicate this section more precisely.

## S04 · Treat account restoration as a transition guard
- purpose: Treat account restoration as a transition guard
- evidence_ids: JS-E104
- visual_candidate: false
- visual_reason: Prose, tables, and code communicate this section more precisely.

## S05 · Classify failure before choosing a retry count
- purpose: Classify failure before choosing a retry count
- evidence_ids: JS-E103, JS-E104, JS-E105, JS-E106
- visual_candidate: false
- visual_reason: Prose, tables, and code communicate this section more precisely.

## S06 · Share the same vocabulary with the MCP schema
- purpose: Share the same vocabulary with the MCP schema
- evidence_ids: JS-E103, JS-E105
- visual_candidate: false
- visual_reason: Prose, tables, and code communicate this section more precisely.

## S07 · Apply intents through the library's normal write path
- purpose: Apply intents through the library's normal write path
- evidence_ids: JS-E103, JS-E104
- visual_candidate: false
- visual_reason: Prose, tables, and code communicate this section more precisely.

## S08 · Verify the complete path with a work record
- purpose: Verify the complete path with a work record
- evidence_ids: JS-E103, JS-E106
- visual_candidate: false
- visual_reason: Prose, tables, and code communicate this section more precisely.

## S09 · Use this pattern only when follow-up commands need the ID immediately
- purpose: Use this pattern only when follow-up commands need the ID immediately
- evidence_ids: JS-E101, JS-E102, JS-E103, JS-E104, JS-E106, JS-E108
- visual_candidate: false
- visual_reason: Prose, tables, and code communicate this section more precisely.

