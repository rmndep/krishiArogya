require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/predict', async (req, res) => {
  try {
    const mlResponse = await axios.post(
      'http://localhost:8000/predict',
      req.body,
    );

    res.json(mlResponse.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error communicating with ML service' });
  }
});

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});
