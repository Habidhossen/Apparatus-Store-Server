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
    const reviewsCollection = client
      .db("Apparatus-Store")
      .collection("reviews");
    const ordersCollection = client.db("Apparatus-Store").collection("orders");
    const usersCollection = client.db("Apparatus-Store").collection("users");

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

    // GET One Product by ID
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // POST (Review)
    app.post("/review", async (req, res) => {
      const data = req.body;
      const result = await reviewsCollection.insertOne(data);
      res.send(result);
    });

    // GET (Product)
    app.get("/review", async (req, res) => {
      const query = req.query;
      const result = await reviewsCollection.find(query).toArray();
      res.send(result);
    });

    // GET (Order)
    app.get("/order", async (req, res) => {
      const query = req.query;
      const result = await ordersCollection.find(query).toArray();
      res.send(result);
    });

    // GET One Order by Email
    app.get("/order/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await ordersCollection.find(filter).toArray();
      res.send(result);
    });

    // DELETE (Order)
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    });

    // POST (Order)
    app.post("/order", async (req, res) => {
      const data = req.body;
      const result = await ordersCollection.insertOne(data);
      res.send(result);
    });

    // POST (User)
    app.post("/user", async (req, res) => {
      const data = req.body;
      const result = await usersCollection.insertOne(data);
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
