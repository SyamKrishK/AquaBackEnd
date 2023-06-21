const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose'); 
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const path = require('path')
const Razorpay = require('razorpay');
const request = require('request');
const keys = require("./keys")


const CategoryModel = require("./models/Categories")
const FishesModel = require('./models/Fishes');
const PlantModel = require("./models/Plants");
const FoodModel = require('./models/Foods');
const SubstrateModel = require('./models/Substrates');
const FilterModel = require('./models/Filters');
const RecentModel = require('./models/RecentProducts');
const UserModel = require('./models/User'); 
const TicketModel = require('./models/Tickets');

app.use(cors());
//app.use('uploads', express.static('uploads'))
//app.use(express.json());
//app.use('/images', express.static(path.join(__dirname, 'uploads')))
app.use('/uploads',express.static('uploads')); //uploads image
//app.use(express.static(__dirname+"./uploads/"));
//DATABASE CONNECTION
mongoose.connect(
    "mongodb://localhost:27017/aquarina?readPreference=primary&appname=MongoDB%20Compass&ssl=false",
    { useNewUrlParser: true }
);

// app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended:false,
    })
)
//define the storage for the images
// const storage = multer.diskStorage({
//     //destination for files
//     destination:function(req,file,callback){
//         callback(null,'./uploads/images');
//     },

//     //add back the extension
//     filename:function(req,file,callback){
//         callback(null,Date.now()+file.originalname);
//     }
// });


// //upload params for multers
// const upload = multer({
//     storage:storage,
//     limits:{
//         fieldSize:1024*1024*3
//     }
// })
const razorInstance = new Razorpay({
    key_id : keys.razorIdKey,
    key_secret :keys.razorIdSecret
})
app.post("/razorpay/order",async(req,res)=>{
    try{
        const options ={
            amount : parseFloat(req.body.total)*100,
            currency : "INR",
            receipt: "receipt#1",
            payment_capture: 1, //  1-means automatically capture 0- means authorised only
      
        };
        razorInstance.orders.create(options,async function(err,order){
            if(err){
                return res.status(500).json({
                  message: "Something error!s"
                })
              }
              return res.status(200).json(order)
        });
    }
    catch(err){
        return res.status(500).json({
          message: "Something error!s"
        })
    }
})
app.post("/razorpay/capture/:paymentId",(req,res)=>{
    try{
      return request(
        {
          method : "POST",
          url : `https://${keys.razorIdkey}:${keys.razorIdSecret}@api.razorpay.com/v1/payments/${req.params.paymentId}/capture`,
          form:{
            amount : parseFloat(req.body.total) *100,
            currency: "INR"
          },
        },
        async function(err,response,body){
          if(err){
            return res.status(500).json({
              message: "Something error!s"
            })
          }
          return res.status(200).json(body)
        }
      )
    }
    catch(err){
      return res.status(500).json({
        message: err.message
      })
    }
  })

  
app.use(fileUpload());
app.post('/fishes',async (req,res)=>{
    //console.log(req.files);
    //console.log(req.body);
    var img = req.files.image
      
    // console.log("image ",req.files.image);
    const imageTime = Date.now()+img.name;
    await img.mv('uploads/images/'+imageTime,async(err)=>{
            if(err){
                res.json({"status":"file Not Uploaded"});
            }
            else{
                // var ins_obj = {
                //     fishName:req.body.name,
                //     price:req.body.price,
                //     img:imageTime,
                //     category:req.body.category
                // }
                const fish = new FishesModel({
                    fishName:req.body.name,
                    price:req.body.price,
                    img:imageTime,
                    category:req.body.category,
                    stockCount:parseInt(req.body.stock)
                });
                await fish.save() 
                .then(()=>{})
                .catch((err)=>{console.log(err)});

                FishesModel.find({},(error,result)=>{
                    if(error){
                        res.send(error);
                    }
                    else{
                        res.send(result);
                    }
                })
            }
    });
    
}) 
app.get("/categories",async(req,res)=>{
    CategoryModel.find({},(err,result)=>{
        if(err){
            res.send(err);
        }
        else{
            res.send(result);
        }
    })
})

app.get("/fishes",async(req,res)=>{
    FishesModel.find({},(err,result)=>{
        if(err){
            res.send(err);
        }
        else{
            res.send(result);
        }
    })
})

//add the Details of the Fishes
app.put("/fishes/details",async(req,res)=>{
    console.log(req.body);
    const des = await FishesModel.findByIdAndUpdate(
        req.body.id,
        {$addToSet:{details:{title:req.body.title,contents:req.body.content}}},
        {upsert: true, new : true}
    )
    des.save();
    res.send(des);
})

