# Content Validation Rules
## GemiPrompts.store — Content Management Engine

All core models (Prompts, Skills, Blogs, Videos, Categories) must pass these strict criteria before saving:

### 1. Title Constraints
* Minimum: 15 characters
* Maximum: 60 characters
* Rating: Excellent (50–60), warning if too short or too long.

### 2. Meta Description Constraints
* Minimum: 110 characters
* Maximum: 160 characters
* Rating: Excellent (120–150), warning if it overflows 160 (truncated in SERP) or underflows 110.

### 3. Slug Validation
* Lowercase letters and numbers only.
* Hyphen separators.
* No symbols, accented characters, or spaces.
* MUST be unique. Must append a numeric increment if a collision is found in the target table (e.g., `modern-architecture-1`).

### 4. Accessibility Checklist
* All images MUST have non-empty `alt_text`.
* Decorative images (if any) are flagged, but main thumbnails or covers require descriptive context.

### 5. SEO Scoring Engine
Computes a score from 0 to 100 based on:
* Title length (20 pts)
* Description length (20 pts)
* Keyword presence in title (15 pts)
* Keyword presence in description (15 pts)
* Keyword presence in slug (10 pts)
* Internal link presence (10 pts)
* Image alt text presence (10 pts)
