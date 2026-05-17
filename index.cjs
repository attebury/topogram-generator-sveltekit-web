const manifest = require("./topogram-generator.json");

const DEFAULT_DESIGN_INTENT = Object.freeze({
  density: "comfortable",
  tone: "neutral",
  radiusScale: "medium",
  colorRoles: Object.freeze({ primary: "accent" }),
  typographyRoles: Object.freeze({ body: "readable", heading: "prominent" }),
  actionRoles: Object.freeze({ primary: "prominent" }),
  accessibility: Object.freeze({ contrast: "aa", focus: "visible" })
});

const DENSITY_VALUES = {
  compact: { spaceUnit: "0.75rem", pagePadding: "1.5rem 1rem 3rem", controlPadding: "0.55rem 0.75rem" },
  comfortable: { spaceUnit: "1rem", pagePadding: "2rem 1.25rem 4rem", controlPadding: "0.7rem 1rem" },
  spacious: { spaceUnit: "1.25rem", pagePadding: "2.5rem 1.5rem 5rem", controlPadding: "0.85rem 1.15rem" }
};
const RADIUS_VALUES = {
  none: { card: "0", control: "0", pill: "0" },
  small: { card: "8px", control: "8px", pill: "999px" },
  medium: { card: "14px", control: "12px", pill: "999px" },
  large: { card: "18px", control: "16px", pill: "999px" }
};
const COLOR_VALUES = { accent: "#0f5cc0", critical: "#b42318", danger: "#b42318", success: "#027a48", warning: "#b54708", neutral: "#516173", muted: "#607284" };
const TONE_VALUES = {
  neutral: { text: "#182026", muted: "#607284", background: "linear-gradient(180deg, #f5f7fb 0%, #edf2f7 100%)", surface: "#ffffff", surfaceSubtle: "#fbfcfe", border: "#d7e1ec" },
  operational: { text: "#182026", muted: "#607284", background: "linear-gradient(180deg, #f5f7fb 0%, #edf2f7 100%)", surface: "#ffffff", surfaceSubtle: "#fbfcfe", border: "#d7e1ec" },
  editorial: { text: "#1f2933", muted: "#5c6670", background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)", surface: "#ffffff", surfaceSubtle: "#f8fafc", border: "#d8dee8" },
  playful: { text: "#1f2937", muted: "#5b6472", background: "linear-gradient(180deg, #f7fbff 0%, #eef6ff 100%)", surface: "#ffffff", surfaceSubtle: "#f7fbff", border: "#d6e4f5" }
};

