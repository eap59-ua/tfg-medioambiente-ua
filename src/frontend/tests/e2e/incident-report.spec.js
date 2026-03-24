const { test, expect } = require('@playwright/test');

test.describe('Reporte de Incidencia', () => {
  // Configuración inicial o mock de la geolocalización
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 38.267, longitude: -0.695 }); // Alicante
  });

  test('debería permitir a un usuario ciudadano logueado reportar una incidencia', async ({ page }) => {
    // 1. Navegar a home y asegurarse de que levanta la PWA
    await page.goto('/');
    
    // 2. Click en reportar incidencia (asumiendo que hay un botón de reporte rápida en bottom nav o header)
    const reportButton = page.getByRole('button', { name: /reportar/i }).or(page.getByText('Reportar', { exact: false }));
    if (await reportButton.isVisible()) {
      await reportButton.click();
    } else {
      await page.goto('/report'); // Ir directo si no encuentra el botón en la vista inicial mockeada
    }

    // 3. El sistema debe pedir login o permitir anónimo
    // Asumamos que pide login usando el formulario en /login
    if (page.url().includes('login')) {
      await page.getByPlaceholder(/email/i).fill('citizen@ecoalerta.test');
      await page.getByPlaceholder(/contraseña/i).fill('Password123');
      await page.getByRole('button', { name: /entrar|iniciar/i }).click();
      
      // Esperar a redirigir al listado o al map o a /report
      await page.waitForURL('**/report*');
    }

    // 4. Rellenar formulario de reporte
    await page.getByPlaceholder(/título/i).fill('Vertedero Ilegal de Escombros Test');
    await page.getByPlaceholder(/descripción/i).fill('Se han encontrado varios sacos de escombros de obra abandonados en la cuneta.');
    
    // Select dropdown for Category 
    const categorySelect = page.locator('select[name="category"], select[name="categoryId"]');
    if (await categorySelect.count() > 0) {
      await categorySelect.selectOption({ index: 1 }); // Selecciona la segunda (asumiendo que la 1 existe tras fetch)
    }

    // Radios/Select for Severity
    const severityHigh = page.locator('input[type="radio"][value="high"]');
    if (await severityHigh.count() > 0) {
      await severityHigh.click();
    } else {
      const severitySelect = page.locator('select[name="severity"]');
      if (await severitySelect.count() > 0) {
        await severitySelect.selectOption('high');
      }
    }

    // 5. Botón usar ubicación actual
    const locationBtn = page.getByRole('button', { name: /ubicación actual/i }).or(page.getByText('Usar mi ubicación'));
    if (await locationBtn.count() > 0) {
      await locationBtn.click();
    }

    // 6. Subir archivo falso si hay input
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      // Create a dummy buffer to mock a file upload
      const uploadBuffer = Buffer.from('dummy image data');
      await fileInput.setInputFiles({
        name: 'test-image.jpg',
        mimeType: 'image/jpeg',
        buffer: uploadBuffer
      });
    }

    // 7. Enviar
    const submitBtn = page.getByRole('button', { name: /enviar incidencia/i }).or(page.locator('button[type="submit"]'));
    await submitBtn.click();

    // 8. Evaluar resultado: se espera mensaje de éxito o redirección al detalle
    await expect(page.getByText(/incidencia reportada con éxito/i).or(page.locator('.toastify, .Toast, .success-msg'))).toBeVisible({ timeout: 10000 });
  });
});
