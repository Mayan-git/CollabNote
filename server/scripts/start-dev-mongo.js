/**
 * Starts a real local MongoDB instance (via mongodb-memory-server's downloaded
 * binary) for local development, on a fixed port so server/.env can point at it.
 * Not used in production — Atlas or a real `mongod` should be used there.
 */
const { MongoMemoryServer } = require('mongodb-memory-server');

async function main() {
  const mongod = await MongoMemoryServer.create({
    instance: { port: 27018, dbName: 'collabnote' },
  });
  const uri = mongod.getUri('collabnote');
  console.log('MONGO_READY', uri);

  const shutdown = async () => {
    await mongod.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start dev MongoDB:', err);
  process.exit(1);
});
