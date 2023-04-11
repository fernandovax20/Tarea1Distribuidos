const axios = require('axios');
const plot = require('nodeplotlib');

const maxRequests = 200;
const requestInterval = 300; // 300 milisegundos
let requestCount = 0;
let results = [];
let throughputResults = [];

function getRandomId(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function apiRequest() {
    // Función para realizar una solicitud a la API
    function makeRequest() {
        const start = Date.now();
        let size = 0; // Variable para llevar registro del tamaño de los datos transferidos
        const randomId = getRandomId(1, 175);
        axios
            .get(`https://stand-by-me.herokuapp.com/api/v1/characters/${randomId}`, { responseType: 'stream' })
            .then((res) => {
                res.data.on('data', (chunk) => {
                    size += chunk.length;
                });
                res.data.on('end', () => {
                    const elapsed = Date.now() - start;
                    results.push(elapsed);
                    const throughput = size / (elapsed / 1000);
                    throughputResults.push(throughput.toFixed(2));
                    console.log(`Solicitud ${requestCount + 1}: ${elapsed} ms y con Throughput de: ${throughput.toFixed(2)} bytes/s`);
                    requestCount++;
                });
            })
            .catch((error) => {
                console.error(`Error en la solicitud ${requestCount + 1}: ${error.message}`);
                results.push(null);
                throughputResults.push(null);
                requestCount++;
            });
    }

    // Función para graficar los resultados del tiempo de respuesta
    function plotResults() {
        const data = [
            { y: results, type: 'scatter', mode: 'lines', name: 'Tiempo de respuesta' }, 
            { y: throughputResults, type: 'scatter', mode: 'lines', yaxis: 'y2', name: 'Throughput' }
        ];

        const layout = {
            title: 'Tiempo de respuesta y throughput por solicitud',
            xaxis: { title: 'Solicitud' },
            yaxis: { title: 'Tiempo (ms)' },
            yaxis2: { title: 'Throughput (bytes/s)', overlaying: 'y', side: 'right' },
        };

        plot.plot(data, layout);
    }


    // Programamos una tarea periódica que llame a la API cada cierto tiempo
    const interval = setInterval(() => {
        if (requestCount < maxRequests) {
            makeRequest();
        } else {
            clearInterval(interval);
            plotResults();
        }
    }, requestInterval);
}

module.exports = apiRequest;
