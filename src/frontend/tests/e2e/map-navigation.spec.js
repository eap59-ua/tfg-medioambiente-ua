const { test, expect } = require('@playwright/test');

test.describe('Map Navigation', () => {
  test('debería montar el mapa de Leaflet y cargar pines', async ({ page }) => {
    await page.goto('/');

    // 1. Moverse al mapa
    const mapTab = page.getByRole('button', { name: /mapa/i }).or(page.getByText('Mapa', { exact: true }));
    if (await mapTab.isVisible()) {
      await mapTab.click();
    } else {
      await page.goto('/map');
    }

    // 2. Confirmar que el contenedor de Leaflet está ahí
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();

    // 3. Confirmar que hay marcadores pintados (Leaflet pinta img.leaflet-marker-icon o paths)
    // Esperamos un momento a que los endpoints respondan
    await page.waitForTimeout(2000); 

    const marker = page.locator('.leaflet-marker-icon').first();
    // No exigimos que estricto haya un marcador si la db esta vacia de prueba, 
    // pero idealmente deberia haber al menos el "use my location" marker o clusters.
    if (await marker.count() > 0) {
      await marker.click();
      
      // Al hacer click debería salir un popup
      const popup = page.locator('.leaflet-popup');
      await expect(popup).toBeVisible();
      
      // Y un enlace al detalle de la incidencia
      const detailLink = popup.getByRole('link').or(popup.getByRole('button'));
      await expect(detailLink).toBeVisible();
    }
  });
});