//add the Details of the Plants
app.put("/plants/details",async(req,res)=>{
    console.log(req.body);
    const des = await PlantModel.findByIdAndUpdate(
        req.body.id,
        {$addToSet:{details:{title:req.body.title,contents:req.body.content}}},
        {upsert: true, new : true}
    )
    des.save();
    res.send(des);
})

//add the Details of the substrates
app.put("/substrate/details",async(req,res)=>{
    console.log(req.body);
    const des = await SubstrateModel.findByIdAndUpdate(
        req.body.id,
        {$addToSet:{details:{title:req.body.title,contents:req.body.content}}},
        {upsert: true, new : true}
    )
    des.save();
    res.send(des);
})

app.put("/fishfoods/details",async(req,res)=>{
    console.log(req.body);
    const des = await FoodModel.findByIdAndUpdate(
        req.body.id,
        {$addToSet:{details:{title:req.body.title,contents:req.body.content}}},
        {upsert: true, new : true}
    )
    des.save();
    res.send(des);
})

app.put("/filters/details",async(req,res)=>{
    console.log(req.body);
    const des = await FilterModel.findByIdAndUpdate(
        req.body.id,
        {$addToSet:{details:{title:req.body.title,contents:req.body.content}}},
        {upsert: true, new : true}
    )
    des.save();
    res.send(des);
})



//post Plants
app.post('/plants',async(req,res)=>{ 
    var img = req.files.image 
    const imageTime = Date.now()+img.name;
    await img.mv('uploads/images/'+imageTime,async(err)=>{
            if(err){
                res.json({"status":"file Not Uploaded"});
            }
            else{ 
                const plant = new PlantModel({
                    plantName:req.body.name,
                    price:req.body.price,
                    img:imageTime,
                    category:req.body.category,
                    stockCount:parseInt(req.body.stock)
                });
                await plant.save() 
                .then(()=>{})
                .catch((err)=>{console.log(err)});

                PlantModel.find({},(error,result)=>{
                    if(error){
                        res.send(error);
                    }
                    else{
                        res.send(result);
                    }
                })
            }
    });
    
});
//Get for Plants
app.get("/plants",async(req,res)=>{
    PlantModel.find({},(err,result)=>{
        if(err){
            res.send(err);
        }
        else{
            res.send(result);
        }
    })
})

//Post The Substrates
app.post('/substrates',async(req,res)=>{ 
    var img = req.files.image 
    const imageTime = Date.now()+img.name;
    await img.mv('uploads/images/'+imageTime,async(err)=>{
            if(err){
                res.json({"status":"file Not Uploaded"});
            }
            else{ 
                const substrate = new SubstrateModel({
                    substrateName:req.body.name,
                    price:req.body.price,
                    img:imageTime,
                    category:req.body.category,
                    stockCount:parseInt(req.body.stock)
                });
                await substrate.save() 
                .then(()=>{})
                .catch((err)=>{console.log(err)});

                SubstrateModel.find({},(error,result)=>{
                    if(error){
                        res.send(error);
                    }
                    else{
                        res.send(result);
                    }
                })
            }
    });
    
});
//Get for Substrates
app.get("/substrates",async(req,res)=>{
    SubstrateModel.find({},(err,result)=>{
        if(err){
            res.send(err);
        }
        else{
            res.send(result);
        }
    })
})

//Post the Foods
app.post('/fishfoods',async(req,res)=>{ 
    var img = req.files.image 
    const imageTime = Date.now()+img.name;
    await img.mv('uploads/images/'+imageTime,async(err)=>{
            if(err){
                res.json({"status":"file Not Uploaded"});
            }
            else{ 
                const food = new FoodModel({
                    foodName:req.body.name,
                    price:req.body.price,
                    img:imageTime,
                    category:req.body.category,
                    stockCount:parseInt(req.body.stock)
                });
                await food.save() 
                .then(()=>{})
                .catch((err)=>{console.log(err)});

                FoodModel.find({},(error,result)=>{
                    if(error){
                        res.send(error);
                    }
                    else{
                        res.send(result);
                    }
                }) 
            }
    });
    
});
//Get the Foods
app.get("/fishfoods",async(req,res)=>{
    FoodModel.find({},(err,result)=>{
        if(err){
            res.send(err);
        }
        else{
            res.send(result);
        }
    })
})

