---
name: Imported build dependency recovery
description: Package-manager installs can leave platform-specific optional binaries absent in this imported project
---

When an imported project’s workflow fails because a declared Node dependency is missing from `node_modules`, restore dependencies through the project package manager before changing application code. For this project, the existing startup hook also restores the platform-specific Rollup binary when needed.

**Why:** The development workflow can recover its native Rollup binary at startup while a direct production build still fails if the optional package was not materialized in `node_modules`.

**How to apply:** Treat missing executables such as `node_modules/.bin/tsx` as an environment/package-install issue first. Keep the existing package manager, lockfiles, and native-package recovery hook; do not change application code or build configuration unless dependency restoration still fails.