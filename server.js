const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

let sensorData = {
  pm1_0: 0,
  pm2_5: 0,
  pm10: 0
};

app.post('/api/data', (req, res) => {
  const { pm1_0, pm2_5, pm10 } = req.body;
  sensorData = {
    pm1_0: pm1_0 || sensorData.pm1_0,
    pm2_5: pm2_5 || sensorData.pm2_5,
    pm10: pm10 || sensorData.pm10,
    timestamp: new Date().toLocaleString()
  };
  console.log('Received sensor data:', sensorData);
  res.status(200).json({ message: 'Data received' });
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset='UTF-8'>
      <title>Air Quality Monitor</title>
      <!-- Bootstrap CSS -->
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
      <style>
        body {
          background-color: #f8f9fa;
        }
        .card {
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container mt-5">
        <h1 class="display-4 text-center mb-4">Air Quality Monitor</h1>
        <div class="card text-center">
          <div class="card-body">
            <p class="card-text"><strong>PM1.0:</strong> ${sensorData.pm1_0} ug/m³</p>
            <p class="card-text"><strong>PM2.5:</strong> ${sensorData.pm2_5} ug/m³</p>
            <p class="card-text"><strong>PM10:</strong> ${sensorData.pm10} ug/m³</p>
            <p class="card-text"><small class="text-muted">Last update: ${sensorData.timestamp || 'N/A'}</small></p>
          </div>
        </div>
      </div>
      <!-- Optional Bootstrap JS and dependencies -->
      <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.2/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
