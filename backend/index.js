// const port = 4000;
const PORT = process.env.PORT || 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { log } = require("console");

//payment last edited---------16/10/2025
// const Razorpay = require('razorpay');
// const crypto = require('crypto');

app.use(express.json());
app.use(cors());

// Data base connection with Mongodb

// Database connection with MongoDB

// Data base connection with Mongodb - SIMPLE & CORRECT
mongoose.connect("mongodb+srv://user2000:101010@cluster0.gt9vxi3.mongodb.net/e-commerce_app?retryWrites=true&w=majority", {
    serverSelectionTimeoutMS: 50000,
    socketTimeoutMS: 45000
});

mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected successfully to Render');
});

mongoose.connection.on('error', (err) => {
    console.log('❌ MongoDB connection failed:', err.message);
});

// mongoose.connect("mongodb+srv://user2000:101010@cluster0.gt9vxi3.mongodb.net/e-commerce_app",{
//      serverSelectionTimeoutMS: 30000, // 30 seconds
//      socketTimeoutMS: 45000, // 45 seconds
// });

// API Creation
app.get("/", (req,res)=>{
    res.send("Express App is Running")
})

//Image storage engine
const storage = multer.diskStorage({
    destination: './upload/images',        //upload function - upload folder
    filename:(req,file,cb)=>{
       return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`) 
    }
})
const upload = multer({storage:storage})

//Creating Upload Endpoint for image
app.use('/images',express.static('upload/images'))

app.post("/upload",upload.single('product'),(req,res)=>{
     res.json({
        success:1,
        image_url:`/images/${req.file.filename}`
     })
})

// app.post("/upload",upload.single('product'),(req,res)=>{
//      res.json({
//         success:1,
//         image_url:`http://localhost:${port}/images/${req.file.filename}`
//      })
// })

//Schema from creating products
const Product = mongoose.model("Product",{
    id:{
        type: Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    avilable:{
        type:Boolean,
        default:true,
    },
})

// ==================== ORDER SCHEMA ====================
// Order Schema - ADD THIS BEFORE THE APIs
const OrderSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    user_name: {
        type: String,
        required: true,
    },
    user_email: {
        type: String,
        required: true,
    },
    total_amount: {
        type: Number,
        required: true,
    },
    shipping_address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    order_date: {
        type: Date,
        default: Date.now,
    },
    items: [{
        productId: Number,
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }]
});

const Order = mongoose.model("Order", OrderSchema);

// ==================== USER SCHEMA ====================
// Schema creating for user model last updated 20/10/2025
const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    status: {  // ADD THIS NEW FIELD
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

// ==================== PRODUCT APIs ====================
app.post('/addproduct',async(req,res)=>{
    let products = await Product.find({});
    let id;
    if (products.length>0)
    {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }
    else{
        id=1;
    }
    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success:true,
        name:req.body.name,
    })
})

//Creating API for deleting Products
app.post('/removeproduct',async (req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name
    });
})

//Creating API for getting all products
app.get('/allproducts',async(req,res)=>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})

// ==================== ORDER APIs ====================

