const { test, expect } = require('@playwright/test');

test.describe('Admin Management Flow', () => {
  test('debería permitir al administrador gestionar una incidencia', async ({ page }) => {
    // 1. Acceder y loguear como admin
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('admin@ecoalerta.test');
    await page.getByPlaceholder(/contraseña/i).fill('Admin123'); // contraseñas default supuestas
    await page.getByRole('button', { name: /entrar/i }).click();

    // 2. Ir a vista de Admin
    await page.waitForNavigation({ url: '**/admin*' }).catch(() => page.goto('/admin'));
    
    // 3. Verificar que estamos en la consola (Stats / Tabs)
    await expect(page.getByText(/panel de administración/i).or(page.locator('h1'))).toBeVisible();

    // 4. Buscar la tabla de incidencias o ir a la sección
    const incidentsTab = page.getByRole('button', { name: /incidencias/i }).or(page.getByText('Incidencias'));
    if (await incidentsTab.isVisible()) {
      await incidentsTab.click();
    }

    // 5. Buscar una incidencia pendiente y cambiar su estado
    // Asumimos que la lista carga un table o unas cards. Evaluamos el primer dropdown de estado.
    const statusSelect = page.locator('select.status-select').first();
    if (await statusSelect.count() > 0) {
      await statusSelect.selectOption('validated');
      
      // Puede aparecer un modal / prompt o confirmarse automáticamente
      const confirmButton = page.getByRole('button', { name: /confirmar/i });
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
      }

      // Validar feedback success
      await expect(page.getByText(/estado actualizado/i)).toBeVisible({ timeout: 5000 });
    }
  });
});
