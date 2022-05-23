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

// running the server
app.get("/", (req, res) => {
  res.send("Apparatus Store Server is running...");
});

// listening port
app.listen(port, () => {
  console.log("Listening to port", port);
});
