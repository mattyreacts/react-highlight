import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  external: ['react', '@mui/material'], // Exclude React from the bundle
  format: ["cjs", "esm"], // Build for commonJS and ESmodules
  dts: true, // Generate declaration file (.d.ts)
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true
});