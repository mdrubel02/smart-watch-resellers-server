const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const dbConnect = require('./Utls/dbConnect');
const productsRouter = require("./routes/products.route")
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;




app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gc0naor.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
dbConnect()

app.use('/tools', productsRouter)

async function run() {
    try {

        const categoriesCollection = client.db('organicFood').collection('categories')
        const usersCollection = client.db('organicFood').collection('users');
        const productsCollection = client.db('organicFood').collection('products');
        const bookingsCollection = client.db('organicFood').collection('bookings');
        const addProductCollection = client.db('organicFood').collection('addProducts');



        // app.get('/jwt', async (req, res) => {
        //     const email = req.query.email;
        //     const query = { email: email };
        //     const user = await usersCollection.findOne(query);
        //     if (user) {
        //         const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '9h' })
        //         return res.send({ accessToken: token });
        //     }
        //     res.status(403).send({ accessToken: '' })
        // });
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result)
            res.send(result);
        });
        app.get('/allUsers', async (req, res) => {
            const query = {}
            const users = await usersCollection.find(query).toArray()
            res.send(users)
        })
        app.delete('/allUsers/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(filter)
            res.send(result);
        })
        // .................. get all buyer ................

        app.get("/admin",  async (req, res) => {
            const filter = { rode: "admin" };
            const result = await usersCollection.find(filter).toArray();
            res.send(result);
        });
        app.get("/allBuyers",  async (req, res) => {
            const filter = { userName: "Buyer" };
            const result = await usersCollection.find(filter).toArray();
            res.send(result);
        });
        // .................. get all seller ................

        app.get("/allSellers",  async (req, res) => {
            const filter = { userName: "Seller" };
            const result = await usersCollection.find(filter).toArray();
            res.send(result);
        });

//verify all user
        app.put('/verify/:email', async (req,res)=>{
            const email = req.params.email;
            console.log(email)
            const filter = {email: email}
            console.log(filter)
            const options = {upsert: true};
            const updateDoc ={
                $set: {
                    verify: "Verified",
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.put('/users/admin/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    rode: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })
        //add products
        app.get('/addProducts', async (req, res) => {
            const email = req.query.email;
            console.log(email)
            const query = { email: email }
            const result = await addProductCollection.find(query).toArray()
            res.send(result)
        })
        // app.get('/addProducts', async (req,res)=>{
        //     const query = {}
        //     const result = await addProductCollection.find(query).toArray()
        //     res.send(result)
        // })
        app.post('/addProducts', async (req, res) => {
            const addProducts = req.body;
            const result = await addProductCollection.insertOne(addProducts)
            res.send(result)
        })
        app.delete('/addProducts/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const filter = { _id: ObjectId(id) };
            const result = await addProductCollection.deleteOne(filter);
            res.send(result);
        })
        app.put('/addProducts/:id', async (req, res) => {
            const id = req.params.id;
            const product = req.body;
            const options = { upsert: true };
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    price: product.price,
                    phone: product.phone,
                    sales: product.sales
                }
            }

            const result = await addProductCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })
        //buyer bookings
        app.post('/bookings', async (req, res) => {
            const bookings = req.body;
            const query = {
                productName: bookings.productName,
                userEmail: bookings.userEmail
            }

            const alreadyBooked = await bookingsCollection.find(query).toArray();
            if (alreadyBooked.length) {
                const message = `You already have a booking on products`
                return res.send({ acknowledged: false, message })
            }
            const result = await bookingsCollection.insertOne(bookings);
            console.log(result)
            res.send(result);
        });

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { userEmail: email }
            const bookings = await bookingsCollection.find(query).toArray()
            res.send(bookings)
        })
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = bookingsCollection.deleteOne(filter);
            res.send(result)
        })
        // categories route
        app.get('/categories', async (req, res) => {
            const query = {};
            const categories = await categoriesCollection.find(query).toArray();
            res.send(categories);
        })
        app.get('/products', async (req, res) => {
            const email = req.query.email;
            const query = {email:email};
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        })

        app.get('/categories-products/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { category_id: id };
            const products = await productsCollection.find(query).toArray()
            res.send(products)
        })
// =========== user role ==========
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email}
            console.log(query)
            const user = await usersCollection.findOne(query);
            console.log(user?.rode === 'admin')
            res.send({ isAdmin: user?.rode === "admin"});
        })
        app.get('/users/buyer/:email', async (req,res)=>{
            const email = req.params.email;
            const query = {email: email};
            console.log(query)
            const user = await usersCollection.findOne(query)
            console.log(user?.userName === "Buyer")
            res.send({isBuyer: user?.userName === "Buyer"})
        })        
        app.get('/users/seller/:email', async (req,res)=>{
            const email = req.params.email;
            const query = {email: email};
            console.log(query)
            const user = await usersCollection.findOne(query)
            console.log(user?.userName === "Seller")
            res.send({isSeller: user?.userName === "Seller"})
        })        

    }
    finally {

    }
}
run().catch(console.log);


app.get('/', async (req, res) => {
    res.send('organic food server is running');
})

//organicUser01
//3WnQByWEbxHbWh5C

app.listen(port, () => console.log(`Organic food running on ${port}`))

//${process.env.DB_USER}:${process.env.DB_PASSWORD}