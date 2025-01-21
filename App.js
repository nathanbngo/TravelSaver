import React, { useState } from 'react';
import axios from 'axios';
import './styles.css';

function App() {
  const [departure, setDeparture] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  const fetchDestinations = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/cheaper-destinations', {
        departure,
        maxBudget: parseInt(maxBudget, 10),
      });
      setDestinations(response.data.destinations);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const saveUser = async () => {
    try {
      await axios.post('http://localhost:3000/api/users', { username, email });
      setSavedMessage('User created successfully!');
    } catch (error) {
      console.error('Error saving user:', error);
      setSavedMessage('Failed to create user.');
    }
  };

  const saveDestination = async (destination) => {
    try {
      await axios.post(`http://localhost:3000/api/users/${username}/destinations`, destination);
      alert('Destination saved successfully!');
    } catch (error) {
      console.error('Error saving destination:', error);
      alert('Failed to save destination.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>TravelSaver</h1>
      </header>

      <section className="section">
        <h2>Find Cheaper Destinations</h2>
        <input
          type="text"
          placeholder="Enter departure location"
          value={departure}
          onChange={(e) => setDeparture(e.target.value)}
        />
        <input
          type="number"
          placeholder="Enter max budget"
          value={maxBudget}
          onChange={(e) => setMaxBudget(e.target.value)}
        />
        <button onClick={fetchDestinations}>Search</button>

        <div>
          <h3>Available Destinations:</h3>
          <ul className="destination-list">
            {destinations.map((dest, index) => (
              <li key={index} className="destination-item">
                <p>
                  Destination: {dest.destination} | Price: {dest.currency}{dest.price}
                </p>
                <button onClick={() => saveDestination(dest)}>Save</button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <h2>Create User</h2>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={saveUser}>Create User</button>
        <p className="message">{savedMessage}</p>
      </section>
    </div>
  );
}

export default App;
