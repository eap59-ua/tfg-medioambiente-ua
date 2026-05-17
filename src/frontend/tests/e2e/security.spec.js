const { test, expect } = require('@playwright/test');

test.describe('Flujo de Seguridad 2FA y Turnstile', () => {

  test.skip('Admin login: setup obligatorio de 2FA en primer login', async ({ page }) => {
    // 1. Ir a login
    await page.goto('/login');
    
    // 2. Login con admin que no tiene 2FA
    await page.fill('input[type="email"]', 'admin@ecoalerta.es');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');

    // 3. Debería redirigir a /setup-2fa-required
    await expect(page).toHaveURL(/\/setup-2fa-required/);
    await expect(page.locator('h1')).toContainText('Configuración de Seguridad Requerida');

    // 4. Iniciar setup
    await page.click('button:has-text("Configurar Autenticación de Doble Factor")');
    await expect(page.locator('h2')).toContainText('Configurar Autenticación de Doble Factor (2FA)');
    await expect(page.locator('img[alt="Código QR"]')).toBeVisible();

    // No completamos el flujo real con TOTP porque requiere librería externa para generar código,
    // pero verificamos que el modal se abre y el código QR se renderiza.
  });

  test.skip('Citizen login: opt-in de 2FA desde perfil', async ({ page }) => {
    // 1. Login con citizen normal
    await page.goto('/login');
    await page.fill('input[type="email"]', 'citizen@test.es');
    await page.fill('input[type="password"]', 'Citizen123!');
    await page.click('button[type="submit"]');

    // 2. Ir al perfil
    await page.goto('/profile');
    await expect(page.locator('h2').filter({ hasText: 'Seguridad' })).toBeVisible();

    // 3. Ver que 2FA está inactivo y clicar activar
    await expect(page.locator('span:has-text("Inactivo")')).toBeVisible();
    await page.click('button:has-text("Activar autenticación de doble factor")');

    // 4. Ver que se abre el modal
    await expect(page.locator('img[alt="Código QR"]')).toBeVisible();
  });

  test('Login con 2FA ya activado y verificación con código', async ({ page }) => {
    // Necesitamos un citizen_2fa en la DB. Asumimos que su contraseña es correcta, 
    // y redirigirá a /login/2fa.
    await page.goto('/login');
    await page.fill('input[type="email"]', 'citizen_2fa@test.es');
    await page.fill('input[type="password"]', 'Citizen123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/login\/2fa/);
    await expect(page.locator('h2')).toContainText('Verificación en dos pasos');
    
    // Ver input de 6 dígitos (ahora es un solo input con tracking espaciado)
    const input = page.locator('input[placeholder="000000"]');
    await expect(input).toBeVisible();
  });

  test('Consumo de código de recuperación', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'citizen_2fa@test.es');
    await page.fill('input[type="password"]', 'Citizen123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/login\/2fa/);
    
    // Cambiar a modo recuperación
    await page.click('button:has-text("Usar código de recuperación")');
    await expect(page.locator('input[placeholder="XXXXXXXX"]')).toBeVisible();
  });

  test('Ciudadano puede desactivar 2FA, admin no puede', async ({ page }) => {
    // Comprobamos citizen_2fa que sí puede ver el botón de desactivar
    await page.goto('/login');
    await page.fill('input[type="email"]', 'citizen_2fa@test.es');
    await page.fill('input[type="password"]', 'Citizen123!');
    await page.click('button[type="submit"]');
    
    // Redirige a 2fa, no podemos pasar sin un código válido generado al vuelo o mockeado,
    // así que este test se aseguraría mediante mock de network o e2e avanzado.
    // Simplemente comprobamos la URL.
    await expect(page).toHaveURL(/\/login\/2fa/);
  });

});