// Get all orders
app.get('/allorders', async (req, res) => {
    try {
        let orders = await Order.find({}).sort({ order_date: -1 });
        console.log("All Orders Fetched");
        res.send(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// Update order status
app.post('/updateorder', async (req, res) => {
    try {
        const { id, status } = req.body;
        
        if (!id || !status) {
            return res.status(400).json({ success: false, error: "Order ID and status are required" });
        }

        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: "Invalid status" });
        }

        await Order.findOneAndUpdate({ id: id }, { status: status });
        console.log("Order status updated");
        res.json({ 
            success: true, 
            message: "Order status updated successfully" 
        });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// Create a new order (for testing)
app.post('/createorder', async (req, res) => {
    try {
        let orders = await Order.find({});
        let id;
        if (orders.length > 0) {
            let last_order_array = orders.slice(-1);
            let last_order = last_order_array[0];
            id = last_order.id + 1;
        } else {
            id = 1;
        }

        const order = new Order({
            id: id,
            user_id: req.body.user_id,
            user_name: req.body.user_name,
            user_email: req.body.user_email,
            total_amount: req.body.total_amount,
            shipping_address: req.body.shipping_address,
            city: req.body.city,
            country: req.body.country,
            phone: req.body.phone,
            status: 'pending',
            items: req.body.items
        });

        await order.save();
        console.log("Order Created");
        res.json({
            success: true,
            message: "Order created successfully"
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// ==================== USER MANAGEMENT APIs ====================

// Get all users
app.get('/allusers', async (req, res) => {
    try {
        let users = await Users.find({}, { password: 0, cartData: 0 }).sort({ date: -1 }); // Exclude password and cartData
        console.log("All Users Fetched");
        res.send(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// Update user status
app.post('/updateuser', async (req, res) => {
    try {
        const { id, status } = req.body;
        
        if (!id || !status) {
            return res.status(400).json({ success: false, error: "User ID and status are required" });
        }

        const validStatuses = ['active', 'inactive'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: "Invalid status" });
        }

        await Users.findByIdAndUpdate(id, { status: status });
        console.log("User status updated");
        res.json({ 
            success: true, 
            message: "User status updated successfully" 
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// ==================== SAMPLE DATA API ====================
// Add this route to create sample data (temporary for testing)
app.post('/create-sample-data', async (req, res) => {
    try {
        // Create sample orders
        const sampleOrders = [
            {
                id: 1,
                user_id: new mongoose.Types.ObjectId(),
                user_name: "John Doe",
                user_email: "john@example.com",
                total_amount: 99.99,
                shipping_address: "123 Main St, New York, NY 10001",
                city: "New York",
                country: "USA",
                phone: "+1-555-0123",
                status: "pending",
                items: [
                    { productId: 1, name: "Summer T-Shirt", price: 29.99, quantity: 2, image: "http://localhost:4000/images/product_1.jpg" },
                    { productId: 2, name: "Casual Jeans", price: 39.99, quantity: 1, image: "http://localhost:4000/images/product_2.jpg" }
                ]
            },
            {
                id: 2,
                user_id: new mongoose.Types.ObjectId(),
                user_name: "Jane Smith",
                user_email: "jane@example.com",
                total_amount: 149.50,
                shipping_address: "456 Oak Avenue, Los Angeles, CA 90210",
                city: "Los Angeles",
                country: "USA",
                phone: "+1-555-0124",
                status: "confirmed",
                items: [
                    { productId: 3, name: "Winter Jacket", price: 149.50, quantity: 1, image: "http://localhost:4000/images/product_3.jpg" }
                ]
            },
            {
                id: 3,
                user_id: new mongoose.Types.ObjectId(),
                user_name: "Bob Wilson",
                user_email: "bob@example.com",
                total_amount: 75.25,
                shipping_address: "789 Pine Road, Chicago, IL 60601",
                city: "Chicago",
                country: "USA",
                phone: "+1-555-0125",
                status: "delivered",
                items: [
                    { productId: 4, name: "Sports Shoes", price: 75.25, quantity: 1, image: "http://localhost:4000/images/product_4.jpg" }
                ]
            }
        ];

        // Insert sample orders
        await Order.deleteMany({}); // Clear existing orders
        await Order.insertMany(sampleOrders);
        
        // Update existing users with status field
        await Users.updateMany(
            { status: { $exists: false } },
            { $set: { status: "active" } }
        );

        console.log("Sample data created successfully");
        res.json({ 
            success: true, 
            message: "Sample orders and users created successfully",
            ordersCount: sampleOrders.length,
            usersUpdated: "Existing users updated with status field"
        });
        
    } catch (error) {
        console.error("Error creating sample data:", error);
        res.status(500).json({ success: false, error: "Failed to create sample data" });
    }
});

// ==================== EXISTING USER APIs ====================

//Creating end point for registring user
app.post('/signup',async(req,res)=>{
    let check = await Users.findOne({email:req.body.email});
    if (check) {
        return res.status(400).json({success:false,errors:"existing user found with same email address"})
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
       cart[i]=0;
    }
    const user = new Users ({
        name:req.body.username,         //creating user
        email:req.body.email,       
        password:req.body.password,
        cartData:cart,
    })

    await user.save();     //using save method save user data in Database

    const data = {
        user:{
            id:user.id
        }
    }

    const token = jwt.sign(data,'secret_ecom');     //token creating
    res.json({success:true,token})
})

//creating endpoint for user login
app.post('/login',async (req,res)=>{
   let user = await Users.findOne({email:req.body.email});         //finding the user 
   if(user){
    const passCompare = req.body.password === user.password;
    if (passCompare) {
        const data = {
            user:{
                id:user.id
            }
        }
        const token = jwt.sign(data,'secret_ecom');
        res.json({success:true,token});
    }
    else{
        res.json({success:false,errors:"Wrong Password "});      //password checking 
    }
   }
   else{
    res.json({success:false,errors:"Wrong Email Id"});       //emailid checking 
   }
})

//creating endpoint for new collection data 
app.get('/newcollections',async(req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("NewCollection Fetched");
    res.send (newcollection);
})

//creating endpoint for popular in women section
app.get('/popularinwomen',async(req,res)=>{
    let products = await Product.find({category:"women"});
    let popular_in_women = products.slice(0,4);
    console.log("Popular in women fetched");
    res.send(popular_in_women);
})

//creating middleware to fetch user
const fetchUser = async(req,res,next)=>{
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({errors:"Please authenticate valid token"})
    }
    else{
        try {
            const data = jwt.verify(token,'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({errors:"Please authenticate valid token"})
        }
    }
}

// creating endpoint for adding products in cartdata
app.post('/addtocart',fetchUser,async (req,res)=>{
      console.log("Added",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added")
})

//creating endpoint to remove product from cartdata
app.post('/removefromcart',fetchUser,async(req,res)=>{
    console.log("Removed",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
     if( userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Removed")
})

//creating endpoint to get cartdata 
app.post('/getcart',fetchUser,async (req,res)=>{
    console.log("GetCart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})


app.listen(PORT, '0.0.0.0', (error)=>{
    if (!error) {
        console.log("Server Running on Port "+PORT)
    }
    else{
        console.log("Error "+error)
    }
})

// app.listen(port,(error)=>{
//     if (!error) {
//         console.log("Server Running on Port "+port)
//     }
//     else{
//         console.log("Error "+error)
//     }
// })