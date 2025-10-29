---
trigger: always_on
alwaysApply: true
---
All tasks must follow this mandatory three-phase process to ensure features are implemented, tested, and documented correctly.

Phase 1: Implement the Feature
Receive your assigned task (e.g., "Add user authentication feature").

Write the necessary code to add this feature to the software as per the requirements.

Phase 2: Test & Fix with Playwright MCP
Once the feature is coded, you must immediately open Playwright and connect it to the MCP tool.

Use the Playwright MCP integration to test the new feature you just implemented.

Instruct the AI agent via MCP to test all aspects of the feature (e.g., "Try to log in with a correct password," "Try to log in with a wrong password," "Verify the error message appears").

If any errors are found: You must fix those errors then and there itself.

Repeat the testing process until the Playwright MCP agent confirms the feature is implemented properly and all errors are resolved.

Phase 3: Update Final Documentation
After the feature is fully implemented, tested, and fixed, your final step is to update the final implementation.md file.

This file must reflect the completed work, any changes made during the fixing phase, and confirmation that the feature is stable.

This entire loop (Implement -> Test/Fix -> Document) is considered one completed task.