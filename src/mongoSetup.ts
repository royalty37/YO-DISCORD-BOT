import { MongoClient, ServerApiVersion } from "mongodb";

export let mongoClient: MongoClient;

export const initMongo = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("*** ERROR: MONGO_URI environment variable not set in env.");
      process.exit(1);
    }

    mongoClient = new MongoClient(process.env.MONGODB_URI, {
      serverApi: ServerApiVersion.v1,
      appName: "YOZA-BOT",
    });

    await mongoClient.connect();

    mongoClient.db("YOZA-BOT").command({ ping: 1 });

    console.log("*** Successfully connected to MongoDB.");
  } catch (e) {
    console.error("*** ERROR: Failed to connect to MongoDB: ", e);
    process.exit(1);
  }
};
