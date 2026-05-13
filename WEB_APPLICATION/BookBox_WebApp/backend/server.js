const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend dela!");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API dela!" });
});

const PORT = process.env.PORT || 5000;
console.log(process.env.MONGO_URI)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB povezan");
    app.listen(PORT, () => {
      console.log(`Server teče na portu ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Napaka pri povezavi z MongoDB:", error);
  });