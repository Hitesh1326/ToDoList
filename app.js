//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://Hitesh:aEJKOzLlMUdAxzdt@firstcluster-b2pbe.gcp.mongodb.net/todoList", {
  useNewUrlParser: true
});

const itemSchema = {
  name: String
};



const Item = mongoose.model("Item", itemSchema);
const car = new Item({
  name: "swift"
});
const food = new Item({
  name: "food"
});
const coffee = new Item({
  name: "coffee"
});

const defaultItems = [car, food, coffee];

const listSchema ={
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  // let day = date.getDate();

  Item.find({}, function(e, foundItems) {
    if (foundItems.length == 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
        }
      });
        res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newItem: foundItems
      });
    }
  });
});


app.get("/:listName", function(req, res) {
  var customName = _.capitalize(req.params.listName);


  List.findOne({name:customName},function(err,foundList){
    if(!err){
        if(!foundList){
          const list = new List ({
            name: customName,
            items: []
          });
          list.save();
          res.redirect("/"+customName);
        }else{
          res.render("list",{
            listTitle: foundList.name,
            newItem: foundList.items
          });
        }
    }
  });
});



app.post('/', function(req, res) {
  const itemName = req.body.todo;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  if(listName =="Today"){
      item.save();
      res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
res.redirect("/"+listName);
    });

  }
});

app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

if(listName =="Today"){
  Item.findByIdAndRemove(checkedItem, function(err) {
    if (!err) {
      res.redirect("/");
    }
  });
}else{
  List.findOneAndUpdate({name: listName},{$pull :{items: {_id: checkedItem}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}


});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started");
});
