# Skill 15 — Unified SEO & Content Management Engine
## GemiPrompts.store

This is the enterprise-level **Master Skill** that defines the complete SEO and media content system for the entire GemiPrompts.store hub. 

Whenever the AI agent works on any content type (Prompts, Skills, Blogs, Viral Video Concepts, Categories, or Media Library), it **MUST** load and adhere to this skill.

---

## 1. Directory Structure

```text
.skills/15-seo-content-management/
├── README.md                      # This architecture overview
├── seo-master-plugin.md           # ⭐ Always Load: Core agent rules & behavior
├── google-preview.md              # Search engine desktop/mobile visual rules
├── metadata-rules.md              # Title, description, and canonical constraints
├── structured-data.md             # Schema.org JSON-LD definitions
├── image-seo.md                   # Auto-naming, alt text, and caption rules
├── media-library.md               # Reusable asset metadata specs
├── supabase-storage.md            # Buckets, folders, and policies
├── upload-workflow.md             # Drag & drop, URL imports, copy-paste
├── slug-generator.md              # ASCII slug rules & duplication check
├── sitemap.md                     # Auto-updating sitemap XML structure
├── robots.md                      # Robots.txt crawl indexing budget rules
├── internal-linking.md            # Cross-linking minimum validation
├── canonical.md                   # Primary canonical URL mapping
├── open-graph.md                  # Facebook, LinkedIn, Discord preview metadata
├── twitter-card.md                # Twitter/X preview summary cards
├── image-optimization.md          # WebP/AVIF conversions and sizing budget
├── validation.md                  # Publishing validation checklist
└── admin-ui.md                    # Admin panel drag-drop / search preview mocks
```

---

## 2. Core Architectural Concept
Rather than treating SEO and media uploads as separate, isolated features, GemiPrompts.store builds them as a unified **Content Management Engine**. Every content entity inherits the same base schemas and capabilities.

This ensures:
1. **No Duplicated Code**: Unified validators, previews, and DB models.
2. **Ironclad SEO**: Every published asset automatically receives verified metadata, structured data, canonical tags, and is entered into the sitemap.
3. **Optimized Media**: Images uploaded are automatically renamed, optimized, mapped to Supabase storage, and linked with accessibility attributes.
