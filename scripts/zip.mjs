import { execSync } from "child_process";
import { existsSync } from "fs";

const functions = ["search-places", "get-place"];

for (const fn of functions) {
  const input = `dist/${fn}/index.mjs`;
  const output = `dist/${fn}.zip`;

  if (!existsSync(input)) {
    console.error(
      `✗ Missing build output: ${input} — run 'npm run build' first`,
    );
    process.exit(1);
  }

  // -j strips directory paths so index.mjs lands at the zip root
  execSync(`zip -j ${output} ${input}`);
  console.log(`✓ Zipped ${fn} → ${output}`);
}
