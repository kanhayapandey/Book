const express = require("express");

const app= express();


app.use(express.json());
const cors = require('cors');
app.use(cors());



require("dotenv").config();
require("./connect/conn");


const User=require("./routes/user");

const books=require("./routes/books");

const favourite=require("./routes/favourite");
const Order=require("./routes/order");

const Cart=require("./routes/cart");
app.use("/api/v1" ,User);
app.use("/api/v1" ,books);

app.use("/api/v1" ,favourite);
app.use("/api/v1" ,Cart);
app.use("/api/v1" ,Order);
 
 



// creating port

app.listen(process.env.PORT, ()=>{
    console.log(`server started ${process.env.PORT}`);
});