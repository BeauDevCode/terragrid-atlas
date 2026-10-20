# Contributing

Thanks for taking a look at TerraGrid Atlas.

## Local setup

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Checks

Run these before opening a pull request:

```bash
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev --audit-level=high
GITHUB_PAGES=1 npm run build
node scripts/check-static-export.mjs
```

## Good first contributions

Good starter tasks include:

- README improvements
- screenshot updates
- small interface polish
- documentation cleanup
- sample data notes
- empty-state improvements

## Pull requests

Please include:

- what changed
- why it changed
- how you tested it
- screenshots for interface changes

Keep changes focused and small when possible.
