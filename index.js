const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());



// routes
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yfvcqxe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();
        const JobCollection = client.db('JobsDB').collection('JobCollection')
        const ApplicationCollection = client.db('ApplicationDB').collection('ApplicationCollection')

        app.get('/jobs', async (req, res) => {
            const jobs = await JobCollection.find({}).toArray();
            res.send(jobs);
        })
        app.get('/my-jobs', async (req, res) => {
            const email = req.query.email
            const jobs = await JobCollection.find({"postedBy.email" : email}).toArray();
            res.send(jobs);
        })
        app.get('/applied-jobs', async (req, res) => {
            const email = req.query.email
            const jobs = await ApplicationCollection.find({"applicantsData.applicantsEmail" : email}).toArray();
            res.send(jobs);
            console.log(jobs)
        })

        // load single job for view details
        app.get('/job/:id',  async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) }
            // const options = {
            //     projection: {
            //         postingDate: 0,
            //     }
            // }
            const job = await JobCollection.findOne(query)
            res.send(job);
        })
        // load single job for update
        app.get('/get-job/:id',  async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) }
            const job = await JobCollection.findOne(query)
            res.send(job);
        })


        app.post('/add-job', async (req, res) => { 
            const job = req.body;
            const result = await JobCollection.insertOne(job);
            res.json(result);
        })

        app.post('/apply', async (req, res) => { 
            const applicantsData = req.body;
            console.log({ applicantsData })
            const result = await ApplicationCollection.insertOne(applicantsData)
            res.json(result);
        })

        app.put('/update/:id', async (req, res) => { 
            const id = req.params.id;
            const job = req.body;
            const query = { _id: new ObjectId(id) }
            const options = {
                upsert: true,
            }
            const result = await JobCollection.updateOne(query, { $set: job }, options)
            res.json(result);
        })
        app.patch('/applicants/:id', async (req, res) => { 
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await JobCollection.updateOne(query, { $inc: { applicants: +1 } })
            res.json(result);
        })
        app.delete('/delete/:id', async (req, res) => { 
            const id = req.params.id;
            console.log(id)
            const query = { _id: new ObjectId(id) }
            const result = await JobCollection.deleteOne(query)
            res.json(result);
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

console.log(process.env.DB_USER);
app.get('/', (req, res) => {
    res.send('Hello World');
})

app.listen(port, (req, res) => {
    console.log(`server is running on port ${port}`);
})
