const apiRequest = require('./TestingApi');
const fuerzaBruta = require('./TestingApiBruto');
const getCharacterById = require('./cacheQuery');
const readline = require('readline');



function menu() {
    console.log('');
    console.log("=============================================");
    console.log('Bienvenido al programa de pruebas de rendimiento de la API');
    console.log('Seleccione una opción:');
    console.log('1. Realizar pruebas de rendimiento');
    console.log('2. Reedición de pruebas de rendimiento con fuerza bruta');
    console.log('3. Buscar personaje por ID');
    console.log('4. Salir');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Seleccione una opción: ', (answer) => {
        switch (answer) {
            case '1':
                apiRequest();
                rl.close();
                setTimeout(() => {
                    menu();
                }, 500); // Esperar medio segundo antes de volver a mostrar el menú
                break;
            case '2':
                fuerzaBruta();
                rl.close();
                setTimeout(() => {
                    menu();
                }, 500); // Esperar medio segundo antes de volver a mostrar el menú
                break;
            case '3':
                rl.question('Ingrese el ID del personaje: ', (id) => {
                    getCharacterById(parseInt(id));
                    rl.close();
                    setTimeout(() => {
                        menu();
                    }, 2000); // Esperar medio segundo antes de volver a mostrar el menú
                });
                break;
            case '4':
                console.log('Saliendo...');
                rl.close();
                break;
            default:
                console.log('Opción no válida');
                rl.close();
                setTimeout(() => {
                    menu();
                }, 500); // Esperar medio segundo antes de volver a mostrar el menú
        }
    });
}

menu(); // Iniciamos el menú
