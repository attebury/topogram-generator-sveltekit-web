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
    devDependencies: {}
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
  const brand = contract.appShell?.brand || "Topogram SvelteKit";
  const files = {
    "package.json": renderPackageJson(projectionId),
    "svelte.config.js": renderSvelteConfig(),
    "vite.config.ts": renderViteConfig(),
    "tsconfig.json": renderTsconfig(),
    "src/app.d.ts": "declare global { namespace App {} }\n\nexport {};\n",
    "src/routes/+layout.svelte": renderLayout(brand, routes),
    "src/routes/+page.svelte": renderHomePage(contract, routes),
    "src/lib/topogram/api-contracts.json": `${JSON.stringify(context.contracts?.api || {}, null, 2)}\n`,
    "src/lib/topogram/ui-web-contract.json": `${JSON.stringify(contract, null, 2)}\n`
  };
  for (const route of routes) {
    files[routeFileFor(route)] = renderScreenPage(route);
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
