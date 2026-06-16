
Este proyecto contiene dos pruebas automatizadas utilizando "Playwright y node.js".

El primer archivo (liverool.js) se conecta a la página de leverpool  y genera su resultado: 
	1.Navega hasta Liverpool.
	2.Busca "playstation 5".
	4.Ordena por precio: de menor a más alto.
	5.Extrae el nombre y el precio de los primeros TRES resultados.
	6.Imprime los resultados en la consola.
        NOTA: El paso 3. Que era filtrado por color se omitió ya que no se logró ese oobjetivo.


El segundo archivo (le2e.js.JS) contiene pruebas de automatización de la Capa de Intercepción de Servicios y Validación de Datos en la plataforma de Liverpool.

Un reto importante es que la página de liverpool bloquea su respuesta al detectar que se está realizando una prueba automatizada, lo que dificultó la actividad


- Cómo instalar y ejecutar localmente
1 Automatización de Pruebas E2E - Liverpool
2 Instalación y Ejecución Local

Sigue estos pasos para configurar el entorno en tu máquina local desde cero:

3 Prerrequisitos
* Tener instalado [Node.js](https://nodejs.org/) (Versión recomendada: v18 o superior).

	3-1: Clonar o descargar el proyecto
Si usas Git, clona el repositorio. De lo contrario, descarga los archivos en una carpeta local.

	3-2: Instalar dependencias
Abre la terminal dentro de la carpeta raíz del proyecto y ejecuta el siguiente comando para instalar Playwright y sus componentes necesarios:

npm install
Nota: Si estás creando el proyecto desde cero, el comando manual es npm install playwright.


3: Ejecutar la prueba1
Para iniciar la ejecución del primer programa, utiliza el comando:
node liverpool.js

NOTA: Por defecto, el script está configurado para mostrar el navegador en la pantalla mientras realiza las acciones (Modo con Interfaz (Headed / Cabeza)). y como resultado se podrá observar el resultado en ejecución.

El Modo sin Interfaz (Headless / Sin Cabeza) generó problemas de bloqueo de la página de leverpool y no se pudo culminar

Ejecutar la prueba2
Para iniciar la ejecución del primer programa, utiliza el comando:
node le2e.js
Al ejecutarlo se podrá visulizar la respuesta interceptada de red que contiene los datos de los resultados de búsqueda en la cónsola.

NOTA: El script solo está configurado para mostrar el navegador en la pantalla mientras realiza las acciones. El Modo sin Interfaz (Headless / Sin Cabeza) generó bloqueos de la página de leverpool y no se pudo culminar ya que no ejecutaba y el modo con gráficos si avanzó.






