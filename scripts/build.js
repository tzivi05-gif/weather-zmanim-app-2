const { execSync } = require("child_process");

const command = process.env.VERCEL
  ? "react-scripts build"
  : "npm run build:server && react-scripts build";

execSync(command, { stdio: "inherit" });
