import { spawn } from "node:child_process";

process.env.NODE_ENV = "development";

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      env: process.env,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

try {
  await run("pnpm", ["run", "build"]);
  await run("pnpm", ["run", "start"]);
} catch (error) {
  console.error(error);
  process.exit(1);
}
