const manifest = require("./topogram-generator.json");

function slugify(value) {
  return String(value || "page")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "page";
}

function routeSegment(routePath) {
  const clean = String(routePath || "/").replace(/^\/+|\/+$/g, "");
  return clean ? slugify(clean.replace(/:/g, "")) : "";
}

function contractRoutes(contract) {
  const screensById = new Map((contract.screens || []).map((screen) => [screen.id, screen]));
  const navItems = contract.navigation?.items || [];
  const routed = navItems.length > 0
    ? navItems.map((item) => {
        const screen = screensById.get(item.screenId) || {};
        return {
          id: item.screenId || screen.id,
          route: item.route || screen.route || "/",
          title: screen.title || item.label || item.screenId || "Page",
          screen
        };
      })
    : (contract.screens || []).map((screen) => ({
        id: screen.id,
        route: screen.route || "/",
        title: screen.title || screen.id || "Page",
        screen
      }));
  return routed.filter((route) => route.id && route.route);
}

function sampleItemsForScreen(screen) {
  const title = screen?.title || screen?.id || "Resource";
  return [
    {
      id: "sample-active",
      title: `${title} sample`,
      message: `${title} sample`,
      description: "Generated from Topogram UI contract metadata.",
      status: "active"
    },
    {
      id: "sample-completed",
      title: `${title} completed sample`,
      message: `${title} completed sample`,
      description: "Second generated row for rendering checks.",
      status: "completed"
    }
  ];
}

function renderPackageJson(projectionId) {
  return `${JSON.stringify({
    name: projectionId,
    private: true,
    version: "0.1.0",
    type: "module",
    scripts: {
      dev: "vite dev",
      build: "vite build",
      preview: "vite preview",
      check: "svelte-kit sync && tsc --noEmit"
    },
    dependencies: {
      "@sveltejs/kit": "^2.9.0",
      "@sveltejs/vite-plugin-svelte": "^4.0.0",
      svelte: "^5.0.0",
      typescript: "^5.6.3",
      vite: "^5.4.11"
    },
    devDependencies: {
      "@types/node": "^22.10.2"
    }
  }, null, 2)}\n`;
}

function renderSvelteConfig() {
  return `import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config = {
  preprocess: vitePreprocess(),
  kit: {
    files: {
      assets: "static"
    }
  }
};

export default config;
`;
}

function renderViteConfig() {
  return `import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  envPrefix: ["VITE_", "PUBLIC_TOPOGRAM_", "TOPOGRAM_"]
});
`;
}

function renderTsconfig() {
  return `${JSON.stringify({
    extends: "./.svelte-kit/tsconfig.json",
    compilerOptions: {
      allowJs: true,
      checkJs: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      skipLibCheck: true,
      sourceMap: true,
      strict: true,
      moduleResolution: "bundler"
    }
  }, null, 2)}\n`;
}

function renderAppHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
`;
}

function renderAppCss() {
  return `:root { font-family: system-ui, sans-serif; color: #182026; background: linear-gradient(180deg, #f5f7fb 0%, #edf2f7 100%); }
body { margin: 0; }
a { color: #0f5cc0; text-decoration: none; }
a:hover { text-decoration: underline; }
main { max-width: 72rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
.app-shell { min-height: 100vh; }
.app-nav { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1.25rem; border-bottom: 1px solid rgba(24, 32, 38, 0.08); background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); }
.app-nav-links, .app-nav nav { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.brand { font-weight: 700; }
.card { background: white; border-radius: 16px; padding: 1.25rem; box-shadow: 0 12px 30px rgba(24, 32, 38, 0.08); }
.hero, .stack, .grid { display: grid; gap: 1rem; }
.grid.two { grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); }
.filters { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); margin: 1rem 0 1.25rem; }
label { display: grid; gap: 0.35rem; font-size: 0.95rem; }
input, textarea, button, select { font: inherit; }
input, textarea, select { width: 100%; box-sizing: border-box; border: 1px solid #c9d4e2; border-radius: 12px; padding: 0.7rem 0.85rem; background: white; }
button, .button-link { display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem; border: none; border-radius: 999px; padding: 0.7rem 1rem; background: #0f5cc0; color: white; font-weight: 600; cursor: pointer; }
.button-link.secondary { background: #e9eef6; color: #182026; }
.button-row { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
.task-list, .resource-list { list-style: none; padding: 0; margin: 1rem 0 0; display: grid; gap: 0.75rem; }
.task-list li, .resource-list li { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; padding: 1rem; border: 1px solid #e0e8f1; border-radius: 14px; background: #fbfcfe; }
.resource-meta, .task-meta, .definition-list { display: grid; gap: 0.5rem; }
.table-wrap, .component-table-wrap { margin-top: 1rem; overflow-x: auto; border: 1px solid #d7e1ec; border-radius: 14px; background: white; }
.resource-table { width: 100%; border-collapse: collapse; min-width: 42rem; }
.resource-table th, .resource-table td { padding: 0.85rem 1rem; text-align: left; border-bottom: 1px solid #e7edf5; vertical-align: top; }
.resource-table th { font-size: 0.85rem; letter-spacing: 0.04em; text-transform: uppercase; color: #516173; background: #f8fbff; }
.data-grid { min-width: 64rem; font-size: 0.95rem; }
.badge { display: inline-flex; align-items: center; padding: 0.25rem 0.6rem; border-radius: 999px; background: #eef4ff; color: #0f5cc0; font-size: 0.85rem; font-weight: 600; }
.muted { color: #607284; }
.empty-state { padding: 1rem 0; }
.component-card { border: 1px solid #d7e1ec; border-radius: 14px; background: #fbfcfe; padding: 1rem; margin-top: 1rem; }
.component-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.component-eyebrow { margin: 0 0 0.25rem; color: #607284; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.summary-grid, .board-grid, .calendar-list { display: grid; gap: 0.75rem; margin-top: 1rem; }
.summary-grid { grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr)); }
.board-grid { grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); }
.summary-grid div, .board-column, .board-card, .calendar-list a { border: 1px solid #e0e8f1; border-radius: 12px; background: white; padding: 0.85rem; }
small.route-hint { display: block; color: #607284; margin-top: 0.25rem; }
@media (max-width: 640px) { .task-list li, .resource-list li { flex-direction: column; } .app-nav { flex-wrap: wrap; } }
`;
}

function renderVisibilityModule() {
  return `export interface VisibilityRule { predicate?: string | null; }
export function canShowAction(_rule: VisibilityRule | null | undefined) { return true; }
`;
}

function renderLookupModule(defaultApiBaseUrl) {
  return `import { env as publicEnv } from "$env/dynamic/public";

export interface LookupOption { value: string; label: string; }
function apiBase() { return publicEnv.PUBLIC_TOPOGRAM_API_BASE_URL || "${defaultApiBaseUrl}"; }

export async function listLookupOptions(fetcher: typeof fetch, route: string): Promise<LookupOption[]> {
  const response = await fetcher(new URL(route, apiBase()).toString());
  if (!response.ok) return [];
  const payload = await response.json();
  const items = Array.isArray(payload) ? payload : Array.isArray(payload.items) ? payload.items : [];
  return items.map((item: any) => ({
    value: String(item.id ?? item.value ?? ""),
    label: String(item.name ?? item.title ?? item.label ?? item.id ?? item.value ?? "")
  })).filter((item: LookupOption) => item.value && item.label);
}
`;
}

function renderApiClientModule(webReference, defaultApiBaseUrl) {
  const primaryParam = webReference.client?.primaryParam || "id";
  const fns = webReference.client?.functionNames || {};
  const caps = webReference.client?.capabilityIds || {};
  const extra = Array.isArray(webReference.client?.extraFunctions) ? webReference.client.extraFunctions : [];
  const wrappers = [];
  if (fns.list && caps.list) wrappers.push(`export const ${fns.list} = (fetcher: Fetcher, input: Record<string, unknown> = {}, _options?: unknown) => requestCapability(fetcher, "${caps.list}", input);`);
  if (fns.get && caps.get) wrappers.push(`export const ${fns.get} = (fetcher: Fetcher, ${primaryParam}: string, _options?: unknown) => requestCapability(fetcher, "${caps.get}", { ${primaryParam} });`);
  if (fns.create && caps.create) wrappers.push(`export const ${fns.create} = (fetcher: Fetcher, input: Record<string, unknown>, _options?: unknown) => requestCapability(fetcher, "${caps.create}", input);`);
  if (fns.update && caps.update) wrappers.push(`export const ${fns.update} = (fetcher: Fetcher, ${primaryParam}: string, input: Record<string, unknown>, _options?: unknown) => requestCapability(fetcher, "${caps.update}", { ...input, ${primaryParam} });`);
  if (fns.terminal && caps.terminal) wrappers.push(`export const ${fns.terminal} = (fetcher: Fetcher, ${primaryParam}: string, input: Record<string, unknown> = {}, _options?: unknown) => requestCapability(fetcher, "${caps.terminal}", { ...input, ${primaryParam} });`);
  for (const entry of extra) {
    if (!entry?.name || !entry?.capabilityId) continue;
    if (entry.primaryParam) {
      wrappers.push(`export const ${entry.name} = (fetcher: Fetcher, ${entry.primaryParam}: string, input: Record<string, unknown> = {}, _options?: unknown) => requestCapability(fetcher, "${entry.capabilityId}", { ...input, ${entry.primaryParam} });`);
    } else {
      wrappers.push(`export const ${entry.name} = (fetcher: Fetcher, input: Record<string, unknown> = {}, _options?: unknown) => requestCapability(fetcher, "${entry.capabilityId}", input);`);
    }
  }
  return `import { env as publicEnv } from "$env/dynamic/public";
import rawApiContracts from "$lib/topogram/api-contracts.json";

type Fetcher = typeof fetch;
type ApiContract = {
  endpoint: { path: string; method?: string };
  requestContract?: { transport?: { path?: Array<{ name: string; transport: { wireName: string } }>; query?: Array<{ name: string; transport: { wireName: string } }> } };
};
const apiContracts = rawApiContracts as Record<string, ApiContract>;

function apiBase() { return publicEnv.PUBLIC_TOPOGRAM_API_BASE_URL || "${defaultApiBaseUrl}"; }

function buildPath(contract: ApiContract, input: Record<string, unknown>) {
  let path = contract.endpoint.path;
  for (const field of contract.requestContract?.transport?.path || []) {
    path = path.replace(\`:\${field.transport.wireName}\`, encodeURIComponent(String(input[field.name] ?? "")));
  }
  const params = new URLSearchParams();
  for (const field of contract.requestContract?.transport?.query || []) {
    const value = input[field.name];
    if (value !== undefined && value !== null && value !== "") params.set(field.transport.wireName, String(value));
  }
  const query = params.toString();
  return query ? \`\${path}?\${query}\` : path;
}

export async function requestCapability(fetcher: Fetcher, capabilityId: string, input: Record<string, unknown> = {}) {
  const contract = apiContracts[capabilityId];
  if (!contract) throw new Error(\`Missing API contract for capability: \${capabilityId}\`);
  const method = contract.endpoint.method || "GET";
  const headers = new Headers();
  const token = publicEnv.PUBLIC_TOPOGRAM_AUTH_TOKEN || "";
  if (token) headers.set("Authorization", "Bearer " + token);
  let body: string | undefined;
  if (!["GET", "HEAD"].includes(method)) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(input);
  }
  const response = await fetcher(new URL(buildPath(contract, input), apiBase()).toString(), { method, headers, body });
  if (!response.ok) throw new Error(\`Topogram API request failed: \${response.status}\`);
  if (response.status === 204) return null;
  return response.json();
}

${wrappers.join("\n")}
`;
}

function prettyScreenKind(kind) {
  return kind ? String(kind).replace(/_/g, " ") : "screen";
}

function lookupDescriptor(lookup) {
  if (!lookup?.entity?.id) return null;
  return { ...lookup, route: `/lookups/${slugify(String(lookup.entity.id).replace(/^entity_/, ""))}` };
}

function renderLayout(brand, routes) {
  const nav = routes
    .map((route) => `    <a href="${route.route}">${route.title}</a>`)
    .join("\n");
  return `<script lang="ts">
  export let data;
</script>

<svelte:head>
  <title>${brand}</title>
</svelte:head>

<div class="app-shell">
  <header class="app-nav">
    <a class="brand" href="/">${brand}</a>
    <nav>
${nav}
    </nav>
  </header>
  <slot />
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    color: #182026;
    background: linear-gradient(180deg, #f5f7fb 0%, #edf2f7 100%);
  }
  :global(a) { color: #0f5cc0; text-decoration: none; }
  :global(a:hover) { text-decoration: underline; }
  .app-shell { min-height: 100vh; }
  .app-nav {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(24, 32, 38, 0.08);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
  }
  nav { display: flex; flex-wrap: wrap; gap: 0.75rem; }
  .brand { font-weight: 700; }
  @media (max-width: 640px) { .app-nav { flex-wrap: wrap; } }
</style>
`;
}

function renderHomePage(contract, routes) {
  return `<script lang="ts">
  const screens = ${JSON.stringify(routes.map((route) => ({
    id: route.id,
    title: route.title,
    route: route.route
  })), null, 2)};
</script>

<main>
  <div class="stack">
    <section class="card hero">
      <div>
        <p class="muted">Generated starter</p>
        <h1>${contract.projection?.name || contract.projection?.id || "Topogram SvelteKit"}</h1>
        <p>This SvelteKit app was generated from a Topogram UI web contract.</p>
      </div>
      <div class="button-row">
        {#each screens.slice(0, 2) as screen}
          <a class="button-link" href={screen.route}>{screen.title}</a>
        {/each}
      </div>
    </section>

    <section class="grid two">
      {#each screens as screen}
        <article class="card">
          <h2>{screen.title}</h2>
          <p><a href={screen.route}>Open screen</a></p>
        </article>
      {/each}
    </section>
  </div>
</main>

<style>
  main { max-width: 72rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
  .card { background: white; border-radius: 16px; padding: 1.25rem; box-shadow: 0 12px 30px rgba(24, 32, 38, 0.08); }
  .hero, .stack, .grid { display: grid; gap: 1rem; }
  .grid.two { grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); }
  .button-row { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
  .button-link { display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; padding: 0.7rem 1rem; background: #0f5cc0; color: white; font-weight: 600; }
  .muted { color: #607284; }
</style>
`;
}

function renderScreenPage(route) {
  const items = sampleItemsForScreen(route.screen);
  return `<script lang="ts">
  const items = ${JSON.stringify(items, null, 2)};
</script>

<main>
  <div class="stack">
    <section class="card">
      <p class="muted">${route.screen?.kind || "screen"}</p>
      <h1>${route.title}</h1>
      <p>This SvelteKit page was generated from <code>${route.id}</code>.</p>
    </section>

    <section class="card">
      <h2>Sample rows</h2>
      <ul class="resource-list">
        {#each items as item}
          <li>
            <div class="resource-meta">
              <strong>{item.title}</strong>
              <span class="muted">{item.description}</span>
            </div>
            <span class="badge">{item.status}</span>
          </li>
        {/each}
      </ul>
    </section>
  </div>
</main>

<style>
  main { max-width: 72rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
  .stack { display: grid; gap: 1rem; }
  .card { background: white; border-radius: 16px; padding: 1.25rem; box-shadow: 0 12px 30px rgba(24, 32, 38, 0.08); }
  .resource-list { list-style: none; padding: 0; margin: 1rem 0 0; display: grid; gap: 0.75rem; }
  .resource-list li { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; padding: 1rem; border: 1px solid #e0e8f1; border-radius: 14px; background: #fbfcfe; }
  .resource-meta { display: grid; gap: 0.35rem; }
  .badge { display: inline-flex; align-items: center; padding: 0.25rem 0.6rem; border-radius: 999px; background: #eef4ff; color: #0f5cc0; font-size: 0.85rem; font-weight: 600; }
  .muted { color: #607284; }
</style>
`;
}

function routeFileFor(route) {
  const segment = routeSegment(route.route);
  return segment ? `src/routes/${segment}/+page.svelte` : "src/routes/+page.svelte";
}

function routePagePath(screen) {
  const clean = String(screen.route || "/").replace(/^\/+|\/+$/g, "");
  if (!clean) return "src/routes/+page.svelte";
  const segments = clean.split("/").filter(Boolean).map((segment) => segment.startsWith(":") ? `[${segment.slice(1)}]` : segment);
  return `src/routes/${segments.join("/")}/+page.svelte`;
}

function renderCoverage(contract, files, routes) {
  const screens = routes.map((route) => {
    const page = routeFileFor(route);
    return {
      id: route.id,
      route: route.route,
      page,
      rendered: Boolean(files[page]),
      renderer: files[page] ? "generator" : "missing",
      component_usages: []
    };
  });
  return {
    type: "generation_coverage",
    surface: "web",
    generator: manifest.id,
    projection: {
      id: contract.projection?.id,
      name: contract.projection?.name,
      platform: contract.projection?.platform
    },
    summary: {
      routed_screens: screens.length,
      rendered_screens: screens.filter((screen) => screen.rendered).length,
      implementation_screens: 0,
      generator_screens: screens.filter((screen) => screen.renderer === "generator").length,
      component_usages: 0,
      rendered_component_usages: 0,
      diagnostics: 0,
      errors: 0,
      warnings: 0
    },
    screens,
    diagnostics: []
  };
}

function generate(context) {
  const contract = context.contracts?.uiWeb;
  if (!contract) {
    throw new Error("@attebury/topogram-generator-sveltekit-web requires contracts.uiWeb.");
  }
  const routes = contractRoutes(contract);
  const projectionId = contract.projection?.id || context.projection?.id || "proj_ui_web";
  const implementation = context.implementation || {};
  const webImplementation = implementation.web || {};
  const webReference = webImplementation.reference || {};
  const runtimeReference = implementation.runtime?.reference || {};
  const webScreenReference = webImplementation.screenReference || {};
  const webRenderers = webImplementation.renderers || {};
  const hasImplementationRoutes = typeof webRenderers.renderHomePage === "function" && typeof webRenderers.renderRoutes === "function";
  const brand = contract.appShell?.brand || webReference.brandName || "Topogram SvelteKit";
  const files = {
    "package.json": renderPackageJson(projectionId),
    "svelte.config.js": renderSvelteConfig(),
    "vite.config.ts": renderViteConfig(),
    "tsconfig.json": renderTsconfig(),
    "src/app.html": renderAppHtml(),
    "src/app.css": renderAppCss(),
    "src/app.d.ts": "declare global { namespace App {} }\n\nexport {};\n",
    "src/routes/+layout.svelte": renderLayout(brand, routes),
    "src/routes/+page.svelte": renderHomePage(contract, routes),
    "src/lib/topogram/api-contracts.json": `${JSON.stringify(context.contracts?.api || {}, null, 2)}\n`,
    "src/lib/topogram/ui-web-contract.json": `${JSON.stringify(contract, null, 2)}\n`
  };
  if (hasImplementationRoutes) {
    files["src/routes/+page.svelte"] = webRenderers.renderHomePage({
      useTypescript: true,
      demoPrimaryEnvVar: webReference.home?.demoPrimaryEnvVar || "PUBLIC_TOPOGRAM_DEMO_PRIMARY_ID",
      screens: (contract.screens || []).map((screen) => ({
        id: screen.id,
        title: screen.title || screen.id,
        route: screen.route,
        navigable: Boolean(screen.route) && !String(screen.route).includes(":")
      })),
      projectionName: contract.projection?.name || projectionId,
      homeDescription: String(webReference.home?.heroDescriptionTemplate || "Generated from Topogram.").replace("PROFILE", "`sveltekit`"),
      webReference
    });
    files["src/lib/auth/visibility.ts"] = renderVisibilityModule();
    files["src/lib/api/client.ts"] = renderApiClientModule(webReference, `http://localhost:${runtimeReference.ports?.server || 3000}`);
    files["src/lib/api/lookups.ts"] = renderLookupModule(`http://localhost:${runtimeReference.ports?.server || 3000}`);
  }
  for (const route of routes) {
    files[routeFileFor(route)] = renderScreenPage(route);
  }
  if (hasImplementationRoutes) {
    const byId = new Map((contract.screens || []).map((screen) => [screen.id, screen]));
    const taskList = byId.get(webScreenReference.listScreenId);
    const taskDetail = byId.get(webScreenReference.detailScreenId);
    const taskCreate = byId.get(webScreenReference.createScreenId);
    const taskEdit = byId.get(webScreenReference.editScreenId);
    const taskExports = webScreenReference.exportsScreenId ? byId.get(webScreenReference.exportsScreenId) : null;
    if (taskList && taskDetail && taskCreate && taskEdit) {
      const taskListLookups = Object.fromEntries((taskList.lookups || []).map((lookup) => [lookup.field, lookupDescriptor(lookup)]));
      const taskCreateLookups = Object.fromEntries((taskCreate.lookups || []).map((lookup) => [lookup.field, lookupDescriptor(lookup)]));
      const taskEditLookups = Object.fromEntries((taskEdit.lookups || []).map((lookup) => [lookup.field, lookupDescriptor(lookup)]));
      for (const [relativePath, contents] of Object.entries(webRenderers.renderRoutes({
        useTypescript: true,
        contract,
        taskList,
        taskDetail,
        taskCreate,
        taskEdit,
        taskExports,
        taskListLookups,
        taskCreateLookups,
        taskEditLookups,
        projectEnvVar: webReference.createPrimary?.defaultContainerEnvVar || "PUBLIC_TOPOGRAM_DEMO_CONTAINER_ID",
        ownerEnvVar: webReference.createPrimary?.defaultAssigneeEnvVar || "PUBLIC_TOPOGRAM_DEMO_USER_ID",
        webReference,
        prettyScreenKind
      }))) {
        files[`src/routes/${relativePath}`] = contents;
      }
    }
  }
  files["src/lib/topogram/generation-coverage.json"] = `${JSON.stringify(renderCoverage(contract, files, routes), null, 2)}\n`;
  return {
    files,
    artifacts: {
      generator: manifest.id,
      projection: projectionId,
      routeCount: routes.length
    },
    diagnostics: []
  };
}

module.exports = { manifest, generate };
