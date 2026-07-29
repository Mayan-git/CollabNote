import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

export async function setup(): Promise<void> {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri('collabnote-test');
  process.env.NODE_ENV = 'test';
}

export async function teardown(): Promise<void> {
  await mongod?.stop();
}
