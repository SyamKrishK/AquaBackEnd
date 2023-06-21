const mongoose = require('mongoose');
const DetailSchema = mongoose.Schema({
    title:{
        type:String,
        required:false
    },
    contents:{
        type:String,
        required:false
    }
})
const ReviewSchema = mongoose.Schema({
    email:{
        type:String,
        required:false,
        default:''
    },
    author:{
        type:String,
        required:false,
        default:''
    },
    rating:{
        type:Number,
        required:false,
        default:0
    },
    comments:{
        type:String,
        required:false,
        default:''
    },
    date:{
        type:String,
        required:false,
        default:''
    }

})
const PlantSchema = mongoose.Schema({
    img:{
        type:String,
        required: true,
    },
    plantName:{
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
    rating:{
        type:Number,
        required:false,
        default:0
    },
    ratingCount:{
        type:Number,
        required:false,
        default:0
    }, 
    stockCount:{
        type:Number,
        required:false,
        default:0
    },
    details:[DetailSchema],
    reviews : [ReviewSchema]
},{
    timestamps:true
});

const PlantModel = mongoose.model("plants",PlantSchema);
module.exports = PlantModel;