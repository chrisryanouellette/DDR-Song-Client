import { execSync } from "node:child_process";

// import { globSync, writeFileSync } from "node:fs";

// const sea = {
//   main: "./dist/server.cjs",
//   output: "./sea/app",
//   executable: "./sea/node",
//   disableExperimentalSEAWarning: true,
//   assets: {},
// };

execSync("npm run build:client");
execSync("npm run build:server");
// for (const file of globSync("./dist/**/*")) {
//   if (!file.includes(".")) continue;
//   if (file.includes("server.cjs")) continue;
//   const key = file.replace("dist/", "");
//   sea.assets[key] = `./${file}`;
// }
// writeFileSync("./sea-config.json", JSON.stringify(sea, undefined, 2));
// execSync("node --build-sea sea-config.json");
