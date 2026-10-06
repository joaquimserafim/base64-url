import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const temporary = await mkdtemp(join(tmpdir(), "base64-url-git-install-"));
const repository = join(temporary, "repository");
const consumer = join(temporary, "consumer");
const hooks = join(temporary, "empty-hooks");
const env = {
	...process.env,
	// Keep the caller's cache and offline settings, but exercise real lifecycles.
	npm_config_ignore_scripts: "false",
	npm_config_update_notifier: "false",
};

function run(command, args, cwd, shell = false) {
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

try {
	await Promise.all([repository, consumer, hooks].map((path) => mkdir(path)));
	// Snapshot the working tree, including new files and excluding deletions.
	// Git is read-only here; all subsequent Git writes target the temporary copy.
	const files = run(
		"git",
		["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
		root
	).split("\0");
	const generated = new Set([".git", "dist", "node_modules", "coverage"]);
	for (const file of new Set(files.filter(Boolean))) {
		if (generated.has(file.split("/")[0])) continue;
		try {
			await cp(join(root, file), join(repository, file));
		} catch (error) {
			if (error.code !== "ENOENT") throw error;
		}
	}
	run("git", ["init", "--quiet"], repository);
	run("git", ["add", "--all"], repository);
	run(
		"git",
		[
			"-c",
			`core.hooksPath=${hooks}`,
			"-c",
			"commit.gpgSign=false",
			"-c",
			"user.name=Package install test",
			"-c",
			"user.email=package-test@example.invalid",
			"commit",
			"--quiet",
			"--message=Package source snapshot",
		],
		repository
	);
	await writeFile(
		join(consumer, "package.json"),
		JSON.stringify({
			name: "base64-url-git-consumer-test",
			private: true,
			dependencies: {
				"base64-url": `git+${pathToFileURL(repository).href}`,
			},
		})
	);
	// Only fixed arguments pass through the Windows shim; the Git URL is data
	// in package.json so paths never become shell syntax.
	run(
		process.platform === "win32" ? "npm.cmd" : "npm",
		[
			"install",
			"--ignore-scripts=false",
			"--no-audit",
			"--no-fund",
			"--package-lock=false",
		],
		consumer,
		process.platform === "win32"
	);
	const installed = join(consumer, "node_modules/base64-url");
	assert.deepEqual((await readdir(installed)).sort(), [
		"LICENSE",
		"README.md",
		"dist",
		"package.json",
	]);
	assert.deepEqual((await readdir(join(installed, "dist"))).sort(), [
		"index.cjs",
		"index.cjs.map",
		"index.d.cts",
		"index.d.mts",
		"index.mjs",
		"index.mjs.map",
	]);
	for (const fixture of ["runtime.mjs", "runtime.cjs"]) {
		await cp(
			join(root, "test/fixtures/package", fixture),
			join(consumer, fixture)
		);
		run(process.execPath, [fixture], consumer);
	}
	console.log(
		"Git installation built the package and passed ESM/CJS checks."
	);
} finally {
	await rm(temporary, { recursive: true, force: true });
}