//Get for Accessories
app.get("/filters",async(req,res)=>{
    FilterModel.find({},(err,result)=>{
        if(err){
            res.send(err);
        }
        else{
            res.send(result);
        }
    })
});
//Post Filters
app.post('/filters',async (req,res)=>{ 
    var img = req.files.image 
    const imageTime = Date.now()+img.name;
    await img.mv('uploads/images/'+imageTime,async(err)=>{
            if(err){
                res.json({"status":"file Not Uploaded"});
            }
            else{ 
                const filter = new FilterModel({
                    filterName:req.body.name,
                    price:req.body.price,
                    img:imageTime,
                    category:req.body.category,
                    stockCount:parseInt(req.body.stock)
                });
                await filter.save() 
                .then(()=>{})
                .catch((err)=>{console.log(err)});

                FilterModel.find({},(error,result)=>{
                    if(error){
                        res.send(error);
                    }
                    else{
                        res.send(result);
                    }
                })
            }
    });
    
});
//get user
app.get("/user",async(req,res)=>{
    UserModel.find({},(err,result)=>{
        if(err){
            res.send(err);
        }
        else{
            res.send(result);
        }
    })
})
//user
app.post("/user",async(req,res)=>{
    let user = await UserModel.findOne({ email: req.body.email });
    if (user) {
        UserModel.findOne({email: req.body.email},(err,result)=>{
            if(err){
                res.send(err);
            }
            else{
                res.send(result);
            }
        })
    } else {
        // Insert the new user if they do not exist yet
        user = new UserModel({ 
            email: req.body.email, 
        });
        await user.save()
        .then(()=>{})
        .catch((err)=>{console.log(err)});
        res.send(user);
    }
    
})
//Tickets
app.post("/ticket",async(req,res)=>{
    console.log(req.body); 
    let tic = await TicketModel.findOne({ date: req.body.date });
    if(!tic){
        const ticket = new TicketModel({
            date:req.body.date,
            count:100,
            available:100-req.body.available,
        }) 
        await ticket.save()
        .then(()=>{})
        .catch((err)=>{console.log(err)})
    }
    else{
        await TicketModel.findOneAndUpdate(
            { date: req.body.date },
            { available : parseInt(req.body.available)}
        )
        await TicketModel.findOneAndUpdate(
            { date: req.body.date }, 
            { $addToSet: { booking_id: {user_email:req.body.user_id}  } });
        
    }
    var temp = await TicketModel.findOne({ date: req.body.date });
    //console.log(temp);
    res.send(temp);
    temp='';
})

app.get("/ticket",async(req,res)=>{
    const da = new Date().toISOString().slice(0, 10);
    //console.log("today ",new Date().toISOString().slice(0, 10));
    var temp1 = await TicketModel.findOne({ date: da}); 
    res.send(temp1);
    temp1='';
})


app.put("/user/ticket",async(req,res)=>{
    //console.log(req.body)
    const dat = new Date().toISOString().slice(0, 10); 
    const tic = await UserModel.findOneAndUpdate(
        { email: req.body.email }, 
        { $addToSet: { ticket: {date:req.body.date,members:req.body.members}  } }); 
    tic.save();
    res.send(tic);
})


//for Orders
app.put("/user/order",async(req,res)=>{
    const datee = new Date().toISOString().slice(0, 10);
    await UserModel.findOneAndUpdate(
        {email:req.body.email},
        {$addToSet:{ orders: {
            price:req.body.price,
            count:req.body.count, 
            user_name:req.body.user_name,
            contactno : req.body.contactno,
            address:req.body.address,
            state:req.body.state,
            country:req.body.country,
            product_img:req.body.product_img,
            product_name:req.body.product_name,
            date:datee
        }}}
    );
    UserModel.find({},(err,result)=>{
        if(err){
            res.send(err);
        }
        else{
            res.send(result);
        }
    })
})


app.put("/user/cart",async(req,res)=>{
    console.log(req.body);
    const cartt = await UserModel.findOneAndUpdate(
        { email: req.body.email }, 
        { $addToSet: { cart: {product_id:req.body.product_id,product_name:req.body.product_name,count:req.body.count,category:req.body.category,product_img:req.body.img,price:req.body.price}  } });
        // UserModel.findOne({email: req.body.email},(err,result)=>{
        //     if(err){
        //         res.send(err);
        //     }
        //     else{
        //         res.send(result);
        //     }
        // }) 
    cartt.save();
    res.send(cartt);
})

app.put("/user/cart/delete",async(req,res)=>{
    console.log(req.body);
    const dele = await UserModel.findOneAndUpdate(
        { email: req.body.email }, 
        { $pull: { cart: { product_name: req.body.name} } });
    dele.save();
    res.send(dele);
})

app.put("/delete/fishes",async(req,res)=>{
    FishesModel.findByIdAndRemove(req.body.id, function(err){
        if(err){
            console.log("errorsds",err);
        } else {
            console.log("successfully deleted");
        }
     });
     FishesModel.find({},(err,result)=>{
        if(err){
            res.send(err);
        }
        else{
            res.send(result);
        }
    })
})

