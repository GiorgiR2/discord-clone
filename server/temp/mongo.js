
require('dotenv').config();

const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_ADDRESS;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});
