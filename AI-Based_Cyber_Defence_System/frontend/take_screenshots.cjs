const puppeteer = require("puppeteer-core");
const path = require("path");

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const artifactDir = "C:\\Users\\91737\\.gemini\\antigravity\\brain\\f9c60f18-4181-4606-a88e-831e6266aa00";

async function run() {
  console.log("Launching Edge browser via puppeteer-core...");
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  console.log("Navigating to http://localhost:5173/ ...");
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

  // If login form is visible, submit it; otherwise already on dashboard
  const loginInput = await page.$('input[name="email"]');
  if (loginInput) {
    console.log("Logging in...");
    await page.type('input[name="email"]', "arshiya@cyberdefence.com");
    await page.type('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1500));
  }

  // 1. Capture Attack Category Distribution (Dashboard middle section / donut chart)
  console.log("Capturing Attack Category Distribution...");
  await page.screenshot({
    path: path.join(artifactDir, "attack_category_distribution.png"),
    fullPage: false
  });

  // 2. Capture Network Threat Detection Results (Dashboard bottom section / Alerts table)
  console.log("Capturing Network Threat Detection Results...");
  await page.evaluate(() => {
    window.scrollTo(0, 480);
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(artifactDir, "network_threat_detection_results.png"),
    fullPage: false
  });

  // 3. Click "AI Prediction" tab in sidebar
  console.log("Navigating to AI Prediction tab...");
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const items = Array.from(document.querySelectorAll(".menu-item"));
    const predTab = items.find(el => el.textContent.includes("AI Prediction"));
    if (predTab) predTab.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Scroll to Model Performance Comparison & Confusion Matrix
  await page.evaluate(() => {
    window.scrollTo(0, 220);
  });
  await new Promise(r => setTimeout(r, 800));

  console.log("Capturing Model Performance Comparison...");
  await page.screenshot({
    path: path.join(artifactDir, "model_performance_comparison.png"),
    fullPage: false
  });

  await browser.close();
  console.log("All three target screenshots successfully captured!");
}

run().catch(err => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
