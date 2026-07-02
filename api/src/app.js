const express = require('express');
const webhookRouter = require('./routes/webhook');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'Clínica Sorria Mais API' }));

app.use('/webhook', webhookRouter);

module.exports = app;