function cssToken(value) { return String(value || "default").replace(/[^A-Za-z0-9_-]/g, "_"); }
function mergeStringMap(source, fallback) { return { ...fallback, ...(source && typeof source === "object" ? source : {}) }; }
function normalizeDesignIntent(design) {
  const value = design && typeof design === "object" ? design : {};
  return {
    density: typeof value.density === "string" ? value.density : DEFAULT_DESIGN_INTENT.density,
    tone: typeof value.tone === "string" ? value.tone : DEFAULT_DESIGN_INTENT.tone,
    radiusScale: typeof value.radiusScale === "string" ? value.radiusScale : DEFAULT_DESIGN_INTENT.radiusScale,
    colorRoles: mergeStringMap(value.colorRoles, DEFAULT_DESIGN_INTENT.colorRoles),
    typographyRoles: mergeStringMap(value.typographyRoles, DEFAULT_DESIGN_INTENT.typographyRoles),
    actionRoles: mergeStringMap(value.actionRoles, DEFAULT_DESIGN_INTENT.actionRoles),
    accessibility: mergeStringMap(value.accessibility, DEFAULT_DESIGN_INTENT.accessibility)
  };
}
function tokenMapLines(map, prefix) {
  return Object.entries(map).sort(([left], [right]) => left.localeCompare(right)).map(([role, value]) => `  --topogram-design-${prefix}-${cssToken(role)}: ${cssToken(value)};`);
}
function renderDesignIntentCss(design) {
  const normalized = normalizeDesignIntent(design);
  const tone = TONE_VALUES[normalized.tone] || TONE_VALUES.neutral;
  const density = DENSITY_VALUES[normalized.density] || DENSITY_VALUES.comfortable;
  const radius = RADIUS_VALUES[normalized.radiusScale] || RADIUS_VALUES.medium;
  const primaryColor = COLOR_VALUES[normalized.colorRoles.primary] || COLOR_VALUES.accent;
  const dangerColor = COLOR_VALUES[normalized.colorRoles.danger] || COLOR_VALUES.critical;
  return `/* Topogram semantic design intent. Generators map normalized UI tokens to stack CSS here. */
:root {
  --topogram-design-density: ${cssToken(normalized.density)};
  --topogram-design-tone: ${cssToken(normalized.tone)};
  --topogram-design-radius-scale: ${cssToken(normalized.radiusScale)};
${tokenMapLines(normalized.colorRoles, "color").join("\n")}
${tokenMapLines(normalized.typographyRoles, "typography").join("\n")}
${tokenMapLines(normalized.actionRoles, "action").join("\n")}
${tokenMapLines(normalized.accessibility, "accessibility").join("\n")}
  --topogram-space-unit: ${density.spaceUnit};
  --topogram-page-padding: ${density.pagePadding};
  --topogram-control-padding: ${density.controlPadding};
  --topogram-radius-card: ${radius.card};
  --topogram-radius-control: ${radius.control};
  --topogram-radius-pill: ${radius.pill};
  --topogram-text-color: ${tone.text};
  --topogram-muted-color: ${tone.muted};
  --topogram-surface-background: ${tone.background};
  --topogram-surface-card: ${tone.surface};
  --topogram-surface-subtle: ${tone.surfaceSubtle};
  --topogram-border-color: ${tone.border};
  --topogram-action-primary-background: ${primaryColor};
  --topogram-action-primary-color: #ffffff;
  --topogram-action-danger-background: ${dangerColor};
  --topogram-focus-outline: 3px solid ${primaryColor};
}
`;
}
function requiredDesignMarkers(design) {
  return [
    { category: "density", role: null, value: design.density, marker: "--topogram-design-density" },
    { category: "tone", role: null, value: design.tone, marker: "--topogram-design-tone" },
    { category: "radius_scale", role: null, value: design.radiusScale, marker: "--topogram-design-radius-scale" },
    ...Object.entries(design.colorRoles).map(([role, value]) => ({ category: "color_roles", role, value, marker: `--topogram-design-color-${cssToken(role)}` })),
    ...Object.entries(design.typographyRoles).map(([role, value]) => ({ category: "typography_roles", role, value, marker: `--topogram-design-typography-${cssToken(role)}` })),
    ...Object.entries(design.actionRoles).map(([role, value]) => ({ category: "action_roles", role, value, marker: `--topogram-design-action-${cssToken(role)}` })),
    ...Object.entries(design.accessibility).map(([role, value]) => ({ category: "accessibility", role, value, marker: `--topogram-design-accessibility-${cssToken(role)}` }))
  ];
}
function buildDesignIntentCoverage(contract, files, cssPath) {
  const design = normalizeDesignIntent(contract?.designTokens);
  const css = files[cssPath] || "";
  const markers = requiredDesignMarkers(design);
  const mapped = markers.filter((item) => css.includes(item.marker));
  const missing = markers.filter((item) => !css.includes(item.marker));
  return {
    coverage: {
      status: missing.length === 0 ? "mapped" : "unmapped",
      css_path: cssPath,
      tokens: { density: design.density, tone: design.tone, radius_scale: design.radiusScale, color_roles: design.colorRoles, typography_roles: design.typographyRoles, action_roles: design.actionRoles, accessibility: design.accessibility },
      mapped: mapped.map((item) => ({ category: item.category, role: item.role, value: item.value, marker: item.marker })),
      missing: missing.map((item) => ({ category: item.category, role: item.role, value: item.value, marker: item.marker }))
    },
    diagnostics: missing.map((item) => ({
      code: "design_intent_not_mapped",
      severity: "error",
      category: item.category,
      role: item.role,
      value: item.value,
      marker: item.marker,
      message: `UI design intent token '${item.category}${item.role ? `.${item.role}` : ""}' was not mapped into ${cssPath}.`,
      suggested_fix: "Render Topogram semantic design variables before writing the web stylesheet."
    }))
  };
}

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

