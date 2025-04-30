const express = require('express');
const app = express();
const PORT = 80;

app.get('/', (req, res) => {
  res.send('hello world');
});

app.get('/health', (req, res) => {
  res.status(200).send('ok');
});

app.listen(PORT, () => {
  console.log(`Minimal service listening on port ${PORT}`);
});