const express = require("express");
const app = express();
require("./db/conn");
const bodyParser = require("body-parser")
const Product = require("./model/amazon");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Fetch the JSON from the third party API and initialize the database with seed data. 
app.get("/call", async (req, res) => {
    try {
        let url = `https://s3.amazonaws.com/roxiler.com/product_transaction.json`;
        const response = await fetch(url);
        const data = await response.json();
        for (i = 0; i < data.length; i++) {
            const products = new Product(data[i]);
            const dbb = await products.save();
        }
        res.status(201).send("fetched and save api data successful");
    } catch (error) {
        res.status(400).send(`error in get call ${error}`)
    }
})

//saving with help of post - Not asked but a method
app.post("/call", async (req, res) => {
    try {
        console.log(req.body);
        const products = new Product(req.body);
        const response = await products.save();
        res.status(201).send(response);
    } catch (error) {
        res.status(400).send("error in saving to database");
    }
})


let res1,res2,res3;
// Create an API for statistics
// - Total sale amount of selected month
// - Total number of sold items of selected month
// - Total number of not sold items of selected month
app.get("/data", async (req, res) => {
    try {
        res1 = await Product.aggregate([
            {
                $group: {
                    _id: {
                        month: { $month: "$dateOfSale" },
                    },
                    totalSale: {
                        $sum: "$price",
                    },
                    soldItems: {
                        $sum: {
                            $cond: ["$sold", 1, 0]
                        }
                    },
                    unsoldItems: {
                        $sum: {
                            $cond: ["$sold", 0, 1]
                        }
                    }
                },
            },
            {
                $sort: { "_id.month": 1 }
            }
        ])
        // console.log(res1);
        res.status(200).send("successful data calling");
    } catch (error) {
        res.status(400).send(`error in calling data - ${error}`);
    }
})


// the response should contain price range and the number of
// items in that range for the selected month regardless of the year 
app.get("/bar", async (req, res) => {
    try {
        res2 = await Product.aggregate([
            {
                $addFields: {
                    range: {
                        $switch: {
                            branches: [
                                { case: { $lte: ["$price", 100] }, then: "0-100" },
                                { case: { $lte: ["$price", 200] }, then: "101-200" },
                                { case: { $lte: ["$price", 300] }, then: "201-300" },
                                { case: { $lte: ["$price", 400] }, then: "301-400" },
                                { case: { $lte: ["$price", 500] }, then: "401-500" },
                                { case: { $lte: ["$price", 600] }, then: "501-600" },
                                { case: { $lte: ["$price", 700] }, then: "601-700" },
                                { case: { $lte: ["$price", 800] }, then: "701-800" },
                                { case: { $lte: ["$price", 900] }, then: "801-900" },
                                { case: { $gt: ["$price", 900] }, then: "above 900" },
                            ]
                        }
                    }
                }
            },
            {
                $group:
                {
                    _id: {
                        'range': '$range',
                        'month': { $month: "$dateOfSale" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "count": 1 }
            }
        ])

        // console.log(res2)
        res.status(200).send("successful bar calling");
    } catch (error) {
        res.status(400).send(`error in calling bar - ${error}`);
    }
})

// Create an API for pie chart
// Find unique categories and number of items from that category for the selected month
// regardless of the year.
app.get("/pie", async (req, res) => {
    try {
        res3 = await Product.aggregate([
            {
                $group:
                {
                    _id: {
                        'category': '$category',
                        'month': { $month: "$dateOfSale" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "count": 1 }
            }
        ])

        console.log(res3)
        res.status(200).send("successful pie calling");
    } catch (error) {
        res.status(400).send(`error in calling pie - ${error}`);
    }
})


// GET
// Create an API which fetches the data from all the 3 APIs mentioned above, combines
// the response and sends a final response of the combined JSON
app.get('/multiple', async (req, res) => {
    try {
        const result = await {res1,res2,res3};
        res.status(200).send(result);
    } catch (error) {
        res.status(400).send(`error in calling multiple - ${error}`)
    }
})
    

app.listen(port, () => {
    console.log(`connection successful at ${port}`);
})
