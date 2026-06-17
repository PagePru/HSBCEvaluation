
Este proyecto contiene dos pruebas automatizadas utilizando "Playwright y node.js".

El primer archivo (e2emixto.js) se conecta a la página de leverpool  y genera su resultado: 
	1.Navega hasta Liverpool.
	2.Busca "playstation 5".
	4.Ordena por precio: de menor a más alto.
	5.Extrae el nombre y el precio de los primeros TRES resultados.
	6.Imprime los resultados en la consola.
        NOTA: El paso 3. Que era filtrado por color se omitió ya que no se logró ese oobjetivo.

El segundo archivo (datosmixto.JS) contiene pruebas de automatización de la Capa de Intercepción de Servicios y Validación de Datos en la plataforma de Liverpool.

Un reto importante es que la página de liverpool bloquea su respuesta al detectar que se está realizando una prueba automatizada, lo que dificultó la actividad

* Cómo instalar y ejecutar localmente
	a) Automatización de Pruebas E2E - Liverpool
	b) Instalación y Ejecución Local

	Sigue estos pasos para configurar el entorno en tu máquina local desde cero:

	c) Prerrequisitos
	* Tener instalado [Node.js](https://nodejs.org/) (Versión recomendada: v18 o superior).

	c-1: Clonar o descargar el proyecto
	Si usas Git, clona el repositorio. De lo contrario, descarga los archivos en una carpeta local.

	c-2: Instalar dependencias
	Abre la terminal dentro de la carpeta raíz del proyecto y ejecuta el siguiente comando para instalar Playwright y sus componentes necesarios:

	npm install
	Nota: Si estás creando el proyecto desde cero, el comando manual es npm install playwright.


* Cómo correr en modo cabeza frente a sin cabeza
	Parte 1: Automatización de la interfaz de usuario E2E (archivo: e2epmixto)
	NUEVAS REGLAS DE LA EJECUCIÓN:

		a) Para ejecutar el script Sin interfaz, ejecute uno de los siguietes comandos:
	   	   node e2emixto.js (Modo rápido por defecto).
	   	   ó
	   	   set HEADED=false&&node e2emixto.js  (Sin interfaz Forzado).

		b) Para ejecutar el scrip Con interfaz, ejecute el siguiente comando
	   	   set HEADED=true&&node e2emixto.js


	Parte 2: Capa de Intercepción de Servicios y Validación de Datos (archivo: datosmixto.js)

	 	a) Para ejecutar SIN interfaz, ejecute uno de los siguietes comandos:
		   node datosmixto.js  (Modo rápido por defecto).
		   ó
		   set HEADED=false&&node datosmixto.js   (Sin interfaz Forzado).


		b) Ejecutar CON interfaz visual (Headed - Para auditar visualmente):
		   set HEADED=true&&node datosmixto.js






