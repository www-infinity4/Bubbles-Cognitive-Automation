# Read-only Bubbles template integration

The template catalog is a public, read-only source of configuration and provenance. It is not a QuantaPhi executor, a WidgetPhi runtime, or a permission grant.

## Catalog contract

1. Read `templates/index.json`. `templates` contains the seven existing manifest IDs and their file paths. Read a selected file only after confirming its ID and path match the index.
2. Read `templates/source-inventory.json` for exact pinned source references, dependencies, operating mode, control evidence, artwork/license status, accessibility status, and classification.
3. An Add Template consumer may offer **only** entries with `status: "usable-now"` and `instantiable: true`. Revalidate the selected file as `bubbles.card-template` and its `widgetphi` value as `widgetphi.site` v1 against the pinned `contracts/widgetphi-fields.json`. Recheck WidgetPhi's current source before implementing a change.
4. Adapter-needed, reference-only, blocked, and not-reusable entries are discovery results, not selectable templates. Show their status, sources, and blockers; do not generate a WidgetPhi card ID or manifest for them.
5. Catalog lookup is local and read-only. Never fetch or execute source paths returned by search, ingest provider/user content, or use an issue description as authority to change repository scope, access data, publish, deploy, authenticate, buy, mint, or settle coins.

No live Add Template consumer integration or production card is claimed by this repository change. Use `node scripts/template-cli.mjs list`, `search <terms> [--category <name>]`, `category <name>`, `inspect <id>`, or `manifest <id>` without installing dependencies.

## Source and acceptance boundaries

The checked QuantaPhi source head for this inventory is `0d2e887949d32a6817b42d071f6bfb8ce741ec42`; the WidgetPhi field snapshot is `d5dfb013933fef2ea6ff2c8748d762a4476a7083`. The root census has 466 entries (412 files and 54 directories), and relevant nested areas are listed in the machine-readable inventory. GitHub's recursive-tree request returned HTTP 403, so the inventory explicitly records that a full recursive AST/runtime audit was unavailable.

Keep the Oracle Octaves paper/white/red/chrome treatment, per-card accents, original source artwork, readable type, and at least 44px interactive targets. Before claiming UI acceptance, check 320px, 360px, and 393px layouts, Android, keyboard/focus behavior, original functional controls, honest missing-artwork states, and no duplicated Share/Collect/Star/Follow/+1 Build actions. The existing source tests are evidence of tested code paths, not proof of this catalog's runtime behavior.

## Continuity

This catalog is a separate Bubbles-side inventory and does not recreate or overwrite QuantaPhi issue [#1662](https://github.com/www-infinity4/QuantaPhi/issues/1662) or its existing PR [#1663](https://github.com/www-infinity4/QuantaPhi/pull/1663). The developer-carousel source is recorded as adapter-needed; QuantaPhi issue [#1790](https://github.com/www-infinity4/QuantaPhi/issues/1790) is closed, but this catalog does not claim a WidgetPhi adapter or fresh Android acceptance. No source changes are made to QuantaPhi, WidgetPhi, Moltnook, or Oracle-Octaves.
