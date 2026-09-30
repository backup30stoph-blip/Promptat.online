# Admin UI Guidelines
## GemiPrompts.store — Content Management Engine

The administrator panel must present a clean, high-contrast, uncluttered interface containing two main sections: Asset Content Fields and SEO Preview Simulation.

### 1. Drag & Drop Media Upload Area
```text
┌────────────────────────────────────────────────────────┐
│                                                        │
│                    [Cloud Upload Icon]                 │
│                 Drag and Drop your files               │
│                                                        │
│                           or                           │
│                                                        │
│                     [ Browse Files ]                   │
│                                                        │
│                   [ Paste Asset URL ]                  │
│                                                        │
└────────────────────────────────────────────────────────┘
```
Provides feedback:
* Hovering: Border shifts to active accent color, background dims by 5%.
* In progress: Displays individual file progress bars with upload speed.

### 2. Live Search Engine Simulation Card
Replicates standard search results:
* **Toggle Bar**: `[ Desktop View ]  [ Mobile View ]  [ Dark Mode ]`
* **Desktop Card**:
  * Breadcrumbs: `https://gemiprompts.store > category > slug` (small slate-400 font)
  * Title: `SEO-Optimized Title Mapped with Focus Keyword` (blue link text, font-semibold)
  * Description: `Detailed summary copy displaying exact character limits and highlighted search keywords.`
* **Mobile Card**:
  * Website logo favicon followed by `gemiprompts.store`
  * Title: Larger blue bold typography.
  * Description: Maximum 3 lines of crisp content.

### 3. Live Social Preview Cards
* Displays instant feed-style cards matching Open Graph (Facebook/LinkedIn) and Twitter Card layouts.
* Highlights warnings if image aspect ratios (e.g., 1.91:1 or 1:1) do not conform to specifications.
