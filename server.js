const express = require('express');
const {MongoClient, ObjectId} = require('mongodb');

const cors = require('cors'); // Import the cors package

const router = express

const app = express();

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



// MongoDB connection URI
const uri = 'mongodb+srv://larssonandreas11:Hammarby1@cluster0.yha3nfs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Database Name
const dbName = 'Natbutiken'; // Update with your database name

//currency 
const dailyPriceSek = 10

function hanterPricSprak (data, req) {
  const currency = req.query.currency;
  data.forEach((item) => {
    if(currency ==="se")
      {
        item.currency = "SEK"
        item.price *= dailyPriceSek
        item.sale_price *= dailyPriceSek
        item.variations.forEach(attributes => {
        if(attributes.price) {
          attributes.price *= dailyPriceSek
        }
      })
      
    }else {
        item.currency = "EUR"
    }})

    return data 
}



app.get('/produkt/:param', async (req, res) => {
  const produktNamn = req.params.param;
  

  try {
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    // Connect to the MongoDB server

    const collectionName = 'Produkter'; // Update with your collection name
    // Fetch data from the collection
    const collection = db.collection(collectionName);

    const data = await collection.findOne({ _id: new ObjectId(produktNamn) });

    // Close the connection
    client.close();

    //currency
  const filterData = data
    if(req.query.currency === "se")
    {
      filterData.price *= dailyPriceSek
      filterData.sale_price *= dailyPriceSek
      filterData.variations.forEach(attributes => {
      if(attributes.price) {
        attributes.price *= dailyPriceSek
      }
    });
    }

    // Send the data as a response
    res.json(filterData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.get('/products', async (req, res) => {

  try {
  
 const client = await MongoClient.connect(uri);
    const db = client.db(dbName);

    const collectionName = 'Produkter'; // Update with your collection name
    // Hämta data från samlingen baserat på söksträngen (om det behövs)
    const collection = db.collection(collectionName);
    
    const data = await collection.find({}).toArray();

    
    // Stäng anslutningen
    client.close();



    const dataSend = hanterPricSprak(data, req)

    // Send the data as a response
    res.json(dataSend);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

/* Search */

app.get('/search', async (req, res) => {
  const produktNamn = req.query;
  try {
  
 const client = await MongoClient.connect(uri);
    const db = client.db(dbName);

    const collectionName = 'Produkter'; // Update with your collection name
    // Hämta data från samlingen baserat på söksträngen (om det behövs)
    const collection = db.collection(collectionName);
    
    const searchText = produktNamn.text; // Extract the string value from the object
    const data = await collection.find({ name: { $regex: searchText, $options: 'i' } }).toArray();
    

    // Stäng anslutningen
    client.close();



    const dataSend = hanterPricSprak(data, req)
console.log(dataSend)
    // Send the data as a response
    res.json(dataSend);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/katergorier', async (req, res) => {
  try {
    // Connect to the MongoDB server
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);


    const collectionName = 'Kategorier'; // Update with your collection name
    // Fetch data from the collection
    const collection = db.collection(collectionName);
    const data = await collection.find({}).toArray();
    // Close the connection
    client.close();

    // Send the data as a response
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/nyaProdukter', async (req, res) => {

  try {
    // Connect to the MongoDB server
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);

    const collectionName = 'Produkter'; // Update with your collection name
    // Fetch data from the collection
    const collection = db.collection(collectionName);
    const latestDocuments = await collection.find({})
    .sort({ date: -1 }) // Sort documents by dateField in descending order
    .limit(10) // Limit the result to 10 documents
    .toArray();
    // Close the connection
    client.close();
    const dataSend = hanterPricSprak(latestDocuments, req)

    // Send the data as a response
    res.json(dataSend);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/saleProdukter', async (req, res) => {

  try {
    // Connect to the MongoDB server
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);


    const collectionName = 'Produkter'; // Update with your collection name
    // Fetch data from the collection
    const collection = db.collection(collectionName);
    const data = await collection.find({}).toArray();

    // Close the connection
    client.close();

    
  const dataSend = hanterPricSprak(data, req)

  // Send the data as a response
  res.json(dataSend);

    // Send the data as a response
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/brands', async (req, res) => {
  try {
    // Connect to the MongoDB server
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);


    const collectionName = 'Brands'; // Update with your collection name
    // Fetch data from the collection
    const collection = db.collection(collectionName);
    const data = await collection.find({}).toArray();

    // Close the connection
    client.close();

    // Send the data as a response
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/flashSale', async (req, res) => {
  try {
    // Connect to the MongoDB server
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);


    const collectionName = 'Produkter'; // Update with your collection name
    // Fetch data from the collection
    const collection = db.collection(collectionName);
    const data = await collection.find({}).toArray();

    // Close the connection
    client.close();

  const dataSend = hanterPricSprak(data, req)

    // Send the data as a response
    res.json(dataSend);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/featured', async (req, res) => {
  try {
    // Connect to the MongoDB server
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);


    const collectionName = 'Produkter'; // Update with your collection name
    // Fetch data from the collection
    const collection = db.collection(collectionName);
   
    const featured = await collection.find({
      featured: { $ne: false }
    })
    .sort({ date: -1 }) // Sort documents by dateField in descending order
    .limit(10) // Limit the result to 10 documents
    .toArray();
    // Close the connection
    client.close();

    
  const dataSend = hanterPricSprak(featured, req)
  // Send the data as a response
  res.json(dataSend);
    

    // Send the data as a response
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/nyhetsbrev', async (req, res) => {
  const subscription_email = req.body.subscription_email;

  try {
      // Connect to the MongoDB server
      const client = await MongoClient.connect(uri);
      const db = client.db(dbName);

      // Get the newsletter collection
      const collection = db.collection('newsletter');

      // Insert the email into the newsletter collection
      await collection.insertOne({ email: subscription_email });

      // Close the connection
      client.close();

      // Send a success response
      res.status(200).send('Email subscription successful!');
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
  }
});


app.post('/support-form', async (req, res) => {
  try {
      // Connect to the MongoDB server
      const client = await MongoClient.connect(uri);
      const db = client.db(dbName);

      // Get the newsletter collection
      const collection = db.collection('support');


      // Insert the email into the newsletter collection
      const supportData = {
        type: req.body.type,
        namn: req.body.name,
        email: req.body.email,
        message: req.body.message
      }

      if(supportData.type === "reklamation"){
        supportData.orderId = req.body.orderId
        supportData.produktNamn = req.body.produktNamn
      }

      await collection.insertOne(supportData);

      // Close the connection
      client.close();

      // Send a success response
      res.status(200).send('Email subscription successful!');
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
  }
});


app.post('/contact-form', async (req, res) => {
  console.log(req.body)
    try {
        // Connect to the MongoDB server
        const client = await MongoClient.connect(uri);
        const db = client.db(dbName);
  
        // Get the newsletter collection
        const collection = db.collection('contact');
  
  
        // Insert the email into the newsletter collection
        const supportData = {
          namn: req.body.name,
          email: req.body.email,
          title: req.body.subject,
          message: req.body.message
        }
  
        await collection.insertOne(supportData);
  
        // Close the connection
        client.close();
  
        // Send a success response
        res.status(200).send('Email subscription successful!');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
  });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
