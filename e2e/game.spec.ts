import { test, expect } from '@playwright/test';

test.describe('ページ読み込み', () => {
  test('タイトルが正しく表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Chiversi/);
  });

  test('アプリバーにタイトルが表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Chiversi — 千葉県行政区域オセロ')).toBeVisible();
  });

  test('初期スコアが黒2・白2で表示される', async ({ page }) => {
    await page.goto('/');
    const scoreEl = page.locator('p', { hasText: 'スコア' });
    await expect(scoreEl).toContainText('黒 2');
    await expect(scoreEl).toContainText('白 2');
  });

  test('手番インジケーターが黒（あなた）を示す', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/黒（あなた）/)).toBeVisible();
  });
});

test.describe('UIボタン', () => {
  test('ルール説明モーダルが開閉できる', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'ルール説明' }).click();
    await expect(page.getByText('ルール説明 — Chiversi（チバーシ）')).toBeVisible();
    await page.getByRole('button', { name: '閉じる' }).click();
    await expect(page.getByText('ルール説明 — Chiversi（チバーシ）')).not.toBeVisible();
  });

  test('ルール説明にゲームの基本ルールが記載されている', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'ルール説明' }).click();
    await expect(page.getByText('基本ルール')).toBeVisible();
    await expect(page.getByText('挟み判定について')).toBeVisible();
    await expect(page.getByText('戦略のヒント')).toBeVisible();
  });

  test('リスタートでスコアが2-2にリセットされる', async ({ page }) => {
    await page.goto('/');
    // CPUが動く前（500ms以内）にリスタートを押す
    await page.getByRole('button', { name: 'リスタート' }).click();
    const scoreEl = page.locator('p', { hasText: 'スコア' });
    await expect(scoreEl).toContainText('黒 2');
    await expect(scoreEl).toContainText('白 2');
  });

  test('リスタート後に手番が黒に戻る', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'リスタート' }).click();
    await expect(page.getByText(/黒（あなた）/)).toBeVisible();
  });
});

test.describe('地図エリア', () => {
  test('地図コンテナが表示される', async ({ page }) => {
    await page.goto('/');
    // OpenLayersが描画するcanvas要素が存在する
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });
  });
});
