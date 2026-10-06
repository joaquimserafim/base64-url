import { readFile, writeFile } from "node:fs/promises";
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
	async onSuccess() {
		// tsup's Rollup pass repeats the source map comment. Blank only identical
		// repeats, preserving all newlines so generated source locations stay intact.
		for (const filename of ["index.mjs", "index.cjs"]) {
			const path = new URL(`./dist/${filename}`, import.meta.url);
			const code = await readFile(path, "utf8");
			const seen = new Set<string>();
			await writeFile(
				path,
				code.replace(
					/^\/\/# sourceMappingURL=[^\r\n]+/gm,
					(comment) => {
						if (seen.has(comment)) return "";
						seen.add(comment);
						return comment;
					}
				)
			);
		}
	},
});
