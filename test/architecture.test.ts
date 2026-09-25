import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

type PackageManifest = Readonly<{
  name: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}>;

const packagesRoot = join(import.meta.dir, "..", "packages");

function readPackageManifests(): PackageManifest[] {
  return readdirSync(packagesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const path = join(packagesRoot, entry.name, "package.json");
      return JSON.parse(readFileSync(path, "utf8")) as PackageManifest;
    });
}

function declaredDependencies(manifest: PackageManifest): string[] {
  return [
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
    ...Object.keys(manifest.optionalDependencies ?? {}),
  ];
}

function isWebFrameworkDependency(name: string): boolean {
  return (
    name === "react" ||
    name === "react-dom" ||
    name === "next" ||
    name === "tailwindcss" ||
    name.startsWith("@next/") ||
    name.startsWith("@tailwindcss/")
  );
}

describe("architecture boundaries", () => {
  const manifests = readPackageManifests();
  const byName = new Map(manifests.map((manifest) => [manifest.name, manifest]));

  test("headless packages do not depend on web frameworks", () => {
    for (const manifest of manifests) {
      const forbidden = declaredDependencies(manifest).filter(isWebFrameworkDependency);
      expect(forbidden).toEqual([]);
    }
  });

  test("game-core remains dependency-free", () => {
    const core = byName.get("@puzzle-game-core/game-core");
    expect(core).toBeDefined();
    expect(Object.keys(core?.dependencies ?? {})).toEqual([]);
  });

  test("game-session depends only on game-core", () => {
    const session = byName.get("@puzzle-game-core/game-session");
    expect(session).toBeDefined();
    expect(Object.keys(session?.dependencies ?? {}).sort()).toEqual([
      "@puzzle-game-core/game-core",
    ]);
  });

  test("domain game packages stay independent of game-session", () => {
    for (const manifest of manifests) {
      if (
        manifest.name === "@puzzle-game-core/game-core" ||
        manifest.name === "@puzzle-game-core/game-session"
      ) {
        continue;
      }

      expect(Object.keys(manifest.dependencies ?? {})).not.toContain(
        "@puzzle-game-core/game-session",
      );
    }
  });
});
