import * as esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/server.ts"],
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node20",
    outfile: "dist/server.cjs",
  })
  .catch(() => process.exit(1));
