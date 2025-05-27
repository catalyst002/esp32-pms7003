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

function getStatus(value, type) {
  const thresholds = {
    pm1_0: [0, 12, 35, 55],
    pm2_5: [0, 12, 35, 55],
    pm10: [0, 54, 154, 254]
  };
  const labels = ['Good', 'Moderate', 'Unhealthy', 'Very Unhealthy'];
  const classes = ['success', 'warning', 'danger', 'dark'];
  const t = thresholds[type];

  for (let i = t.length - 1; i >= 0; i--) {
    if (value >= t[i]) return { label: labels[i], class: classes[i] };
  }
  return { label: 'Unknown', class: 'secondary' };
}

app.post('/api/data', (req, res) => {
  const { pm1_0, pm2_5, pm10 } = req.body;
  sensorData = {
    pm1_0: pm1_0 || sensorData.pm1_0,
    pm2_5: pm2_5 || sensorData.pm2_5,
    pm10: pm10 || sensorData.pm10,
    timestamp: new Date().toLocaleString()
  };

  historicalData.push(sensorData);
  console.log('Received sensor data:', sensorData);
  res.status(200).json({ message: 'Data received' });
});

app.get('/', (req, res) => {
  const pm1Status = getStatus(sensorData.pm1_0, 'pm1_0');
  const pm25Status = getStatus(sensorData.pm2_5, 'pm2_5');
  const pm10Status = getStatus(sensorData.pm10, 'pm10');

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset='UTF-8'>
      <title>Air Quality Monitor</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
      <style>
        body { background-color: #f8f9fa; }
        .chart-container { margin-top: 30px; }
        .badge { font-size: 1rem; }
      </style>
    </head>
    <body>
      <div class="container mt-5">
        <h1 class="display-4 text-center mb-4">Air Quality Monitor</h1>
        
        <div class="card text-center">
          <div class="card-body">
            <p class="card-text"><strong>PM1.0:</strong> ${sensorData.pm1_0} µg/m³ 
              <span class="badge badge-${pm1Status.class}">${pm1Status.label}</span>
            </p>
            <p class="card-text"><strong>PM2.5:</strong> ${sensorData.pm2_5} µg/m³ 
              <span class="badge badge-${pm25Status.class}">${pm25Status.label}</span>
            </p>
            <p class="card-text"><strong>PM10:</strong> ${sensorData.pm10} µg/m³ 
              <span class="badge badge-${pm10Status.class}">${pm10Status.label}</span>
            </p>
            <p class="card-text"><small class="text-muted">Last update: ${sensorData.timestamp}</small></p>
          </div>
        </div>

        <div class="chart-container">
          <canvas id="airQualityChart" width="400" height="200"></canvas>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script>
        const historicalData = ${JSON.stringify(historicalData)};
        const labels = historicalData.map(data => data.timestamp);
        const pm1_0Data = historicalData.map(data => data.pm1_0);
        const pm2_5Data = historicalData.map(data => data.pm2_5);
        const pm10Data = historicalData.map(data => data.pm10);

        const ctx1 = document.getElementById('airQualityChart').getContext('2d');
        const airQualityChart = new Chart(ctx1, {
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
                  text: 'Concentration (µg/m³)'
                }
              }
            }
          }
        });
      </script>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
