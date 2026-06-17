const { chromium } = require("playwright");

(async() => {
    // PASO CLAVE: Leemos la variable de la consola y limpiamos espacios de Windows
    const variableConsola = process.env.HEADED ? process.env.HEADED.trim() : 'false';
    const esHeaded = variableConsola === 'true';

    console.log(`\n Iniciando Validación Cruzada en modo: ${esHeaded ? 'CON INTERFAZ (Headed)' : 'SIN INTERFAZ (Headless)'}`);

    // 1. CONFIGURACIÓN DEL LANZAMIENTO (El truco definitivo anti-bloqueos)
    const argsConfig = [
        '--disable-blink-features=AutomationControlled',
        '--window-size=1920,1080',
        '--mute-audio'
    ];

    // Si el usuario quiere modo oculto (false), le inyectamos el motor headless en segundo plano
    if (!esHeaded) {
        argsConfig.push('--headless=new');
    }

    const browser = await chromium.launch({
        headless: false, // Siempre false para conservar las firmas reales de hardware y evitar el baneo
        args: argsConfig
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        locale: 'es-MX',
        timezoneId: 'America/Mexico_City',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    // Ofuscar la bandera de automatización
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    let productosAPI = [];

    // 2. CONFIGURAR INTERCEPCIÓN (Escucha la red en segundo plano desde el inicio)
    page.on('response', async(response) => {
        const url = response.url();
        if (url.includes('/plp') && response.status() === 200) {
            try {
                const json = await response.json();
                if (json && json.plpResults && json.plpResults.records) {
                    productosAPI = json.plpResults.records;
                    console.log(`  [Red] API Interceptada con éxito. Registros capturados: ${productosAPI.length}`);
                }
            } catch (e) {
                // Silenciar errores de lectura de JSON basura
            }
        }
    });

    try {
        // 3. NAVEGACIÓN DIRECTA CON ORDENAMIENTO (Bypass de clics para evitar errores de visibilidad)
        console.log(" Navegando directo a los resultados ordenados por MENOR PRECIO...");
        await page.goto("https://www.liverpool.com.mx/tienda?s=playstation5&sortPrice|0", {
            waitUntil: 'domcontentloaded',
            timeout: 50000
        });

        // Pausa de control para asegurar que la API responda y el DOM absorba los datos
        console.log(" Esperando que la red y el DOM se estabilicen...");
        await page.waitForTimeout(6000);

        // 4. EXTRAER PRODUCTOS DE LA INTERFAZ (UI)
        console.log(" Extrayendo información de las tarjetas de productos...");
        const tarjetasProductos = page.locator('.m-product__card');

        // CORRECCIÓN: Esperamos a que existan en el DOM ('attached'), eliminando los bloqueos de 'visible'
        await tarjetasProductos.first().waitFor({ state: 'attached', timeout: 25000 });

        const totalProductos = await tarjetasProductos.count();
        const listaProductosUI = [];

        const limite = Math.min(totalProductos, 5);
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

            listaProductosUI.push({
                posicion: i + 1,
                nombre: nombreRaw.trim(),
                precio: precioRaw.trim()
            });
        }

        console.log("\n Productos leídos de la Pantalla (UI):", listaProductosUI);
        console.log(`  Productos interceptados en la Red (API): ${productosAPI.length} encontrados.`);

        // 5. CAPA DE VALIDACIÓN CRUZADA
        let coincidenciasExactas = 0;
        const discrepancias = [];

        listaProductosUI.forEach((prodUI) => {
            const encontradoEnAPI = productosAPI.find(prodAPI => {
                if (prodAPI && prodAPI.productDisplayName && prodAPI.productDisplayName[0]) {
                    const nombreAPI = prodAPI.productDisplayName[0];
                    return nombreAPI.toLowerCase().trim() === prodUI.nombre.toLowerCase();
                }
                return false;
            });

            if (encontradoEnAPI) {
                coincidenciasExactas++;

                const precioAPI = parseFloat(encontradoEnAPI.skuMinimumPrice || encontradoEnAPI.minimumPromoPrice || 0);
                const precioUI = parseFloat(prodUI.precio.replace(/[^0-9.]/g, ''));

                if (precioAPI > 0 && precioUI !== precioAPI) {
                    discrepancias.push({
                        producto: prodUI.nombre,
                        error: "Discrepancia de PRECIO",
                        precioUI: prodUI.precio,
                        precioAPI: `$${precioAPI}`
                    });
                }
            } else {
                discrepancias.push({
                    producto: prodUI.nombre,
                    error: "El producto de la UI no se encontró en el JSON de la API"
                });
            }
        });

        // 6. IMPRIMIR REPORTES Y ASERCIONES
        console.log("\n================ REPORTES Y ASERCIONES ================");
        if (coincidenciasExactas >= 3) {
            console.log(`  ASERCIÓN PASADA: Al menos 3 productos coinciden perfectamente (${coincidenciasExactas}/5 verificados).`);
        } else {
            console.error(`  ASERCIÓN FALLIDA: Solo coincidieron ${coincidenciasExactas} de los 5 productos.`);
        }

        if (discrepancias.length > 0) {
            console.log("\n  DISCREPANCIAS ENCONTRADAS EN LA COMPARACIÓN:");
            console.table(discrepancias);
        } else {
            console.log("\n  ¡Perfecto! Los datos de la interfaz (UI) coinciden al 100% con los datos crudos del servidor (API).");
        }

    } catch (error) {
        console.error("  Ocurrió un error inesperado durante el flujo:", error.message);
    } finally {
        if (esHeaded) await page.waitForTimeout(3000);
        // Cerrar navegador de forma segura
        await browser.close();
    }
})();