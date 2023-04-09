const axios = require('axios');
const plot = require('nodeplotlib');

const numRequests = 500;
const results = [];

function fuerzaBruta() {

  for (let i = 0; i < numRequests; i++) {
    const start = Date.now();

    axios
      .get('https://stand-by-me.herokuapp.com/api/v1/characters')
      .then((res) => {
        const elapsed = Date.now() - start;
        console.log(`Solicitud ${i + 1}: ${elapsed} ms`);
        results.push(elapsed);
        if (results.length === numRequests) {
          plotResults();
        }
      })
      .catch((error) => {
        console.error(`Error en la solicitud ${i + 1}: ${error.message}`);
        results.push(null);
        if (results.length === numRequests) {
          plotResults();
        }
      });
  }

  function plotResults() {
    const data = [{ y: results, type: 'scatter', mode: 'lines' }];
    const layout = { title: 'Tiempo de respuesta por solicitud', xaxis: { title: 'Solicitud' }, yaxis: { title: 'Tiempo (ms)' } };
    plot.plot(data, layout);
  }
}

module.exports = fuerzaBruta;