function isNavigableRoute(route) {
  return Boolean(route?.route) && !String(route.route).includes(":");
}

function statementsArray(graph) {
  if (Array.isArray(graph?.statements)) return graph.statements;
  return Object.values(graph?.statements || {});
}

function projectionCandidates(graph) {
  return [
    ...(Array.isArray(graph?.byKind?.projection) ? graph.byKind.projection : []),
    ...statementsArray(graph).filter((statement) => statement.kind === "projection")
  ];
}

function apiProjectionForContext(context) {
  const runtime = context.runtime || {};
  const apiRuntime = runtime.apiRuntime || runtime.apiComponent || null;
  const topologyApiId = apiRuntime?.projection?.id || runtime.apiProjectionId || null;
  const projections = projectionCandidates(context.graph || {});
  if (topologyApiId) {
    const match = projections.find((projection) => projection.id === topologyApiId && Array.isArray(projection.http));
    if (match) return match;
  }
  return projections.find((projection) => Array.isArray(projection.http) && projection.http.length > 0) || null;
}

function fieldTransport(field) {
  const location = field.location || field.in || field.transport?.location || "body";
  return {
    name: field.name || field.field || field.sourceName,
    sourceName: field.sourceName || field.name || field.field,
    required: Boolean(field.required),
    schema: field.schema || { type: "string" },
    transport: {
      location,
      wireName: field.wireName || field.as || field.transport?.wireName || field.name || field.field
    }
  };
}

function splitTransport(fields) {
  const output = { path: [], query: [], header: [], body: [] };
  for (const field of fields.map(fieldTransport).filter((item) => item.name)) {
    const location = output[field.transport.location] ? field.transport.location : "body";
    output[location].push(field);
  }
  return output;
}

function apiContractsForContext(context) {
  const existing = context.contracts?.api;
  if (existing && Object.keys(existing).length > 0) return existing;
  const server = context.contracts?.server;
  if (server && Array.isArray(server.routes)) {
    return Object.fromEntries(server.routes.map((route) => [route.capabilityId, {
      capability: { id: route.capabilityId },
      endpoint: { method: route.method, path: route.path, successStatus: route.successStatus },
      requestContract: route.requestContract || null,
      responseContract: route.responseContract || null
    }]).filter(([id]) => id));
  }
  const projection = apiProjectionForContext(context);
  if (!projection) return {};
  const fields = Array.isArray(projection.httpFields) ? projection.httpFields : [];
  return Object.fromEntries((projection.http || []).map((route) => {
    const capabilityId = route.capabilityId || route.capability?.id;
    const routeFields = fields.filter((field) => (field.capabilityId || field.capability?.id) === capabilityId && (field.direction || field.contract || "input") === "input");
    return [capabilityId, {
      capability: { id: capabilityId },
      endpoint: {
        method: route.method || "GET",
        path: route.path || "/",
        successStatus: route.success || route.successStatus || 200
      },
      requestContract: {
        fields: routeFields.map(fieldTransport).filter((item) => item.name),
        transport: splitTransport(routeFields)
      },
      responseContract: null
    }];
  }).filter(([id]) => id));
}

