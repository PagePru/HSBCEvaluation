const { chromium } = require("playwright");

(async() => {
    // 1. LEER LA VARIABLE DE LA CONSOLA (Limpiando espacios invisibles de Windows)
    const variableConsola = process.env.HEADED ? process.env.HEADED.trim() : 'false';
    const esHeaded = variableConsola === 'true';

    console.log(`\n🤖 Iniciando navegador en modo: ${esHeaded ? 'CON INTERFAZ (Headed)' : 'SIN INTERFAZ (Headless)'}`);

    // 2. CONFIGURACIÓN DEL LANZAMIENTO (El truco definitivo anti-bloqueos)
    const argsConfig = [
        '--disable-blink-features=AutomationControlled',
        '--window-size=1920,1080',
        '--mute-audio'
    ];

    // Si el usuario quiere modo oculto (false), le inyectamos el truco en los argumentos del motor
    if (!esHeaded) {
        argsConfig.push('--headless=new');
    }

    const browser = await chromium.launch({
        headless: false, // <-- CLAVE: Siempre en false para heredar las firmas de un navegador real y evitar bloqueos
        args: argsConfig
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        locale: 'es-MX',
        timezoneId: 'America/Mexico_City',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    // 3. NAVEGACIÓN DIRECTA
    console.log(" Navegando directo a los resultados ordenados por MENOR PRECIO...");
    await page.goto("https://www.liverpool.com.mx/tienda?s=playstation5&sortPrice|0", {
        waitUntil: 'domcontentloaded',
        timeout: 60000
    });

    console.log(" Esperando que el DOM se estabilice...");
    await page.waitForTimeout(5000);

    // 4. EXTRACCIÓN DE LOS TOP 3 PRODUCTOS
    console.log(" Extrayendo información de las tarjetas de productos...");
    const tarjetasProductos = page.locator('.m-product__card');

    // Usamos state: 'attached' para que solo busque que existan en el código HTML
    await tarjetasProductos.first().waitFor({ state: 'attached', timeout: 25000 });

    const listaProductos = [];
    const totalProductos = await tarjetasProductos.count();

    const limite = Math.min(totalProductos, 3);
    for (let i = 0; i < limite; i++) {
        const producto = tarjetasProductos.nth(i);

        const nombreRaw = await producto.locator('.card-title').innerText();

        let precioRaw = "No disponible";
        const descLocator = producto.locator('.a-card-discount');
        const priceLocator = producto.locator('.a-card-price');

        if (await descLocator.count() > 0) {
            precioRaw = await descLocator.innerText();
        } else if (await priceLocator.count() > 0) {
            precioRaw = await priceLocator.innerText();
        }

        listaProductos.push({
            posicion: i + 1,
            nombre: nombreRaw.trim(),
            precio: precioRaw.trim()
        });
    }

    // 5. IMPRESIÓN DE RESULTADOS
    console.log("\n Resultados obtenidos (Top 3 Menor Precio vía URL):");
    console.log(listaProductos);

    if (esHeaded) await page.waitForTimeout(3000);

    await browser.close();
})();