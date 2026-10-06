import { readFile, rename, writeFile } from "node:fs/promises";

// tsup emits .d.ts for ESM; match the explicit .mjs runtime extension.
await rename(
	new URL("../dist/index.d.ts", import.meta.url),
	new URL("../dist/index.d.mts", import.meta.url)
);

// tsup's Rollup pass repeats the source map comment. Blank only identical
// repeats, preserving all newlines so generated source locations stay intact.
for (const filename of ["index.mjs", "index.cjs"]) {
	const path = new URL(`../dist/${filename}`, import.meta.url);
	const code = await readFile(path, "utf8");
	const seen = new Set();
	await writeFile(
		path,
		code.replace(/^\/\/# sourceMappingURL=[^\r\n]+/gm, (comment) => {
			if (seen.has(comment)) return "";
			seen.add(comment);
			return comment;
		})
	);
}
