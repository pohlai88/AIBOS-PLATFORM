import * as fs from "fs";
import * as path from "path";

export async function loadUI(enginePath: string) {
  const dir = path.join(enginePath, "ui");
  if (!fs.existsSync(dir)) return {};

  const files = fs.readdirSync(dir);
  const ui: any = {};

  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const content = JSON.parse(
      fs.readFileSync(path.join(dir, file), "utf-8")
    );
    ui[file.replace(".json", "")] = content;
  }

  return ui;
}

