import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/extension/index.ts"],
  format: ["cjs"],
  outDir: "dist",
  external: ["vscode"],
  sourcemap: true,
  clean: true,
  minify: false,
  dts: false,
  shims: false,
  splitting: false,
});
