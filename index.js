const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      
    ],
    credentials: true,
  })
);
app.use(express.json());

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};
// Mongodb Database setup

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.axtsmlj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const blogs = client.db("storyForge").collection("blogs");
    const comments = client.db("storyForge").collection("comments");
    const wishList = client.db("storyForge").collection("wishlist");

//creating Token
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'7d'});

  res.cookie("token", token, cookieOptions).send({ success: true });
  res.send(user)
});

//clearing Token
app.post("/logout", async (req, res) => {
  const user = req.body;
  console.log("logging out", user);
  res
    .clearCookie("token", { ...cookieOptions, maxAge: 0 })
    .send({ success: true });
});


// getting blog data from database collection
app.get("/blogs", async (req,res)=>{
  const cursor = blogs.find();
  const result = await cursor.toArray();
  res.send(result)
})
// get single data for blog details
app.get("/all-blogs/:id", async(req, res)=>{
const id = req.params.id
const query = {_id: new ObjectId(id)}
const result = await blogs.findOne(query)
res.send(result)
})

// get sorted data
app.get("/featured-blog", async(req, res)=>{
  const sortedBlogs = await blogs.aggregate([
    {
      $addFields: {
        length: { $strLenCP: "$long_description" }
      }
    },
    {
      $sort: { length: -1 }
    }
  ]).toArray();
 res.send(sortedBlogs)
})

// adding blog by user 
app.post('/add-blog', async (req, res)=>{
  const blog = req.body
  const result = await blogs.insertOne(blog)
  res.send(result)
})



// get comment from database 
app.get("/allComments/:id", async (req, res)=>{
  const id = req.params.id;
  const filter= {
    postId: id
  }
  const result = await comments.find(filter).toArray();
 res.send(result)

})
// save comment to the database
app.post('/comments', async (req, res)=>{
  const comment = req.body;
  const result = await comments.insertOne(comment)
  res.send(result)
})

// get wishlist blog
app.get('/wishlist/:email', async(req, res)=>{
  const email = req.params.email
  const filter= {
    userEmail: email
  }
  const result = await wishList.find(filter).toArray();
 res.send(result)

})

// save wishlist blog
app.post('/wishlist', async (req, res)=>{
  const card = req.body;
  const result = await wishList.insertOne(card)
  res.send(result)
})

// update blog
app.put('/all-blogs/:id', async (req, res) => {
  const id = req.params.id;
  const filter = {
    _id: new ObjectId(id)
  };
  const options = {
    upsert: true
  };
 
  const updatedItem = req.body
  const Item = {
    $set: {
      title: updatedItem.title,
      category: updatedItem.category,
      short_description: updatedItem.short_description,
      long_description: updatedItem.long_description,
      image: updatedItem.image,
    }
  }
  
  const result = await blogs.updateOne(filter, Item, options)
  console.log(result)
  res.send(result)
})

// delete wishlist from database

app.delete('/wishlist/:id', async (req, res) => {
  const id = req.params.id;
  const query = {
    _id: new ObjectId(id)
  };
  const result = await wishList.deleteOne(query)
  res.send(result)
})


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





// Your routes and other configurations here
app.get("/", (req, res)=>{
  res.send('storyforge is running')
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
