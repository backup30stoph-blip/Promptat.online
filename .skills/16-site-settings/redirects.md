---
name: redirects
description: URL redirection engine, loop and duplicate checks, hit tracking, and bulk import processes.
---

# Redirects Manager

## Requirements
* **Response Codes**: Support 301 (Permanent), 302 (Temporary), 307 (Temporary), 308 (Permanent).
* **Validation**:
  - **Loop Detection**: Checks if source path redirects back to destination path.
  - **Duplicate Prevention**: Rejects duplicate redirects for the same source route.
* **Bulk Import**: Paste / Upload / Drag & Drop support for CSV/JSON/TXT imports.
* **Telemetry**: Displays hits, last used dates, and active flags.
