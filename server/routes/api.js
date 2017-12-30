const express = require('express');
const router = express.Router();
const mongo = require("../mongoAPI");
const logger = require("../logger");

mongo.connect()
    .then(() => {
        router.post('/quizResponse', (req, res) => {
            const quizResponse = req.body;
            quizResponse.timestamp = new Date();
            logger.info("quiz response: ", quizResponse);
            mongo.saveQuizResponse(quizResponse);
            res.send({});
        });

        router.get('/quizes', (req, res) => {
            mongo.getQuizData()
                .then(quizData => res.send(quizData));
        });

        router.get('/quiz/:id', (req, res) => {
            const id = req.params.id;
            mongo.getQuiz(id)
                .then(quiz => {
                    res.send(quiz ? quiz : {})
                });
        });

        router.put('/quiz/:id', (req, res) => {
            mongo.updateQuiz(req.body);
            res.send({});
        });

        router.delete('/quiz/:quizId/quizItem/:quizItemId', (req, res) => {
            const quizId = req.params.quizId;
            const quizItemId = req.params.quizItemId;
            logger.info(`quizId: ${quizId}. quizItemId: ${quizItemId}`);
        });

    })
    .catch(error => {
        logger.error(error);
        process.exit();
    });


module.exports = router;