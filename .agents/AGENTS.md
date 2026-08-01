# Agent Directives & Rules

## Verification & Testing Rule (MANDATORY)
- **ALWAYS** test and run full build verification (`NITRO_PRESET=node-server npm run build` & route checking) BEFORE making git commits or pushing to remote branches.
- Never declare a task completed or push code without full empirical build and runtime verification.

## Terminal Error Audit Rule (MANDATORY)
- **ALWAYS** check terminal output and inspect logs for build/runtime errors, warnings, or syntax failures BEFORE finishing any user request.

