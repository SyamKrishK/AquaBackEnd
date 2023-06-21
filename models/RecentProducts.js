const mongoose = require('mongoose');

const RecentSchema = mongoose.Schema({
    img:{
        type:String,
        required: true,
    },
    name:{
        type:String,
        required: true,
    },
    price:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
},{
    timestamps:true
});

const RecentModel = mongoose.model("recentproducts",RecentSchema);
module.exports = RecentModel;