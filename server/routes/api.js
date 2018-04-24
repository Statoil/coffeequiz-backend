const express = require('express');
const router = express.Router();
const mongo = require("../mongoAPI");
const azure = require("../fileStorage");
const logger = require("../logger");
const isAzure = process.env.BLOB_URL || false;
const multer  = require('multer');
const upload = multer({ dest: 'server/uploads/' });
const _ = require('lodash');

mongo.connect()
    .then(() => {

        router.all('/auth/*', (req, res, next) => {
            if (isAzure && !req.get('X-MS-CLIENT-PRINCIPAL-NAME')) {
                res.status(401).send({error: 'Unauthorized'});
            }
            next();
        });

        router.post('/quiz-response', (req, res) => {
            const quizResponse = req.body;
            quizResponse.timestamp = new Date();
            logger.debug("quiz response: ", quizResponse);
            mongo.saveQuizResponse(quizResponse);
            res.send({});
        });

        router.get('/quizes', (req, res) => {
            mongo.getQuizesForApp()
                .then(quizData => res.send(quizData));
        });

        router.get('/quiz/:id', (req, res) => {
            const id = req.params.id;
            mongo.getQuizItems(id)
                .then(quiz => {
                    res.send(quiz ? quiz : {})
                });
        });

        router.get('/userinfo', (req, res) => {
            let userId = getUserIdFromRequest(req);
            const isAuthenticated = !_.isNil(userId) || !isAzure;
            const loginUrl = process.env.LOGIN_URL;
            res.send({userId, isAuthenticated, loginUrl});
        });

        function getUserIdFromRequest(req) {
            let principalName = req.get('X-MS-CLIENT-PRINCIPAL-NAME');
            return principalName ? principalName.split('@')[0] : null;
        }

        router.get('/auth/quizes', (req, res) => {
            mongo.getQuizes()
                .then(quizData => res.send(quizData));
        });

        router.get('/auth/quiz/:id', (req, res) => {
            const id = req.params.id;
            mongo.getQuiz(id)
                .then(quiz => {
                    res.send(quiz ? quiz : {})
                })
                .catch((error) => {
                    logger.error("Error when getting quiz: " + error);
                    res.status(500).send(error);
                });
        });

        router.get('/auth/publicholidays', (req, res) => {
            mongo.getPublicHolidays()
                .then(publicHolidays => res.send(publicHolidays));
        });

        router.delete('/auth/quiz/:id', (req, res) => {
            const id = req.params.id;
            mongo.deleteQuiz(id)
                .then(() => {
                    res.status(200).send({ok: true});
                })
                .catch((error) => {
                    logger.error("Error when deleting quiz: " + error);
                    res.status(500).send(error);
                });
        });


        router.put('/auth/quiz', (req, res) => {
            saveQuiz(req.body, getUserIdFromRequest(req))
                .then(quizId => mongo.getQuiz(quizId))
                .then(quiz => res.send(quiz))
                .catch(error => {
                    logger.error("Error when saving quiz: " + error);
                    res.status(500).send(error);
                })
        });

        function saveQuiz(quiz, userId) {
            if (!quiz._id) {
                quiz.createdBy = userId;
                logger.info(`User ${userId} creating new quiz: "${quiz.name}"`);
                return mongo.createQuiz(quiz);
            }
            return mongo.saveQuiz(quiz);
        }

        router.post('/auth/quiz/image', upload.single('imageFile'), (req, res) => {
            const imageFile = req.file;
            saveImage(req.body.quizId, req.body.quizItemId, req.body.fileType, imageFile)
                .then(imageUrl => res.send({imageUrl}))
                .catch(error => {
                    logger.error("Error when uploading image: " + error);
                    res.status(500).send(error);
                });
        });

        function saveImage(quizId, quizItemId, fileType, imageFile) {
            if (isAzure) {
                return azure.saveImage(quizId, quizItemId, fileType, imageFile);
            }
            return azure.saveImageFileSystem(quizId, quizItemId, fileType, imageFile);
        }

        router.get('/auth/stats/:quizId', (req, res) => {
            mongo.getStatistics(req.params.quizId)
                .then(response => res.send(response));
        });

        router.use((req, res) => {
            logger.error("Non existing API route: " + req.originalUrl);
            res.status(400).send({error: "Bad request"});
        });

    })
    .catch(error => {
        logger.error(error);
        process.exit();
    });


module.exports = router;