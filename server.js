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
    </head>
    <body>
      <h1>Air Quality Monitor</h1>
      <p>PM1.0: ${sensorData.pm1_0} ug/m3</p>
      <p>PM2.5: ${sensorData.pm2_5} ug/m3</p>
      <p>PM10: ${sensorData.pm10} ug/m3</p>
      <p>Last update: ${sensorData.timestamp}</p>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
