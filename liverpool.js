const { chromium } = require("playwright");

(async() => {
    // Ejecutar sin interfaz
    const browser = await chromium.launch({ headless: false });

    // contexto: liverpool
    ////// const context = await browser.newContext();
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }, // Fuerza tamaño de computadora
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' // Hace creer a Liverpool que eres un humano
    });
    const page = await context.newPage();
    await page.goto("https://www.liverpool.com.mx/tienda/home");
    // seleccionar campo de búsqueda y enviar el texto: "playstation5" y enter
    await page.locator('.at-text-input:visible').first().fill('playstation5');
    await page.locator('.at-text-input:visible').first().press('Enter');
    await page.waitForURL(/s=playstation5/);

    // ordenar por precio: de menor a más alto
    await page.waitForTimeout(5000);

    const dropdown = page.locator('#sortby').filter({ visible: true });
    await dropdown.click();
    await page.waitForTimeout(5000);
    await page.getByRole('button', { name: 'Menor precio' }).click();

    const tarjetasProductos = page.locator('.m-product__card');
    await tarjetasProductos.first().waitFor({ state: 'visible' });
    const listaProductos = [];
    const totalProductos = await tarjetasProductos.count();

    // se tomarás las 3 primeras posiciones de la búsqueda ya que solo hay 3 posiciones

    const limite = Math.min(totalProductos, 3);
    for (let i = 0; i < limite; i++) {
        const producto = tarjetasProductos.nth(i);
        // Toma el nombre del producto
        const nombreRaw = await producto.locator('.card-title').innerText();
        // Tomar el precio del producto
        const precioRaw = await producto.locator('.a-card-discount').innerText();
        const nombre = nombreRaw;
        const precio = precioRaw;

        listaProductos.push({
            posicion: i + 1,
            nombre: nombre,
            precio: precio
        });

    }
    // Imprimir en cónsola las posiciones 1, 2 y 3 (el arreglo listaProductos)
    console.log(listaProductos);

    await browser.close(); // cerrar el navegado y el contexto
})();