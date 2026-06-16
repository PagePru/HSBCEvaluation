const { chromium } = require("playwright");

(async() => {
    // 1. Lanzar el navegador
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    let productosAPI = [];

    // 2. CONFIGURAR INTERCEPCIÓN (Captura el JSON de la API)
    page.on('response', async(response) => {
        const url = response.url();
        if (url.includes('/plp') && response.status() === 200) {
            try {
                const json = await response.json();
                if (json && json.plpResults && json.plpResults.records) {
                    productosAPI = json.plpResults.records;
                }
            } catch (e) {
                // Silenciar errores de JSON
            }
        }
    });

    try {
        // 3. FLUJO EN LA INTERFAZ (UI) - NAVEGACIÓN DIRECTA A LA BÚSQUEDA
        console.log(" Navegando directo a los resultados de búsqueda...");
        await page.goto("https://www.liverpool.com.mx/tienda?s=playstation5", { waitUntil: 'domcontentloaded', timeout: 40000 });

        // Ordenar por precio: de menor a más alto
        console.log(" Esperando a que cargue el menú de ordenamiento...");
        const dropdown = page.locator('#sortby').filter({ visible: true });

        await dropdown.waitFor({ state: 'visible', timeout: 35000 });
        await dropdown.click();

        const opcionMenorPrecio = page.getByRole('button', { name: 'Menor precio' });
        await opcionMenorPrecio.waitFor({ state: 'visible', timeout: 10000 });
        await opcionMenorPrecio.click();

        //  CORRECCIÓN AQUÍ: Quitamos 'networkidle' y esperamos visualmente a que las tarjetas reaccionen
        console.log(" Esperando renderizado de las tarjetas de productos...");
        const tarjetasProductos = page.locator('.m-product__card');

        // Esperamos a que la primera tarjeta esté visible tras el clic del ordenamiento
        await tarjetasProductos.first().waitFor({ state: 'visible', timeout: 20000 });

        // Pausa breve de 3 segundos para garantizar que el DOM terminó de reordenar los textos e interceptar la red
        await page.waitForTimeout(3000);

        // 4. EXTRAER PRODUCTOS DE LA INTERFAZ (UI)
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

        console.log("\n📺 Productos en la Interfaz (UI):", listaProductosUI);
        console.log(` Productos en la Red (API): ${productosAPI.length} encontrados.`);

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
        console.log("\n================ REPORTES Y AFIRMACIONES ================");
        if (coincidenciasExactas >= 3) {
            console.log(` ASERCIÓN PASADA: Al menos 3 productos coinciden (${coincidenciasExactas}/5 encontrados).`);
        } else {
            console.error(` ASERCIÓN FALLIDA: Solo coincidieron ${coincidenciasExactas} de los 5 productos.`);
        }

        if (discrepancias.length > 0) {
            console.log("\n DISCREPANCIAS ENCONTRADAS:");
            console.table(discrepancias);
        } else {
            console.log("\n ¡Perfecto! Los datos de la UI coinciden al 100% con la API.");
        }

    } catch (error) {
        console.error(" Ocurrió un error durante la ejecución del flujo:", error.message);
    } finally {
        // Cerrar navegador de forma segura
        await browser.close();
    }
})();