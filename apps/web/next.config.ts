import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  transpilePackages: [
    "@puzzle-game-core/game-core",
    "@puzzle-game-core/sudoku",
  ],
};

export default nextConfig;
