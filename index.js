const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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




// save comment to the database
app.post('/comments', async (req, res)=>{
  const comment = req.body;
  const result = await comments.insertOne(comment)
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
