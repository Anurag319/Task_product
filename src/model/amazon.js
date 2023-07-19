const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    id:{
        type: Number,
        required:true
    },
    title:{
        type: String,
        required:true
    },
    price:{
        type: mongoose.Types.Decimal128,
        required:true
    },
    description:{
        type: String,
        required:true
    },
    category:{
        type: String,
        required:true
    },
    image:{
        type: String,
        required:true
    },
    sold:{
        type: Boolean,
        required:true
    },
    dateOfSale:{
        type: Date,
        required:true
    },
})

const Product = new mongoose.model('Amazon',productSchema);

module.exports = Product;