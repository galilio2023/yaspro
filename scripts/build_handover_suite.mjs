import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("=== COMPILING CLIENT HANDOVER PDF VIA CHROMIUM/EDGE ===");

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const htmlPath = path.resolve("CLIENT_HANDOVER_AND_USER_GUIDE.html");
const pdfPath = path.resolve("CLIENT_HANDOVER_AND_USER_GUIDE.pdf");

if (!fs.existsSync(htmlPath)) {
  console.error("HTML file not found:", htmlPath);
  process.exit(1);
}

const fileUri = `file:///${htmlPath.replace(/\\/g, "/")}`;

try {
  execFileSync(edgePath, [
    "--headless",
    "--disable-gpu",
    "--run-all-compositor-stages-before-draw",
    `--print-to-pdf=${pdfPath}`,
    fileUri
  ]);
  const stats = fs.statSync(pdfPath);
  console.log(`PDF successfully generated at: ${pdfPath}`);
  console.log(`Size: ${stats.size} bytes`);
} catch (err) {
  console.error("Failed to compile PDF:", err);
  process.exit(1);
}
