const { execSync } = require("child_process");

if (process.env.VERCEL) {
  console.log("Skipping backend install on Vercel.");
  process.exit(0);
}

execSync("npm --prefix backend install", { stdio: "inherit" });
