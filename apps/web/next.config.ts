import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  transpilePackages: [
    "@puzzle-game-core/game-core",
    "@puzzle-game-core/game-session",
    "@puzzle-game-core/lights-out",
    "@puzzle-game-core/sudoku",
    "@puzzle-game-core/tower-of-hanoi",
  ],
};

export default nextConfig;
