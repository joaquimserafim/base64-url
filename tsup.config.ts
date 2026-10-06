import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm", "cjs"],
	dts: {
		// tsup 8.5 injects baseUrl for declaration generation; TypeScript 6 deprecates it.
		compilerOptions: { ignoreDeprecations: "6.0" },
	},
	sourcemap: true,
	clean: true,
	treeshake: true,
	minify: false,
	target: "node24",
	platform: "node",
	removeNodeProtocol: false,
	outDir: "dist",
	outExtension({ format }) {
		return { js: format === "esm" ? ".mjs" : ".cjs" };
	},
});
