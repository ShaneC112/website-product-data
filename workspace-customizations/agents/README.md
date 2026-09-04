# Agent Governance

Canonical reusable agents are stored in `../.github/agents/` and synchronized to the workspace root. Legacy one-off root agents are unmanaged and intentionally excluded.

| Agent | Trigger | Scope | Commit authority |
| --- | --- | --- | --- |
| Project Engineer | Feature, bug, or review work | Production changes in the five scoped repositories | No |
| Project Knowledge | Documentation, scripts, learnings, or customizations | Canonical knowledge system | No |
| Project QA Commit | Final review, versioning, or explicit commit | Changed repositories and release readiness | Only on explicit authorization |

Specialized plan agents remain legacy workspace files; they are not canonicalized or maintained by this system.
