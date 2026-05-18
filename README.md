# Topogram Generator: sveltekit

> Package-backed Topogram generator for SvelteKit web apps.

Status: current
Audience: generator package authors and maintainers
Use when: you need to change generator realization, manifests, package metadata, or release proof.

Package-backed Topogram generator for SvelteKit web apps.

## Manifest

- Generator id: `@topogram/generator-sveltekit-web`
- Surface: `web`
- Projection type: `web_surface`
- Package manifest: `topogram-generator.json`
- Adapter export: `index.cjs`

## Verify Locally

```bash
npm run check
```

See [`CONSUMER_PROOF.md`](./CONSUMER_PROOF.md) for the verification standard
this repo must keep before publishing.

The smoke test packs this generator, installs it beside `@topogram/cli` in
a temporary consumer project, runs `topogram check`, runs `topogram generate`,
compiles the generated app bundle, and verifies expected generated files.

## Release Preflight

```bash
npm run release:preflight
```

The preflight runs package checks, docs/RAG verification, `npm pack --dry-run`,
and Gitleaks secret scanning before publish or broad sharing.
