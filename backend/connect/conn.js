const mangoose=require("mongoose");

const conn = async ()  => {
    try{
        await mangoose.connect(`${process.env.URI}`)
        console.log("connected to database")
    }
    catch (error){
        console.log(error);
    }
}

conn();