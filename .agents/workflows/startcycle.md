# 07 START CYCLE: The Autonomous Loop

## Role: Project Heartbeat
This document defines the **Start-to-Finish** workflow that Antigravity (or any autonomous agent) must follow for every task in the **Portal OG** refactor.

### Phase 1: Product Spec (@Portal-PM)
- **Action**: Examine the task requirements and cross-reference with **[01_PRD_UNIFIED.md](01_PRD_UNIFIED.md)**.
- **Output**: A bulleted list of "Success Criteria" and "Constraints."

### Phase 2: Implementation Plan (@Portal-Architect)
- **Action**: Design the technical solution (Schema, State, API calls).
- **Output**: An implementation plan artifact (`implementation_plan.md`) with `request_feedback = true`.
- **Constraint**: No code changes allowed until the user approves the plan.

### Phase 3: Technical Implementation (@Portal-Architect)
- **Action**: Execute the approved plan.
- **Output**: Code diffs (recorded via `multi_replace_file_content` or `write_to_file`).

### Phase 4: Verification & Testing (@Portal-QA)
- **Action**: Trigger the relevant protocols in **[05_TEST_PROTOCOLS.md](05_TEST_PROTOCOLS.md)**.
- **Output**: A **Verification Report** with test logs and screenshots.

### Phase 5: Documentation & Artifacts (@Portal-PM)
- **Action**: Update the **[06_AUTONOMOUS_BUILD_LOG.md](06_AUTONOMOUS_BUILD_LOG.md)** and save the Verification Report to **[09_ARTIFACTS/](09_ARTIFACTS/)**.
- **Output**: A `walkthrough.md` to the user summarizing the achievement.

---

## The "Rework" Loop
If Phase 4 fails:
1.  **Analyze** the failure root cause.
2.  **Backtrack** to Phase 2 (Update Plan).
3.  **Repeat** until Phase 4 passes.
