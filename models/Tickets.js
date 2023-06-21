const mongoose = require('mongoose')

var BookingSchema = mongoose.Schema({
    user_email:{
        type:String,
        required:false
    }
})
var TicketSchema = mongoose.Schema({
    date:{
        type:String,
        required:true,
    },
    count:{
        type:Number,
        required:false,
    },
    available:{
        type:Number,
        required:false, 
    },
    booking_id:[BookingSchema]
},{
    timestamps:true
})

var TicketModel = mongoose.model("tickets",TicketSchema);
module.exports = TicketModel;