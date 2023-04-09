const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

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

function getCharacterById(id) {
  const startTime = process.hrtime.bigint();

  client.GetCharacterById({ id }, (error, character) => {
    if (error) {
      console.error(error);
      return;
    }

    const endTime = process.hrtime.bigint();
    const elapsedTime = (endTime - startTime) / BigInt(1000000); // Convertir a milisegundos

    console.log('Character:', character);
    console.log(`Solicitud completada en ${elapsedTime} ms`);
  });
}

module.exports = getCharacterById;
