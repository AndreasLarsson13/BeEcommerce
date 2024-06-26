const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors'); // Import the cors package

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies



app.use(cors());

// Your MongoDB URI and database name
const uri = 'mongodb+srv://larssonandreas11:Hammarby1@cluster0.yha3nfs.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'Natbutiken';

// Helper function for currency conversion
const dailyPriceSek = 10;

function handlePriceLanguage(data, req) {
  const currency = req.query.currency;
  data.forEach((item) => {
    if (currency === "se") {
      item.currency = "SEK";
      item.price *= dailyPriceSek;
      item.sale_price *= dailyPriceSek;
      item.variations.forEach(attributes => {
        if (attributes.price) {
          attributes.price *= dailyPriceSek;
        }
      });
    } else {
      item.currency = "EUR";
    }
  });

  return data;
}

// Middleware function to handle CORS and requests
const allowCorsMiddleware = fn => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Route to fetch a specific product
app.get('/produkt/:param', allowCorsMiddleware(async (req, res) => {
  const produktNamn = req.params.param;

  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  const collectionName = 'Produkter';
  const collection = db.collection(collectionName);

  const data = await collection.findOne({ _id: new ObjectId(produktNamn) });

  client.close();

  const filteredData = handlePriceLanguage([data], req);

  res.json(filteredData[0]);
}));

// Route to fetch all products
app.get('/products', allowCorsMiddleware(async (req, res) => {
  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  const collectionName = 'Produkter';
  const collection = db.collection(collectionName);

  const data = await collection.find({}).toArray();

  client.close();

  const filteredData = handlePriceLanguage(data, req);

  res.json(filteredData);
}));

// Route for search functionality
app.get('/search', allowCorsMiddleware(async (req, res) => {
  const searchText = req.query.text; // Extract the string value from the query object

  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  const collectionName = 'Produkter'; // Update with your collection name
  const collection = db.collection(collectionName);

  const data = await collection.find({ name: { $regex: searchText, $options: 'i' } }).toArray();

  client.close();

  const filteredData = handlePriceLanguage(data, req);

  res.json(filteredData);
}));

// Route to fetch categories
app.get('/kategorier', allowCorsMiddleware(async (req, res) => {
  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  const collectionName = 'Kategorier';
  const collection = db.collection(collectionName);

  const data = await collection.find({}).toArray();

  client.close();

  res.json(data);
}));

// Route to fetch latest products
app.get('/nyaProdukter', allowCorsMiddleware(async (req, res) => {
  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  const collectionName = 'Produkter';
  const collection = db.collection(collectionName);

  const latestDocuments = await collection.find({})
    .sort({ date: -1 }) // Sort documents by dateField in descending order
    .limit(10) // Limit the result to 10 documents
    .toArray();

  client.close();

  const filteredData = handlePriceLanguage(latestDocuments, req);

  res.json(filteredData);
}));

// Route to fetch sale products
app.get('/saleProdukter', allowCorsMiddleware(async (req, res) => {
  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  const collectionName = 'Produkter';
  const collection = db.collection(collectionName);

  const data = await collection.find({}).toArray();

  client.close();

  const filteredData = handlePriceLanguage(data, req);

  res.json(filteredData);
}));

// Route to fetch brands
app.get('/brands', allowCorsMiddleware(async (req, res) => {
  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  const collectionName = 'Brands';
  const collection = db.collection(collectionName);

  const data = await collection.find({}).toArray();

  client.close();

  res.json(data);
}));

// Route to fetch flash sale products
app.get('/flashSale', allowCorsMiddleware(async (req, res) => {
  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  const collectionName = 'Produkter';
  const collection = db.collection(collectionName);

  const data = await collection.find({}).toArray();

  client.close();

  const filteredData = handlePriceLanguage(data, req);

  res.json(filteredData);
}));

// Route to fetch featured products
app.get('/featured', allowCorsMiddleware(async (req, res) => {
  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  const collectionName = 'Produkter';
  const collection = db.collection(collectionName);

  const featured = await collection.find({
    featured: { $ne: false }
  })
    .sort({ date: -1 }) // Sort documents by dateField in descending order
    .limit(10) // Limit the result to 10 documents
    .toArray();

  client.close();

  const filteredData = handlePriceLanguage(featured, req);

  res.json(filteredData);
}));

// Route to handle newsletter subscriptions
app.post('/nyhetsbrev', allowCorsMiddleware(async (req, res) => {
  const subscription_email = req.body.subscription_email;

  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  const collection = db.collection('newsletter');

  await collection.insertOne({ email: subscription_email });

  client.close();

  res.status(200).send('Email subscription successful!');
}));

// Route to handle support form submissions
app.post('/support-form', allowCorsMiddleware(async (req, res) => {
  const supportData = {
    type: req.body.type,
    namn: req.body.name,
    email: req.body.email,
    message: req.body.message,
  };

  if (supportData.type === "reklamation") {
    supportData.orderId = req.body.orderId;
    supportData.produktNamn = req.body.produktNamn;
  }

  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  const collection = db.collection('support');

  await collection.insertOne(supportData);

  client.close();

  res.status(200).send('Support form submission successful!');
}));

// Route to handle contact form submissions
app.post('/contact-form', allowCorsMiddleware(async (req, res) => {
  const contactData = {
    namn: req.body.name,
    email: req.body.email,
    title: req.body.subject,
    message: req.body.message,
  };

  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  const collection = db.collection('contact');

  await collection.insertOne(contactData);

  client.close();

  res.status(200).send('Contact form submission successful!');
}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
