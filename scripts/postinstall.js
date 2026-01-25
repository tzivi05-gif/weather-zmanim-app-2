const { execFileSync, execSync } = require("child_process");

if (process.env.VERCEL) {
  console.log("Skipping backend install on Vercel.");
  process.exit(0);
}

const npmExecPath = process.env.npm_execpath;

if (npmExecPath) {
  execFileSync(process.execPath, [npmExecPath, "--prefix", "backend", "install"], {
    stdio: "inherit"
  });
} else {
  execSync("npm --prefix backend install", { stdio: "inherit" });
}
