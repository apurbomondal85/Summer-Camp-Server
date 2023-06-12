
const express = require('express')
const app = express();
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);
const cors = require("cors");
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(express.json())
app.use(cors())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const usersCollection = client.db("summerCamp").collection("users");
        const selectedCollection = client.db("summerCamp").collection("selected");


        // payment section
        app.post("/create-payment-intent", async (req, res) => {
            try {
                const { price } = req.body;
                if (!price) {
                    return;
                }
                const amount = price * 100;
                const paymentIntent = await stripe.paymentIntents.create({
                    amount,
                    currency: "usd",
                    payment_method_types: ['card'],
                });
                res.send({
                    clientSecret: paymentIntent.client_secret,
                });
            } catch (error) {
                console.log(error.message);
            }
        });


        // added classes 
        app.post('/classes', async (req, res) => {
            const addClass = req.body;
            const result = await classCollection.insertOne(addClass);
            res.send(result)
        })
        // get all class
        app.get('/classes', async (req, res) => {
            const result = await classCollection.find().toArray();
            res.send(result)
        })
        app.get('/classes/:email', async (req, res) => {
            const email = req.params.email;
            const result = await classCollection.find({ email }).toArray();
            res.send(result)
        })
        // update Classes status
        app.patch('/classes/:id', async (req, res) => {
            const id = req.params.id;
            const updateStatus = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: updateStatus.status
                },
            };
            const result = await classCollection.updateOne(filter, updateDoc)
            res.send(result)
        })
        app.patch('/classes', async (req, res) => {
            const id = req.query.id;
            const updateFeedback = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    feedback: updateFeedback.feedback
                },
            };
            console.log(updateDoc);
            const result = await classCollection.updateOne(filter, updateDoc)
            res.send(result)
        })


        // get instructor
        app.get('/instructors/:role', async (req, res) => {
            const role = req.params.role;
            const result = await usersCollection.find({ role }).toArray();
            res.send(result)
        })
        app.get('/blogs', async (req, res) => {
            const result = await blogsCollection.find().toArray();
            res.send(result)
        })

        // post user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { "email": user.email }
            const findUser = await usersCollection.findOne(query);
            if (findUser) {
                return;
            }
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })
        app.get('/users', async (req, res) => {
            const query = { role: "user" }
            const result = await usersCollection.find(query).toArray();
            res.send(result);
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { "email": email };
            const result = await usersCollection.findOne(query);
            res.send(result);
        })
        app.patch('/users/:id', async (req, res) => {
            const id = req.params.id;
            const updateRole = req.body;
            const query = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: updateRole.role
                },
            };
            const result = await usersCollection.updateOne(query, updateDoc);
            res.send(result);
        })

        // selected class
        app.post('/selected', async (req, res) => {
            const selectedClass = req.body;
            const query = {
                $and: [
                    { email: selectedClass.email },
                    { "className": selectedClass.className }
                ]
            }
            const selected = await selectedCollection.findOne(query);
            if (selected) {
                return;
            }
            const result = await selectedCollection.insertOne(selectedClass);
            res.send(result)
        })
        app.get('/selected/:email', async (req, res) => {
            const email = req.params.email;
            const query = { "email": email }
            const result = await selectedCollection.find(query).toArray();
            res.send(result)
        })
        // delete selected class
        app.delete('/selected/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await selectedCollection.deleteOne(query);
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