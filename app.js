//jshint esversion:6
// ---- Instalacion de modulos y paquetes usados -------
require('dotenv').config()
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// ---- Creacion de la base de datos -----

mongoose.connect(
  "mongodb+srv://" + process.env.MONGO_USER + ":" + process.env.MONGO_PASSWORD + "@cluster0.hfwrw.mongodb.net/toDoListDB?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
  }
);

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({ name: "This is your to do list!" });
const item2 = new Item({ name: "Use the + button to add another item" });
const item3 = new Item({ name: "<--- Click here to remove it" });

const defaultItems = [item1, item2, item3];

// --- Llamadas al servidor ----

app.get("/", function (req, res) {
  const day = date.getDate();

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success adding elements to DB");
          res.redirect("/");
        }
      });
    } else {
      res.render("list", { listTitle: day, listItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  let itemName = req.body.newItem;

  let item = new Item({ name: itemName });

  item.save();

  res.redirect("/");
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.post("/delete", function (req, res) {
  let itemId = req.body.checkbox;

  Item.findByIdAndRemove({ _id: itemId }, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Success deleting item");
    }
    res.redirect("/");
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server up and running in port 3000 at http://localhost:3000");
});
