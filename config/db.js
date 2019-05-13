const mongoose = require('mongoose');

const config = require('config');

const db = config.get('mongoURI');

const connectDB = async ()=> {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true
        });

        console.log('Mongo Atlas conectado')
    } catch(err){
        console.log(err.message)
        process.exit(1)
    }
}

module.exports = connectDB;
const config = require('config');
const db = config.get('mongoURI');
