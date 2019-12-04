"use strict";

const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const logger = require("./logger");
const cors = require('cors');
const api = require('./routes/api');
const api_v1_0 = require('./routes/api-v1.0');
const http = require("http");
const mongo = require("./mongoAPI");

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../dist')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}));
app.use(bodyParser.json({limit: '10mb'}));
app.use(cors());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

mongo.connect();
app.use(errorHandler);
app.all('*', logRequest)
app.use('/api/v1.0', api_v1_0);
app.use('/api', api);

app.get('/ie', (req, res) => res.sendFile(path.join(__dirname, '../dist/internet-explorer.html')));
app.get('/noaccess', (req, res) => res.sendFile(path.join(__dirname, '../dist/no-access.html')));
app.get('/terms', (req, res) => res.sendFile(path.join(__dirname, '../dist/terms.html')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));

function errorHandler (err, req, res, next) {
    logger.error(err.stack);
    if (res.headersSent) {
        return next(err)
    }
    res.status(500).send(err.stack);
}

function logRequest(req, res, next) {
    let payloadLog = '';
    if (Object.keys(req.body).length > 0) {
        payloadLog = 'Payload: ' + JSON.stringify(req.body);
    }
    logger.debug(`${req.method} ${req.url} ${payloadLog}`);
    next();
}

const server = http.createServer(app);
server.listen(port,
    () => logger.info(`CoffeServer is running on ${port}`));

