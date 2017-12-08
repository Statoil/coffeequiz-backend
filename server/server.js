"use strict";

const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const logger = require("./logger");
const mongo = require("./mongoAPI");
const cors = require('cors');

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../www')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/api/response', (req, res) => {
  const quizResponse = req.body;
  quizResponse.timestamp = new Date();
  logger.info("quiz response: ", quizResponse);
  mongo.saveQuizResponse(quizResponse);
  res.send({});
});

app.get('/api/quizdata', (req, res) => {
  mongo.getQuizData()
    .then(quizData => res.send(quizData));
});

mongo.connect()
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        return logger.error('An error occurred', err);
      }
      logger.info(`server is listening on ${port}`);
    });
  })
  .catch(error => logger.error(error));