function sampleItemsForScreen(screen) {
  const title = screen?.title || screen?.id || "Resource";
  return [
    {
      id: "sample-active",
      title: `${title} sample`,
      message: `${title} sample`,
      description: "Generated from Topogram UI contract metadata.",
      category: "sample",
      priority: "medium",
      status: "active",
      dueAt: "2026-01-01",
      ownerId: "sample-owner"
    },
    {
      id: "sample-completed",
      title: `${title} completed sample`,
      message: `${title} completed sample`,
      description: "Second generated row for rendering checks.",
      category: "sample",
      priority: "low",
      status: "complete",
      dueAt: "2026-01-02",
      ownerId: "sample-owner"
    }
  ];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function widgetId(usage) {
  return usage?.widget?.id || "widget";
}

function widgetName(usage) {
  return usage?.widget?.name || usage?.widget?.id || "Widget";
}

function widgetContractFor(usage, widgetContracts) {
  const id = widgetId(usage);
  return widgetContracts?.[id] || {};
}

function widgetPatterns(usage, widgetContracts) {
  return widgetContractFor(usage, widgetContracts).patterns || [];
}

function widgetUsagePattern(usage, widgetContracts) {
  return usage?.pattern || widgetPatterns(usage, widgetContracts)[0] || null;
}

function widgetUsageSupport(usage, widgetContracts) {
  const pattern = widgetUsagePattern(usage, widgetContracts);
  return {
    pattern,
    supported: (manifest.widgetSupport?.patterns || []).includes(pattern || "")
  };
}

function displayFields(usage) {
  const fields = Array.isArray(usage?.displayFields) ? usage.displayFields : usage?.display?.fields || [];
  return fields.filter((field) => field?.name);
}

function displayFieldsLiteral(usage) {
  return JSON.stringify(displayFields(usage).map((field) => ({
    name: field.name,
    label: field.label || field.name,
    role: field.role || "metadata"
  })));
}

function fieldNameByRole(usage, roles, fallback) {
  const fields = displayFields(usage);
  const match = fields.find((field) => roles.includes(field.role || ""));
  return match?.name || fields[0]?.name || fallback;
}

function widgetAttrs(usage, screen) {
  return [
    `data-topogram-widget="${escapeHtml(widgetId(usage))}"`,
    `data-topogram-region="${escapeHtml(usage?.region || "")}"`,
    `data-topogram-screen="${escapeHtml(screen?.id || "")}"`
  ].join(" ");
}

function renderSummaryStats(usage, screen) {
  const fields = displayFieldsLiteral(usage);
  return `<section class="widget-card widget-summary" ${widgetAttrs(usage, screen)}>
      <div class="widget-header">
        <div>
          <p class="widget-eyebrow">Widget</p>
          <h2>${escapeHtml(widgetName(usage))}</h2>
        </div>
      </div>
      <dl class="widget-field-list">
        {#each ${fields} as field}
          <div>
            <dt>{field.label}</dt>
            <dd data-topogram-display-field={field.name}>{String(items[0]?.[field.name] ?? "")}</dd>
          </div>
        {/each}
      </dl>
      <div class="summary-grid">
        <div><strong>{items.length}</strong><span>Total</span></div>
        <div><strong>${displayFields(usage).length}</strong><span>Fields</span></div>
        <div><strong>{items.filter((item) => item && (item.id ?? item.uuid ?? item.key)).length}</strong><span>Identified</span></div>
      </div>
    </section>`;
}

function renderCollectionTable(usage, screen) {
  const fields = displayFieldsLiteral(usage);
  return `<div class="widget-card widget-table" ${widgetAttrs(usage, screen)}>
      <div class="widget-header">
        <div>
          <p class="widget-eyebrow">Widget</p>
          <h2>${escapeHtml(widgetName(usage))}</h2>
        </div>
        <span class="badge">{items.length} items</span>
      </div>
      <div class="table-wrap widget-table-wrap">
        <table class="resource-table data-grid">
          <thead>
            <tr>
              {#each ${fields} as field}
                <th data-topogram-display-field={field.name}>{field.label}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each items as item}
              <tr>
                {#each ${fields} as field}
                  <td data-topogram-display-field={field.name}>{String(item?.[field.name] ?? "")}</td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderBoard(usage, screen) {
  const fields = displayFieldsLiteral(usage);
  const groupFieldName = fieldNameByRole(usage, ["status", "priority", "metadata"], "status");
  const titleFieldName = fieldNameByRole(usage, ["primary", "identifier"], "title");
  const groupField = JSON.stringify(groupFieldName);
  const titleField = JSON.stringify(titleFieldName);
  return `<div class="widget-card widget-board" ${widgetAttrs(usage, screen)}>
      <div class="widget-header">
        <div>
          <p class="widget-eyebrow">Widget</p>
          <h2>${escapeHtml(widgetName(usage))}</h2>
        </div>
      </div>
      <div class="board-grid">
        {#each Array.from(new Set(items.map((item) => item?.[${groupField}] ?? "items"))) as group}
          <section class="board-column">
            <h3>{group}</h3>
            {#each items.filter((item) => (item?.[${groupField}] ?? "items") === group) as item}
              <div class="board-card">
                <strong data-topogram-display-field="${escapeHtml(titleFieldName)}">{item?.[${titleField}] ?? item.title ?? item.name ?? item.label ?? item.message ?? item.id ?? JSON.stringify(item)}</strong>
                <dl class="widget-field-list">
                  {#each ${fields} as field}
                    <div>
                      <dt>{field.label}</dt>
                      <dd data-topogram-display-field={field.name}>{String(item?.[field.name] ?? "")}</dd>
                    </div>
                  {/each}
                </dl>
              </div>
            {/each}
          </section>
        {/each}
      </div>
    </div>`;
}

function renderCalendar(usage, screen) {
  const fields = displayFieldsLiteral(usage);
  const dateFieldName = fieldNameByRole(usage, ["date"], "dueAt");
  const titleFieldName = fieldNameByRole(usage, ["primary", "identifier"], "title");
  const dateField = JSON.stringify(dateFieldName);
  const titleField = JSON.stringify(titleFieldName);
  return `<div class="widget-card widget-calendar" ${widgetAttrs(usage, screen)}>
      <div class="widget-header">
        <div>
          <p class="widget-eyebrow">Widget</p>
          <h2>${escapeHtml(widgetName(usage))}</h2>
        </div>
      </div>
      <div class="calendar-list">
        {#each items.filter((item) => item?.[${dateField}]) as item}
          <div class="calendar-card">
            <span data-topogram-display-field="${escapeHtml(dateFieldName)}">{item?.[${dateField}]}</span>
            <strong data-topogram-display-field="${escapeHtml(titleFieldName)}">{item?.[${titleField}] ?? item.title ?? item.name ?? item.label ?? item.message ?? item.id ?? JSON.stringify(item)}</strong>
            <dl class="widget-field-list">
              {#each ${fields} as field}
                <div>
                  <dt>{field.label}</dt>
                  <dd data-topogram-display-field={field.name}>{String(item?.[field.name] ?? "")}</dd>
                </div>
              {/each}
            </dl>
          </div>
        {/each}
      </div>
    </div>`;
}

function renderWidgetUsage(usage, screen, widgetContracts) {
  const pattern = widgetUsageSupport(usage, widgetContracts).pattern;
  if (pattern === "summary_stats") return renderSummaryStats(usage, screen);
  if (pattern === "board_view") return renderBoard(usage, screen);
  if (pattern === "calendar_view") return renderCalendar(usage, screen);
  if (pattern === "resource_table" || pattern === "data_grid_view") return renderCollectionTable(usage, screen);
  const id = escapeHtml(widgetId(usage));
  const name = escapeHtml(widgetName(usage));
  const region = escapeHtml(usage?.region || "region");
  return [
    '<section class="widget-card widget-generic" ' + widgetAttrs(usage, screen) + '>',
    '  <p class="widget-eyebrow">' + region + ' widget</p>',
    '  <h2>' + name + '</h2>',
    '  <p class="muted">Rendered from the Topogram widget contract.</p>',
    '</section>'
  ].join("\n");
}

function renderWidgetSections(screen, widgetContracts) {
  return (screen?.widgets || []).map((usage) => renderWidgetUsage(usage, screen, widgetContracts)).filter(Boolean).join("\n\n");
}

function renderSampleRowsSection() {
  return [
    '    <section class="card">',
    '      <h2>Sample rows</h2>',
    '      <ul class="resource-list">',
    '        {#each items as item}',
    '          <li>',
    '            <div class="resource-meta">',
    '              <strong>{item.title}</strong>',
    '              <span class="muted">{item.description}</span>',
    '            </div>',
    '            <span class="badge">{Object.keys(item).length} fields</span>',
    '          </li>',
    '        {/each}',
    '      </ul>',
    '    </section>'
  ].join("\n");
}

function widgetUsageRecordsForScreen(screen, widgetContracts, diagnostics, contents) {
  return (screen?.widgets || []).map((usage) => {
    const widget = widgetId(usage);
    const support = widgetUsageSupport(usage, widgetContracts);
    const status = support.supported ? "rendered" : "unsupported";
    const fields = displayFields(usage);
    const displayFieldMarkers = fields.map((field) => ({
      name: field.name,
      label: field.label || field.name,
      role: field.role || "metadata",
      rendered: Boolean(contents && contents.includes(`"name":"${field.name}"`) && contents.includes("data-topogram-display-field"))
    }));
    const displayFieldsRendered = fields.length > 0 && displayFieldMarkers.every((field) => field.rendered);
    const actualMarkers = {
      widget: Boolean(contents && contents.includes(`data-topogram-widget="${widget}"`)),
      region: Boolean(contents && contents.includes(`data-topogram-region="${usage?.region || ""}"`)),
      screen: Boolean(contents && contents.includes(`data-topogram-screen="${screen?.id || ""}"`))
    };
    if (!support.supported) {
      diagnostics.push({
        code: "widget_pattern_not_supported",
        severity: "error",
        screen: screen?.id || null,
        route: screen?.route || null,
        region: usage?.region || null,
        pattern: support.pattern || null,
        widget,
        message: `Screen '${screen?.id || "unknown"}' uses widget '${widget}' with unsupported SvelteKit widget pattern '${support.pattern || "(missing)"}'.`,
        suggested_fix: "Use a supported widget pattern for this generator or provide an implementation override."
      });
    }
    if (support.supported && fields.length === 0) {
      diagnostics.push({
        code: "widget_display_fields_unresolved",
        severity: "error",
        screen: screen?.id || null,
        route: screen?.route || null,
        region: usage?.region || null,
        pattern: support.pattern || null,
        widget,
        message: `Screen '${screen?.id || "unknown"}' uses widget '${widget}' but no contract display fields were resolved.`,
        suggested_fix: "Bind widget data to a capability with an output shape or add screen item/view/input shape metadata."
      });
    }
    if (support.supported && fields.length > 0 && !displayFieldsRendered) {
      diagnostics.push({
        code: "widget_display_fields_not_rendered",
        severity: "error",
        screen: screen?.id || null,
        route: screen?.route || null,
        region: usage?.region || null,
        pattern: support.pattern || null,
        widget,
        message: `Screen '${screen?.id || "unknown"}' uses widget '${widget}' but the generated SvelteKit page does not render the contract display fields.`,
        suggested_fix: "Render widget rows from usage.displayFields and preserve data-topogram-display-field markers."
      });
    }
    return {
      widget,
      region: usage?.region || null,
      pattern: support.pattern || null,
      supported: support.supported,
      status,
      rendered: actualMarkers.widget && actualMarkers.region && actualMarkers.screen,
      markers: {
        expected: {
          widget: `data-topogram-widget="${widget}"`,
          region: `data-topogram-region="${usage?.region || ""}"`,
          screen: `data-topogram-screen="${screen?.id || ""}"`
        },
        actual: actualMarkers
      },
      display: usage.display || null,
      display_fields: displayFieldMarkers,
      display_fields_rendered: displayFieldsRendered,
      behavior_realizations: usage.behaviorRealizations || []
    };
  });
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

function renderAppCss(design) {
  return `${renderDesignIntentCss(design)}

:root { font-family: system-ui, sans-serif; color: var(--topogram-text-color); background: var(--topogram-surface-background); }
body { margin: 0; }
a { color: var(--topogram-action-primary-background); text-decoration: none; }
a:hover { text-decoration: underline; }
main { max-width: 72rem; margin: 0 auto; padding: var(--topogram-page-padding); }
.app-shell { min-height: 100vh; }
.app-nav { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1.25rem; border-bottom: 1px solid rgba(24, 32, 38, 0.08); background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); }
.app-nav-links, .app-nav nav { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.brand { font-weight: 700; }
.card { background: var(--topogram-surface-card); border-radius: var(--topogram-radius-card); padding: 1.25rem; box-shadow: 0 12px 30px rgba(24, 32, 38, 0.08); }
.hero, .stack, .grid { display: grid; gap: var(--topogram-space-unit); }
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
.table-wrap, .widget-table-wrap { margin-top: 1rem; overflow-x: auto; border: 1px solid #d7e1ec; border-radius: 14px; background: white; }
.resource-table { width: 100%; border-collapse: collapse; min-width: 42rem; }
.resource-table th, .resource-table td { padding: 0.85rem 1rem; text-align: left; border-bottom: 1px solid #e7edf5; vertical-align: top; }
.resource-table th { font-size: 0.85rem; letter-spacing: 0.04em; text-transform: uppercase; color: #516173; background: #f8fbff; }
.data-grid { min-width: 64rem; font-size: 0.95rem; }
.badge { display: inline-flex; align-items: center; padding: 0.25rem 0.6rem; border-radius: 999px; background: #eef4ff; color: #0f5cc0; font-size: 0.85rem; font-weight: 600; }
.muted { color: var(--topogram-muted-color); }
.empty-state { padding: 1rem 0; }
.widget-card { border: 1px solid #d7e1ec; border-radius: 14px; background: #fbfcfe; padding: 1rem; margin-top: 1rem; }
.widget-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.widget-eyebrow { margin: 0 0 0.25rem; color: #607284; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.summary-grid, .board-grid, .calendar-list { display: grid; gap: 0.75rem; margin-top: 1rem; }
.summary-grid { grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr)); }
.board-grid { grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); }
.summary-grid div, .board-column, .board-card, .calendar-card { border: 1px solid #e0e8f1; border-radius: 12px; background: white; padding: 0.85rem; }
.widget-field-list { display: grid; gap: 0.35rem; margin: 0.75rem 0 0; }
.widget-field-list div { display: grid; grid-template-columns: 9rem minmax(0, 1fr); gap: 0.75rem; align-items: baseline; }
.widget-field-list dt { color: #607284; font-size: 0.8rem; font-weight: 700; }
.widget-field-list dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
small.route-hint { display: block; color: #607284; margin-top: 0.25rem; }
@media (max-width: 640px) { .task-list li, .resource-list li { flex-direction: column; } .app-nav { flex-wrap: wrap; } }
`;
}

function renderVisibilityModule() {
  return `import { env as publicEnv } from "$env/dynamic/public";

export interface VisibilityRule {
  predicate?: string | null;
  value?: string | null;
  permission?: string | null;
  ownershipField?: string | null;
}
export interface VisibilityDebug { userId?: string | null; permissions?: string | null; isAdmin?: string | boolean | null; }

function truthy(value: unknown) {
  return value === true || value === "true" || value === "1" || value === "yes";
}

function currentUser(debug?: VisibilityDebug | null) {
  return debug?.userId || publicEnv.PUBLIC_TOPOGRAM_AUTH_USER_ID || "";
}

function hasDebugUser(debug?: VisibilityDebug | null) {
  return Boolean(debug?.userId);
}

function currentPermissions(debug?: VisibilityDebug | null) {
  const permissions = hasDebugUser(debug) ? debug?.permissions : (debug?.permissions || publicEnv.PUBLIC_TOPOGRAM_AUTH_PERMISSIONS);
  return String(permissions || "").split(/[\\s,]+/).filter(Boolean);
}

function isAdmin(debug?: VisibilityDebug | null) {
  if (hasDebugUser(debug)) return truthy(debug?.isAdmin) || currentPermissions(debug).includes("*");
  return truthy(debug?.isAdmin) || truthy(publicEnv.PUBLIC_TOPOGRAM_AUTH_ADMIN) || currentPermissions(debug).includes("*");
}

export function canShowAction(rule: VisibilityRule | null | undefined, resource?: Record<string, unknown> | null, debug?: VisibilityDebug | null) {
  if (!rule) return true;
  if (rule.permission && !currentPermissions(debug).includes(rule.permission) && !currentPermissions(debug).includes("*")) return false;
  if (rule.predicate === "ownership") {
    if (rule.value === "owner_or_admin" && isAdmin(debug)) return true;
    const field = rule.ownershipField || "owner_id";
    return Boolean(currentUser(debug)) && String(resource?.[field] || "") === currentUser(debug);
  }
  return true;
}
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
    .filter(isNavigableRoute)
    .map((route) => `    <a href="${route.route}">${route.title}</a>`)
    .join("\n");
  return `<script lang="ts">
  import "../app.css";
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
    color: var(--topogram-text-color);
    background: var(--topogram-surface-background);
  }
  :global(a) { color: var(--topogram-action-primary-background); text-decoration: none; }
  :global(a:hover) { text-decoration: underline; }
  .app-shell { min-height: 100vh; }
  .app-nav {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--topogram-space-unit);
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
  const navigableRoutes = routes.filter(isNavigableRoute);
  return `<script lang="ts">
  const screens = ${JSON.stringify(navigableRoutes.map((route) => ({
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
  const sampleSection = renderWidgetSections(route.screen, route.contract?.widgets || {}) || renderSampleRowsSection();
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

    ${sampleSection}
  </div>
</main>

<style>
  main { max-width: 72rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
  .stack { display: grid; gap: 1rem; }
  .card { background: white; border-radius: 16px; padding: 1.25rem; box-shadow: 0 12px 30px rgba(24, 32, 38, 0.08); }
  .muted { color: #607284; }
</style>
`;
}

function routeFileFor(route) {
  return routePagePath(route);
}

function routePagePath(screen) {
  const clean = String(screen.route || "/").replace(/^\/+|\/+$/g, "");
  if (!clean) return "src/routes/+page.svelte";
  const segments = clean.split("/").filter(Boolean).map((segment) => segment.startsWith(":") ? `[${segment.slice(1)}]` : segment);
  return `src/routes/${segments.join("/")}/+page.svelte`;
}

function renderCoverage(contract, files, routes) {
  const diagnostics = [];
  const designIntent = buildDesignIntentCoverage(contract, files, "src/app.css");
  diagnostics.push(...designIntent.diagnostics);
  const widgetContracts = contract.widgets || {};
  const screens = routes.map((route) => {
    const page = routeFileFor(route);
    return {
      id: route.id,
      route: route.route,
      page,
      rendered: Boolean(files[page]),
      renderer: files[page] ? "generator" : "missing",
      widget_usages: widgetUsageRecordsForScreen(route.screen, widgetContracts, diagnostics, files[page] || "")
    };
  });
  const usageCount = screens.reduce((total, screen) => total + screen.widget_usages.length, 0);
  const errorCount = diagnostics.filter((diagnostic) => diagnostic.severity === "error").length;
  const warningCount = diagnostics.filter((diagnostic) => diagnostic.severity === "warning").length;
  return {
    type: "generation_coverage",
    surface: "web",
    generator: manifest.id,
    projection: {
      id: contract.projection?.id,
      name: contract.projection?.name,
      type: contract.projection?.type
    },
    summary: {
      routed_screens: screens.length,
      rendered_screens: screens.filter((screen) => screen.rendered).length,
      implementation_screens: 0,
      generator_screens: screens.filter((screen) => screen.renderer === "generator").length,
      widget_usages: usageCount,
      rendered_widget_usages: screens.reduce((total, screen) => total + screen.widget_usages.filter((usage) => usage.rendered).length, 0),
      display_field_widget_usages: screens.reduce((total, screen) => total + screen.widget_usages.filter((usage) => usage.display_fields_rendered).length, 0),
      diagnostics: diagnostics.length,
      errors: errorCount,
      warnings: warningCount
    },
    design_intent: designIntent.coverage,
    screens,
    diagnostics
  };
}

function assertGenerationCoverage(coverage) {
  const errors = (coverage.diagnostics || []).filter((diagnostic) => diagnostic.severity === "error");
  if (errors.length === 0) {
    return;
  }
  const details = errors.map((diagnostic) => diagnostic.message).join("; ");
  throw new Error(`SvelteKit generation coverage failed: ${details}`);
}

function generate(context) {
  const contract = context.contracts?.uiSurface;
  if (!contract) {
    throw new Error("@topogram/generator-sveltekit-web requires contracts.uiSurface.");
  }
  const routes = contractRoutes(contract);
  const projectionId = contract.projection?.id || context.projection?.id || "proj_web_surface";
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
    "src/app.css": renderAppCss(contract.designTokens),
    "src/app.d.ts": "declare global { namespace App {} }\n\nexport {};\n",
    "src/routes/+layout.svelte": renderLayout(brand, routes),
    "src/routes/+page.svelte": renderHomePage(contract, routes),
    "src/lib/topogram/api-contracts.json": `${JSON.stringify(apiContractsForContext(context), null, 2)}\n`,
    "src/lib/topogram/ui-surface-contract.json": `${JSON.stringify(contract, null, 2)}\n`
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
    files[routeFileFor(route)] = renderScreenPage({ ...route, contract });
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
  const coverage = renderCoverage(contract, files, routes);
  assertGenerationCoverage(coverage);
  files["src/lib/topogram/generation-coverage.json"] = `${JSON.stringify(coverage, null, 2)}\n`;
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
