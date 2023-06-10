
const express = require('express')
const app = express();
const cors = require("cors");
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(express.json())
app.use(cors())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.unnbbpt.mongodb.net/?retryWrites=true&w=majority`;

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

        const classCollection = client.db("summerCamp").collection("classes");
        const instructorCollection = client.db("summerCamp").collection("instructors");
        const blogsCollection = client.db("summerCamp").collection("blogs");
        const UsersCollection = client.db("summerCamp").collection("users");
        const selectedCollection = client.db("summerCamp").collection("selected");

        app.get('/classes', async (req, res) => {
            const result = await classCollection.find().toArray();
            res.send(result)
        })
        app.get('/instructors', async (req, res) => {
            const result = await instructorCollection.find().toArray();
            res.send(result)
        })
        app.get('/blogs', async (req, res) => {
            const result = await blogsCollection.find().toArray();
            res.send(result)
        })

        // post user
        app.post('/users', async(req, res) => {
            const user = req.body;
            const query = {"email": user.email}
            const findUser = await UsersCollection.findOne(query);
            if (findUser) {
                return;
            }
            const result = await UsersCollection.insertOne(user);
            res.send(result)
        })
        app.get('/users/:email', async(req, res) =>{
            const email = req.params.email;
            const query = {"email": email};
            const result = await UsersCollection.findOne(query);
            res.send(result);
        })

        // selected class
        app.post('/selected', async(req, res) => {
            const selectedClass = req.body;
            const query = {"className": selectedClass.className}
            const selected = await selectedCollection.findOne(query);
            if (selected) {
                return;
            }
            const result = await selectedCollection.insertOne(selectedClass);
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



app.get('/', (req, res) => {
    res.send("summer camp sports academy server is running")
})
app.listen(port, () => {
    console.log(`summer camp sports academy server on port: ${port}`);
})