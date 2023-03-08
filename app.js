//jshint esversion:6

const express = require("express");
//const bodyParser = require("body-parser");
const mongoose=require("mongoose");
//const date = require(__dirname + "/date.js");
const _=require("lodash");

//(node:68352) [MONGOOSE] DeprecationWarning: Mongoose: the `strictQuery` option will be switched back to `false` by default in Mongoose 7. 
// Use `mongoose.set('strictQuery', false);` 
// if you want to prepare for this change. 
// Or use `mongoose.set('strictQuery', true);` to suppress this warning.
mongoose.set("strictQuery", false);//it is added to avoid the depreciation warning wala msg
mongoose.connect(process.env.MONGODB_URI);

const itemSchema=new mongoose.Schema({
  name: String
});

const item=mongoose.model("item",itemSchema);

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemSchema]
})

const list=mongoose.model("list",listSchema);

const item1=new item({
  name:"Welcome to your todolist"
});

const item2=new item({
  name:"Hit + to add the new item"
});

const item3=new item({
  name:"<-- Hit this to delete the item"
});

const defaultarr=[item1,item2,item3];



const app = express();

app.get("/health",(req,res)=>{
  res.send("The app is working");
})

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));



app.get("/", function(req, res) {


  item.find(function(err,founditems){
    if(founditems.length===0)
    {
      item.insertMany(defaultarr,function(err){
        if(err)
          console.log(err);
        else  
          console.log("Successfully added to Database");
      });
      res.redirect("/");
    }
    else
    res.render("list", {listTitle: "Today", newListItems: founditems});
  })
  

});

app.post("/", function(req, res){

  const NewitemName = req.body.newItem;
  const listName=req.body.list;

  const newi=new item({
    name:NewitemName
  });

  if(listName==="Today")
  {
    newi.save();
    res.redirect("/");
  }
  else
  {
    list.findOne({name:listName},function(err,foundList){
      foundList.items.push(newi);//listSchema wala items hai
      foundList.save();
      res.redirect("/"+listName);
    });
  }
  
});

app.post("/delete",function(req,res){

    const checkedID=req.body.checkbox;
    const listName=req.body.listName;

    if(listName==="Today")
    {
      item.findByIdAndRemove(checkedID,function(err){
        if(err)
          console.log(err);
        else
        {
          console.log("Succesfully Removed");
          res.redirect("/")
        }
  
      });
    }
    else
    {
      list.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedID}}},function(err,foundList){
        if(!err)
          res.redirect("/"+listName);
      });
    }
    
});

app.get("/:urlName", function(req,res){
  const customListName=_.capitalize(req.params.urlName);
  
  list.findOne({name:customListName},function(err,foundlist){
    if(!err)
    {
      if(!foundlist)
        {
          const l=new list({
            name:customListName,
            items:defaultarr
          });
        
          l.save();
          res.redirect("/"+customListName);
        }
      else  
      res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items});
    }
  })

  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT ||3000, function() {
  console.log("Server started on port 3000");
});