app.put("/delete/substrates",async(req,res)=>{
    SubstrateModel.findByIdAndRemove(req.body.id, function(err){
        if(err){
            console.log("errorsds",err);
        } else {
            console.log("successfully deleted");
        }
     });
     SubstrateModel.find({},(err,result)=>{
        if(err){
            res.send(err);
        }
        else{
            res.send(result);
        }
    })
})
app.put("/delete/fishfoods",async(req,res)=>{
    FoodModel.findByIdAndRemove(req.body.id, function(err){
        if(err){
            console.log("errorsds",err);
        } else {
            console.log("successfully deleted");
        }
     });
     FoodModel.find({},(err,result)=>{
        if(err){
            res.send(err);
        }
        else{
            res.send(result);
        }
    })
})
app.put("/delete/filters",async(req,res)=>{
    FilterModel.findByIdAndRemove(req.body.id, function(err){
        if(err){
            console.log("errorsds",err);
        } else {
            console.log("successfully deleted");
        }
     });
     FilterModel.find({},(err,result)=>{
        if(err){
            res.send(err);
        }
        else{
            res.send(result);
        }
    })
})
app.put("/delete/plants",async(req,res)=>{

    PlantModel.findByIdAndRemove(req.body.id, function(err){
        if(err){
            console.log("errorsds",err);
        } else {
            console.log("successfully deleted");
        }
     });
     PlantModel.find({},(err,result)=>{
        if(err){
            res.send(err);
        }
        else{
            res.send(result);
        }
    })
})


//Star Rating
app.put("/rating/fishes",async(req,res)=>{
    console.log(req.body); 
    await FishesModel.findByIdAndUpdate(
        req.body.id,
        { ratingCount:parseInt(req.body.ratingCount),
            rating:parseInt(req.body.rating),
            $addToSet: { reviews: {
            email:req.body.email,
            author:req.body.author,
            rating:parseInt(req.body.rating),
            comments:req.body.comment,
            date:req.body.date, 
        }  }},
        {upsert: true, new : true,multi:true}
    )  
    res.json({"status":"successfully updated rating"})
      
}) ;
app.put("/rating/foods",async(req,res)=>{
    console.log(req.body); 
    await FoodModel.findByIdAndUpdate(
        req.body.id,
        { ratingCount:parseInt(req.body.ratingCount),
            rating:parseInt(req.body.rating),
            $addToSet: { reviews: {
            email:req.body.email,
            author:req.body.author,
            rating:parseInt(req.body.rating),
            comments:req.body.comment,
            date:req.body.date, 
        }  }},
        {upsert: true, new : true,multi:true}
    )  
    res.json({"status":"successfully updated rating"})
})
app.put("/rating/substrates",async(req,res)=>{
    console.log(req.body); 
     await SubstrateModel.findByIdAndUpdate(
        req.body.id,
        { ratingCount:parseInt(req.body.ratingCount),
            rating:parseInt(req.body.rating),
            $addToSet: { reviews: {
            email:req.body.email,
            author:req.body.author,
            rating:parseInt(req.body.rating),
            comments:req.body.comment,
            date:req.body.date, 
        }  }},
        {upsert: true, new : true,multi:true}
    )  
    res.json({"status":"successfully updated rating"})
})

app.put("/rating/filters",async(req,res)=>{
    console.log(req.body); 
    await FilterModel.findByIdAndUpdate(
        req.body.id,
        { ratingCount:parseInt(req.body.ratingCount),
            rating:parseInt(req.body.rating),
            $addToSet: { reviews: {
            email:req.body.email,
            author:req.body.author,
            rating:parseInt(req.body.rating),
            comments:req.body.comment,
            date:req.body.date, 
        }  }},
        {upsert: true, new : true,multi:true}
    )  
    res.json({"status":"successfully updated rating"})
})
app.put("/rating/plants",async(req,res)=>{
    console.log(req.body); 
    await PlantModel.findByIdAndUpdate(
        req.body.id,
        { ratingCount:parseInt(req.body.ratingCount),
            rating:parseInt(req.body.rating),
            $addToSet: { reviews: {
            email:req.body.email,
            author:req.body.author,
            rating:parseInt(req.body.rating),
            comments:req.body.comment,
            date:req.body.date, 
        }  }},
        {upsert: true, new : true,multi:true}
    )  
    res.json({"status":"successfully updated rating"})
})

//Server is Running this Port
app.listen(3001,()=>{
    console.log(`Server is up and running on http://localhost:3001`);
})
