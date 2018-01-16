"use strict";

const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const logger = require("./logger");
const cors = require('cors');
const api = require('./routes/api');
const http = require("http");

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../dist')));
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}));
app.use(bodyParser.json({limit: '10mb'}));
app.use(cors());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/api', api);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const server = http.createServer(app);
server.listen(port,
    () => logger.info(`CoffeServer is running on ${port}`));

