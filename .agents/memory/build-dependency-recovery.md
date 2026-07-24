---
name: Imported build dependency recovery
description: Package-manager installs can leave platform-specific optional binaries absent in this imported project
---

When the imported project’s production build fails on a missing platform-specific optional package, restore the package through the project package manager and run the existing native-package recovery hook before building again.

**Why:** The development workflow can recover its native Rollup binary at startup while a direct production build still fails if the optional package was not materialized in `node_modules`.

**How to apply:** Treat this as an environment/package-install issue first; do not change application code or build configuration unless the restored dependency and recovery hook still fail.