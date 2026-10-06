import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);
// Accept a package name or directory so consumer checks can cover older compilers.
const typescriptPackage = process.env.BASE64_URL_TYPESCRIPT || "typescript";
const tsc = require.resolve(`${typescriptPackage}/bin/tsc`);
const typescript = require(`${typescriptPackage}/package.json`);
const temporary = await mkdtemp(join(tmpdir(), "base64-url-package-"));
const env = {
	...process.env,
	npm_config_cache: join(temporary, "npm-cache"),
	npm_config_offline: "true",
	npm_config_ignore_scripts: "true",
	npm_config_update_notifier: "false",
	npm_config_pack_destination: temporary,
};

function run(command, args, cwd = temporary, shell = false) {
	const result = spawnSync(command, args, {
		cwd,
		env,
		shell,
		encoding: "utf8",
	});
	if (result.error) throw result.error;
	assert.equal(
		result.status,
		0,
		`${command} ${args.join(" ")} failed:\n${result.stdout}${result.stderr}`
	);
	return result.stdout;
}

function npm(args, cwd) {
	// Windows runs npm through its .cmd shim. All arguments are fixed strings;
	// paths with spaces are supplied through cwd and the environment instead.
	return run(
		process.platform === "win32" ? "npm.cmd" : "npm",
		args,
		cwd,
		process.platform === "win32"
	);
}

async function compile(name, options, files) {
	const config = join(temporary, `tsconfig.${name}.json`);
	await writeFile(
		config,
		JSON.stringify({
			compilerOptions: {
				target: "ES2022",
				strict: true,
				skipLibCheck: false,
				noEmit: true,
				types: [],
				lib: ["ES2022"],
				...options,
			},
			files,
		})
	);
	run(process.execPath, [tsc, "--project", config]);
}

try {
	const [packed] = JSON.parse(
		npm(["pack", "--ignore-scripts", "--json"], root)
	);
	const files = packed.files.map((file) => file.path);
	for (const required of [
		"package.json",
		"LICENSE",
		"README.md",
		"dist/index.mjs",
		"dist/index.cjs",
		"dist/index.mjs.map",
		"dist/index.cjs.map",
		"dist/index.d.mts",
		"dist/index.d.cts",
	]) {
		assert.ok(files.includes(required), `Package is missing ${required}`);
	}
	assert.ok(
		files.every(
			(file) =>
				file.startsWith("dist/") ||
				["package.json", "LICENSE", "README.md"].includes(file)
		),
		`Unexpected published files: ${files.join(", ")}`
	);

	await rename(
		join(temporary, packed.filename),
		join(temporary, "package.tgz")
	);
	await writeFile(
		join(temporary, "package.json"),
		JSON.stringify({
			name: "base64-url-consumer-test",
			private: true,
			type: "commonjs",
		})
	);
	npm([
		"install",
		"--offline",
		"--ignore-scripts",
		"--no-audit",
		"--no-fund",
		"--package-lock=false",
		"./package.tgz",
	]);

	const installed = join(temporary, "node_modules/base64-url");
	const manifest = JSON.parse(
		await readFile(join(installed, "package.json"), "utf8")
	);
	assert.equal(manifest.exports["."].import.types, "./dist/index.d.mts");
	assert.equal(manifest.exports["."].require.types, "./dist/index.d.cts");
	assert.equal(manifest.types, "./dist/index.d.cts");
	for (const filename of ["index.mjs", "index.cjs"]) {
		const code = await readFile(join(installed, "dist", filename), "utf8");
		const sourceMaps = [
			...code.matchAll(/^\/\/# sourceMappingURL=([^\r\n]+)/gm),
		].map((match) => match[1]);
		assert.deepEqual(sourceMaps, [`${filename}.map`]);
		assert.match(
			code,
			filename.endsWith(".mjs")
				? /from ["']node:buffer["']/
				: /require\(["']node:buffer["']\)/
		);
	}

	await cp(join(root, "test/fixtures/package"), temporary, {
		recursive: true,
	});
	run(process.execPath, ["runtime.mjs"]);
	run(process.execPath, ["runtime.cjs"]);
	await compile("node", { module: "Node16", moduleResolution: "Node16" }, [
		"consumer.mts",
		"consumer.cts",
	]);
	await compile(
		"node-web",
		{
			module: "Node16",
			moduleResolution: "Node16",
			lib: ["ES2022", "DOM"],
		},
		["web.mts", "web.cts"]
	);
	await compile(
		"browser",
		{
			module: "ESNext",
			moduleResolution: "Bundler",
			lib: ["ES2022", "DOM"],
		},
		["browser.ts"]
	);
	await compile(
		"legacy",
		{
			module: "CommonJS",
			moduleResolution: "Node10",
			esModuleInterop: false,
			noEmit: false,
			outDir: "./emitted",
			...(Number.parseInt(typescript.version, 10) >= 6
				? { ignoreDeprecations: "6.0" }
				: {}),
		},
		["legacy.ts"]
	);
	run(process.execPath, ["emitted/legacy.js"]);
	console.log(
		`Packed package passed ESM, CommonJS, and TypeScript ${typescript.version} consumer checks.`
	);
} finally {
	await rm(temporary, { recursive: true, force: true });
}
