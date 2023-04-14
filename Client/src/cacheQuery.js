const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const plot = require('nodeplotlib');

const protoPath = path.join(__dirname, '..', 'characters.proto');

const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const charactersProto = grpc.loadPackageDefinition(packageDefinition).characters;
const client = new charactersProto.CharacterService('localhost:50051', grpc.credentials.createInsecure());

const maxRequests = 1000;
const requestInterval = 300; // 300 milisegundos
let requestCount = 0;
let results = [];
let throughputResults = [];



function getCharacterById(id) {
  const startTime = process.hrtime.bigint();

  client.GetCharacterById({ id }, (error, character) => {
    if (error) {
      console.error(error);
      return;
    }

    const endTime = process.hrtime.bigint();
    const elapsedTime = (endTime - startTime) / BigInt(1000000); // Convertir a milisegundos
    results.push(Number(elapsedTime));

    const size = JSON.stringify(character).length;
    const throughput = size / (Number(elapsedTime) / 1000);
    throughputResults.push(throughput.toFixed(2));

    // console.log('Character:', character);
    console.log(`Solicitud ${requestCount + 1}: Solicitud completada en ${elapsedTime} ms con un Trougtput de: ${throughput.toFixed(2)}, El Personaje es: ${character.name}\n`);

    requestCount++;


  });
}

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


function runGrpcRequests(id) {
  if (id == 1) {                          //Este es el que dara un random sin repeticion y con reinicio
    const interval = setInterval(() => {  
      if (requestCount < maxRequests) {
        const randomIdGenerator = createRandomIdGenerator(); // Define el 
        const randomId = randomIdGenerator.getRandomId();
        getCharacterById(randomId);
      } else {
        clearInterval(interval);
        plotResults();
      }
    }, requestInterval);
  } else if (id == 2) {                   //Este es el que dara un random sin peso
    const interval = setInterval(() => {
      if (requestCount < maxRequests) {
        const randomId = getRandomId();
        getCharacterById(randomId);
      } else {
        clearInterval(interval);
        plotResults();
      }
    }, requestInterval);

  }else{                                  //Este es el que dara un random con peso
    const interval = setInterval(() => {
      if (requestCount < maxRequests) {
        const randomId = getRandomWeightedId()
        getCharacterById(randomId);
      } else {
        clearInterval(interval);
        plotResults();
      }
    }, requestInterval);
  }


}

//Random Functions--------------------------------------------------------------

//Random sin repeticion y con reinicio------------------------------------------
function createRandomIdGenerator() {
  const min=1;
  const max=175;
  const availableIds = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  function reset() {
    for (let i = min; i <= max; i++) {
      availableIds[i - min] = i;
    }
  }

  function getRandomId() {
    if (availableIds.length === 0) {
      reset();
    }

    const randomIndex = Math.floor(Math.random() * availableIds.length);
    const randomId = availableIds[randomIndex];
    availableIds.splice(randomIndex, 1);

    return randomId;
  }

  return { getRandomId };
}

//Random con peso--------------------------------------------------------------
function getRandomWeightedId() {
  const popularIds = [1, 2, 10, 11, 48, 75, 123, 150];// Ides populares
  const totalRange = 175;
  const popularWeight = 0.7; // Ajusta este valor para aumentar o disminuir la probabilidad de seleccionar un ID popular.

  // Comprobar si se selecciona un ID popular
  if (Math.random() < popularWeight) {
    // Si se selecciona un ID popular, devolver uno aleatorio de la lista de IDs populares
    const index = Math.floor(Math.random() * popularIds.length);
    return popularIds[index];
  } else {
    // Si no se selecciona un ID popular, devolver un ID aleatorio entre 1 y 175 que no sea popular
    let nonPopularId;
    do {
      nonPopularId = Math.floor(Math.random() * totalRange) + 1;
    } while (popularIds.includes(nonPopularId));
    return nonPopularId;
  }
}

function getRandomId() {
  const min = 1;
  const max = 175;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


module.exports = runGrpcRequests;

 