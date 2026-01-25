const { execFileSync, execSync } = require("child_process");
const path = require("path");

if (process.env.VERCEL) {
  console.log("Skipping backend install on Vercel.");
  process.exit(0);
}

const npmExecPath = process.env.npm_execpath;

if (npmExecPath) {
  const nodeBinDir = path.dirname(process.execPath);
  const nextEnv = {
    ...process.env,
    PATH: process.env.PATH
      ? `${nodeBinDir};${process.env.PATH}`
      : nodeBinDir
  };

  execFileSync(
    process.execPath,
    [npmExecPath, "--prefix", "backend", "install"],
    { stdio: "inherit", env: nextEnv }
  );
} else {
  execSync("npm --prefix backend install", { stdio: "inherit" });
}
