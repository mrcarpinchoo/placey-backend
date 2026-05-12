import { build } from "esbuild";

const functions = [
  { name: "search-places", entry: "src/routes/search-places.mjs" },
  { name: "get-place", entry: "src/routes/get-place.mjs" },
];

for (const fn of functions) {
  await build({
    entryPoints: [fn.entry],
    bundle: true,
    platform: "node",
    target: "node24",
    format: "esm",
    outfile: `dist/${fn.name}/index.mjs`,
    // AWS SDK is available in the Lambda runtime — no need to bundle it
    external: ["@aws-sdk/*"],
    banner: {
      // Required for ESM bundles that use CommonJS packages (e.g. pg)
      js: `
import { createRequire } from "module";
const require = createRequire(import.meta.url);
`.trim(),
    },
  });

  console.log(`✓ Built ${fn.name} → dist/${fn.name}/index.mjs`);
}
