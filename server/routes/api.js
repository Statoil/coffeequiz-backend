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
            mongo.saveQuiz(req.body)
                .then(quizId => res.send({_id: quizId}))
                .catch(error => {
                    logger.error("Error when saving quiz: " + error);
                    res.status(500).send(error);
                })
        });

        router.post('/quiz/file', (req, res) => {
            const imageDocument = req.body;
            const imageData = imageDocument.encodedFile.split(',')[1];
            const fileType = imageDocument.fileType;
            const buffer = new Buffer(imageData, 'base64');
            mongo.saveImage(imageDocument.quizId, imageDocument.quizItemId, buffer, fileType)
                .then(imageId => {
                    if (!imageId) {
                        res.sendStatus(500);
                    }
                    res.send({imageId});
                });
        });

        router.get('/quiz/file/:imageId', (req, res) => {
            if (!req.params.imageId || req.params.imageId === "null" || req.params.imageId === "undefined") {
                res.sendStatus(404);
            }
            else {
                mongo.getImage(req.params.imageId)
                    .then(imageDocument => {
                        if (!imageDocument) {
                            res.sendStatus(404);
                        }
                        res.type(imageDocument.fileType);
                        res.send(imageDocument.imageData.buffer);
                    });
            }
        });

    })
    .catch(error => {
        logger.error(error);
        process.exit();
    });


module.exports = router;