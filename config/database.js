const mongoose = require("mongoose");
require("dotenv").config();

const dbConnect = () => {
    mongoose.connect(process.env.MONGODB_URL,
        { useNewUrlParser: true, useUnifiedTopology: true })
        .then(console.log("Database connected Successfully")).catch((err) => {
            console.log("DB Connection failed")
            console.error(err);
            process.exit(1);
            ;
        })
}

module.exports = dbConnect;