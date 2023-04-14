const apiRequest = require('./TestingApi');
const fuerzaBruta = require('./TestingApiBruto');
const runGrpcRequests = require('./cacheQuery');
const readline = require('readline');



function menu() {
    console.log('');
    console.log("=============================================");
    console.log('Bienvenido al programa de pruebas de rendimiento de la API');
    console.log('Seleccione una opción:');
    console.log('1. Realizar pruebas de rendimiento');
    console.log('2. Reedición de pruebas de rendimiento con fuerza bruta');
    console.log('3. Buscar personaje por ID sin repeticion con reinicio');
    console.log('4. Buscar personaje por ID completamente aleatorio');
    console.log('5. Buscar personaje por ID aleatoreio pero con ids populares');
    console.log('6. Salir');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Seleccione una opción: ', (answer) => {
        switch (answer) {
            case '1':
                apiRequest();
                rl.close();
                break;
            case '2':
                fuerzaBruta();
                rl.close();
                break;
            case '3':
                runGrpcRequests(1);
                rl.close();
                break;
            case '4':
                runGrpcRequests(2);
                rl.close();
                break;
            case '5':
                runGrpcRequests(3);
                rl.close();
                break;
            case '6':
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
