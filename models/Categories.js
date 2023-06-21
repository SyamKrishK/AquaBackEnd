const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    img : {
        type:String,
        required:true,
    },
    caption:{
        type:String,
        required:true,
    }
});

const CategoryModel = mongoose.model("categories",CategorySchema);

module.exports = CategoryModel;