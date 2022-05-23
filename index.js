const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

// middleware
app.use(cors());
app.use(express.json());

// mongoDB drive code
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3mjkw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// create API and connect with Database
async function run() {
  try {
    await client.connect();
    const productsCollection = client
      .db("Apparatus-Store")
      .collection("products");

    // POST (Product)
    app.post("/product", async (req, res) => {
      const data = req.body;
      const result = await productsCollection.insertOne(data);
      res.send(result);
    });

    // GET (Product)
    app.get("/product", async (req, res) => {
      const query = req.query;
      const cursor = productsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

// ========================

// running the server
app.get("/", (req, res) => {
  res.send("Apparatus Store Server is Running...");
});

// listening port
app.listen(port, () => {
  console.log("Listening to port", port);
});
