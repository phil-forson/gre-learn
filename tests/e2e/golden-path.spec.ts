import { test, expect } from "@playwright/test";

test("golden path: dashboard, add, detail, audio", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "GRE Learn" })).toBeVisible();

  const input = page.getByLabel("Add a word you just encountered");
  await input.fill("obdurate");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByRole("status")).toContainText(/Ready|already/i, {
    timeout: 15000,
  });

  await page.getByRole("link", { name: "Open word" }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Obdurate/i);
  await expect(page.getByText("Root / Origin")).toBeVisible();
  await expect(page.getByText("Memory Hook")).toBeVisible();

  await page.getByRole("link", { name: "Play word lesson" }).click();
  await expect(page.getByRole("button", { name: "Play" })).toBeVisible({
    timeout: 15000,
  });
});
