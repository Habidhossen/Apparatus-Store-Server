const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;

// middleware
// app.use(cors());
const corsConfig = {
  origin: true,
  Credentials: true,
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

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
    const paymentCollection = client
      .db("Apparatus-Store")
      .collection("payments");

    // Create Payment Intent
    app.post("/create-payment-intent", async (req, res) => {
      const service = req.body;
      const price = service.totalPrice;
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({ clientSecret: paymentIntent.client_secret });
    });

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

    // DELETE (Product)
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
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

    // GET One Order by ID
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.findOne(query);
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

    app.patch("/order/:id", async (req, res) => {
      const id = req.params.id;
      const payment = req.body;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId,
        },
      };
      const result = await paymentCollection.insertOne(payment);
      const updatedOrder = await ordersCollection.updateOne(filter, updatedDoc);
      res.send(updatedOrder);
    });

    // POST (Order)
    app.post("/order", async (req, res) => {
      const data = req.body;
      const result = await ordersCollection.insertOne(data);
      res.send(result);
    });

    // POST or UPDATE (User)
    app.put("/user/:email", async (req, res) => {
      // const data = req.body;
      // const result = await usersCollection.insertOne(data);
      // res.send(result);
      const data = req.body;
      const email = req.params.email;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...data,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // GET (Order)
    app.get("/user", async (req, res) => {
      const query = req.query;
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    // GET One User by Email
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await usersCollection.findOne(filter);
      res.send(result);
    });

    // Make Admin
    app.put("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // GET Admin by Email and Admin-Role
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email });
      const isAdmin = user?.role === "admin";
      res.send({ admin: isAdmin });
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
