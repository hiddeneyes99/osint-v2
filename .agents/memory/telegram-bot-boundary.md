---
name: Telegram bot boundary
description: The private-group search bot is a separate authenticated Telegram surface from the existing alert, linking, and broadcast terminal.
---

The existing Telegram Terminal remains responsible for account linking, admin alerts, and broadcasts. The private-group search bot uses its own enable flag, approved groups, dedicated API key, masking policy, service allowlist, limits, and structured logs.

**Why:** Keeping the two surfaces separate prevents a configuration change for group searches from changing the established website notification and account-linking behavior.

**How to apply:** Add future search-bot features under the Telegram Bot settings/API boundary and preserve the existing `/start`, admin command, alert, and broadcast behavior.