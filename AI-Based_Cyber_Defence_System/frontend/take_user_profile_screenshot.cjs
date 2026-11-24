const puppeteer = require("puppeteer-core");
const path = require("path");

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const artifactDir = "C:\\Users\\91737\\.gemini\\antigravity\\brain\\f9c60f18-4181-4606-a88e-831e6266aa00";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  await page.goto("http://localhost:5173/", { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

  // Click User Profile tab
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll(".menu-item"));
    const profileTab = items.find(el => el.textContent.includes("User Profile"));
    if (profileTab) profileTab.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({
    path: path.join(artifactDir, "user_profile_screenshot.png"),
    fullPage: false
  });

  await browser.close();
  console.log("User profile screenshot successfully captured!");
}

run().catch(err => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
