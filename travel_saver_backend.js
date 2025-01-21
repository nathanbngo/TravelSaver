const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Models
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  savedDestinations: [
    {
      destination: String,
      price: Number,
      currency: String,
    },
  ],
});
const User = mongoose.model('User', UserSchema);

// Routes
app.post('/api/cheaper-destinations', async (req, res) => {
  const { departure, maxBudget } = req.body;
  try {
    const response = await axios.get(
      `https://api.skyscanner.net/apiservices/browsequotes/v1.0/US/USD/en-US/${departure}/anywhere/anytime`,
      { headers: { 'api-key': process.env.FLIGHT_API_KEY } }
    );
    const destinations = response.data.Quotes.filter(
      (quote) => quote.MinPrice <= maxBudget
    ).map((quote) => {
      const destination = response.data.Places.find(
        (place) => place.PlaceId === quote.OutboundLeg.DestinationId
      );
      return {
        destination: destination.Name,
        price: quote.MinPrice,
        currency: response.data.Currencies[0].Symbol,
      };
    });
    res.status(200).json({ destinations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching destinations.' });
  }
});

app.post('/api/users', async (req, res) => {
  const { username, email } = req.body;
  try {
    const newUser = new User({ username, email });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user.' });
  }
});

app.post('/api/users/:username/destinations', async (req, res) => {
  const { username } = req.params;
  const { destination, price, currency } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.savedDestinations.push({ destination, price, currency });
    await user.save();
    res.status(200).json({ message: 'Destination saved successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving destination.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
