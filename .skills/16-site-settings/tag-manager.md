---
name: tag-manager
description: Google Tag Manager integration rules, script injection points, and environment preview flags.
---

# Google Tag Manager (GTM)

## Setup Configuration
* **Container ID** (`GTM-XXXXXXX`)
* **Header Script**: Injected immediately before `</head>`
* **Body Script / noscript**: Injected immediately after `<body>`
* **Preview Mode / Environment**: Appends preview query params to target containers for QA testing.
