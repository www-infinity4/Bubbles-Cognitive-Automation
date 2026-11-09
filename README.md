# Bubbles Cognitive Automation · Oracle Octaves Template Library

Seven **source-backed** reusable configurations from the existing QuantaPhi, Oracle Octaves and WidgetPhi designs. They are **not** deployed cards, model connections, independent workers, wallet integrations or proof of production acceptance.
The pinned source inventory additionally records adapter-needed, reference-only, blocked, and non-reusable candidates without treating them as templates.

| Template | Existing WidgetPhi card IDs |
|---|---|
| `oracle-quick-card` · Oracle Quick Card Builder | `card-builder-desk` |
| `media-star` · Media Star Creator | `media-star` |
| `infinity-radio` · Infinity Radio Player | `infinity-radio` |
| `story-writer` · Story Writer Studio | `story-writer` |
| `physics-experiment` · Physics Experiment Card | `physics-experiment` |
| `shop-phi` · Shop Phi Product Card | `shop-phi` |
| `search-research` · Search & Research Cards | `search-engine`, `research-viewer` |

## Bubbles access

1. Read the public [machine-readable catalog](https://raw.githubusercontent.com/www-infinity4/Bubbles-Cognitive-Automation/main/templates/index.json).
2. Read the selected `templates/<id>.json` for pinned source links, artwork, Oracle accent, accepted settings and production requirements.
3. Its `widgetphi` object is a complete `widgetphi.site` v1 configuration for the existing WidgetPhi validator. A manifest alone does **not** provision D1, connect AI, publish a card, or authorize any coin.
4. For the GitHub **Add template / New issue** workflow, choose one of the seven issue forms under `.github/ISSUE_TEMPLATE/`. Form submission is a proposed job, not permission to bypass owner and CI gates.
5. Use `node scripts/template-cli.mjs list`, `search <terms> [--category <name>]`, `category <name>`, `inspect <id>`, or `manifest <id>` to explore configurations and candidate status. Only the seven existing manifest IDs can be exported; adapter-needed candidates do not have WidgetPhi manifests. No npm install, paid API or secret is needed.

The pinned upstream WidgetPhi field snapshot is `contracts/widgetphi-fields.json`. Bubbles must recheck upstream before implementing patches. The Oracle Octaves source palettes are referenced in every template. The optional `index.html` is a static gallery; GitHub Pages is not implied by adding files.

Run `node --test` for the repository's schema, CLI and form tests. Deployment and live browser acceptance are separate receipts.

The read-only consumer contract, pinned census scope, source findings, accessibility/license status, and handoff to QuantaPhi #1662 are documented in [docs/TEMPLATE-INTEGRATION.md](docs/TEMPLATE-INTEGRATION.md). Searchable classifications and source references are in `templates/source-inventory.json`.

## Cognitive UI diagnostics engine

This repository now also contains the initial **evidence-only** UI diagnostics engine.
`src/diagnose.mjs` checks broken images, clipped layouts, undersized touch targets, console errors, HTTP failures and separately receipted vision observations. It produces stable, deduplicated repair proposal packets for the **existing** signed Moltnook repository engine.

Run `node src/cli.mjs examples/broken-card.json` to inspect a clearly marked synthetic demo (not a live website scan). `scripts/browser-snapshot.js` can collect non-sensitive DOM dimensions when explicitly loaded in an authorized browser session. Neither route edits source, captures credentials, executes a fix, calls a paid model or proves a production deployment.

The core diagnostic checks and template checks run together under `node --test`.
