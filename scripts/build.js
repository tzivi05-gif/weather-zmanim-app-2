const { execSync } = require("child_process");

if (!process.env.VERCEL) {
  execSync("npm --prefix backend install", { stdio: "inherit" });
}

const command = process.env.VERCEL
  ? "react-scripts build"
  : "npm run build:server && react-scripts build";

execSync(command, { stdio: "inherit" });
