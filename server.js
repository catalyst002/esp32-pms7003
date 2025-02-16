const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

let sensorData = {
  pm1_0: 0,
  pm2_5: 0,
  pm10: 0,
  timestamp: new Date().toLocaleString()
};

let historicalData = [];

app.post('/api/data', (req, res) => {
  const { pm1_0, pm2_5, pm10 } = req.body;
  const dataPoint = {
    pm1_0: pm1_0 || sensorData.pm1_0,
    pm2_5: pm2_5 || sensorData.pm2_5,
    pm10: pm10 || sensorData.pm10,
    timestamp: new Date().toLocaleString()
  };

  sensorData = dataPoint;
  
  historicalData.push(dataPoint);

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
      <!-- Bootstrap CSS for a beautiful layout -->
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
        <div class="mt-5">
          <canvas id="airQualityChart" width="400" height="200"></canvas>
        </div>
      </div>
      <!-- Chart.js library -->
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script>
        // Inject historical data from the server
        const historicalData = ${JSON.stringify(historicalData)};

        // Prepare chart labels (timestamps) and data arrays for each sensor value
        const labels = historicalData.map(data => data.timestamp);
        const pm1_0Data = historicalData.map(data => data.pm1_0);
        const pm2_5Data = historicalData.map(data => data.pm2_5);
        const pm10Data = historicalData.map(data => data.pm10);

        // Create the line chart
        const ctx = document.getElementById('airQualityChart').getContext('2d');
        const airQualityChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'PM1.0',
                data: pm1_0Data,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: false
              },
              {
                label: 'PM2.5',
                data: pm2_5Data,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: false
              },
              {
                label: 'PM10',
                data: pm10Data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: false
              }
            ]
          },
          options: {
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Timestamp'
                }
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Concentration (ug/m³)'
                }
              }
            }
          }
        });
      </script>
      <!-- Optional Bootstrap JS and dependencies -->
      <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.2/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});
