const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./travel_saver_backend').User;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    await User.deleteMany({});
    console.log('Cleared existing users.');

    const users = [
      { username: 'nathan', email: 'nathan@example.com', savedDestinations: [] },
    ];

    await User.insertMany(users);
    console.log('Seeded users successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
