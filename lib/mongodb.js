import { MongoClient, ServerApiVersion } from 'mongodb';

if (!process.env.MONGO_DB_USER || !process.env.MONGO_DB_PASS || !process.env.MONGO_DB_REST_URL) {
    throw new Error('Invalid/Missing environment variables: "MONGO_DB_USER", "MONGO_DB_PASS", or "MONGO_DB_REST_URL"');
}

const user = process.env.MONGO_DB_USER;
const pass = process.env.MONGO_DB_PASS;
const restUrl = process.env.MONGO_DB_REST_URL;

// Ported from Python: uri = f"mongodb+srv://{MONGO_DB_USER}:{MONGO_DB_PASS}{MONGO_DB_REST_URL}"
const uri = `mongodb+srv://${user}:${pass}${restUrl}`;

const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;
