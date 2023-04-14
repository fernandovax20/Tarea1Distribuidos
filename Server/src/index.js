const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const axios = require('axios');
const path = require('path');
const filePath = path.join(__dirname, '../characters.proto');
const Redis = require('ioredis');

const API_URL = 'https://stand-by-me.herokuapp.com/api/v1/characters';
const CACHE_TTL = 15; // 5 minutos en segundos

const redisClient1 = new Redis({ host: 'redis1', port: 6379, enableReadyCheck: false });
const redisClient2 = new Redis({ host: 'redis2', port: 6379, enableReadyCheck: false });
const redisClient3 = new Redis({ host: 'redis3', port: 6379, enableReadyCheck: false });


const getRedisClient = (id) => {
  if (id >= 1 && id <= 58) {
    return redisClient1;
  } else if (id >= 59 && id <= 116) {
    return redisClient2;
  } else {
    return redisClient3;
  }
};


const packageDefinition = protoLoader.loadSync(filePath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const charactersProto = grpc.loadPackageDefinition(packageDefinition).characters;
const server = new grpc.Server();

async function fetchCharacter(id) {
  try {
    const response = await axios.get(API_URL+'/'+id);
    const character = response.data;
    return {
      id: character.id,
      name: character.name,
      nationality: character.nationality,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

server.addService(charactersProto.CharacterService.service, {
  GetCharacterById: async function (call, callback) {
    const id = call.request.id;
  
    try {
      const redisClient = getRedisClient(id);
      let cachedCharacter = await redisClient.get(id);
  
      if (cachedCharacter) {
        cachedCharacter = JSON.parse(cachedCharacter);
        console.log('Character found in cache:', cachedCharacter);
        callback(null, cachedCharacter);
      } else {
        const character = await fetchCharacter(id);
  
        if (character) {
          console.log('Character found in API:', character);
          await redisClient.set(id, JSON.stringify(character), 'EX', CACHE_TTL);
          callback(null, character);
        } else {
          console.log('Character not found');
          callback({
            code: grpc.status.NOT_FOUND,
            details: 'Character not found',
          });
        }
      }
    } catch (error) {
      console.error('Error in GetCharacterById:', error);
      callback({
        code: grpc.status.INTERNAL,
        details: 'Internal server error',
      });
    }
  },
  
});




const PORT = process.env.PORT || 50051;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log(`Server running at http://localhost:${port}`);
  server.start();
});
