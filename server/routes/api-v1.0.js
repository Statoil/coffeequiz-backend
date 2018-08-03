const express = require('express');
const router = express.Router();
const mongo = require("../mongoAPI");
const azure = require("../fileStorage");
const logger = require("../logger");
const isAzure = process.env.BLOB_URL || false;
const multer  = require('multer');
const upload = multer({ dest: 'server/uploads/' });
const _ = require('lodash');


router.all('/*', (req, res, next) => {
    if (isAzure && !req.get('X-MS-CLIENT-PRINCIPAL-NAME')) {
        res.status(401).send({error: 'Unauthorized'});
    }
    next();
});

// --------------------------- QUIZ ----------------------------------

router.get('/quiz', (req, res) => {
    mongo.getAllQuizes()
        .then(quizData => res.send(quizData));
});

router.get('/quiz/notcompleted', (req, res) => {
    mongo.getNotCompletedQuizes()
        .then(quizData => res.send(quizData));
});

router.get('/quiz/:id', (req, res) => {
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

router.get('/quiz/:id/items', (req, res) => {
    const id = req.params.id;
    mongo.getQuizItems(id)
        .then(quiz => {
            res.send(quiz ? quiz : {})
        });
});

//TODO: Separate create & update quiz endpoints
router.put('/quiz', (req, res) => {
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

router.delete('/quiz/:id', (req, res) => {
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

//TODO: Add quizId to url
router.post('/quiz/response', (req, res) => {
    const quizResponse = req.body;
    quizResponse.timestamp = new Date();
    logger.debug("quiz response: ", quizResponse);
    mongo.saveQuizResponse(quizResponse);
    res.send({});
});

router.post('/quiz/:id/image', upload.single('imageFile'), (req, res) => {
    const imageFile = req.file;
    saveImage(req.params.id, req.body.quizItemId, imageFile)
        .then(imageUrl => res.send({imageUrl}))
        .catch(error => {
            logger.error("Error when uploading image: " + error);
            res.status(500).send(error);
        });
});

function saveImage(quizId, quizItemId, imageFile) {
    if (isAzure) {
        return azure.saveImage(quizId, quizItemId, imageFile);
    }
    return azure.saveImageFileSystem(quizId, quizItemId, imageFile);
}

router.get('/quiz/:quizId/responses', (req, res) => {
    mongo.getStatistics(req.params.quizId)
        .then(response => res.send(response));
});

//Endpoint to mark completed quizes

//TODO: change to put
router.get('/quiz/complete', (req, res) => {
    mongo.markComplete()
        .then(() => res.send('ok'))
        .catch(error => {
            logger.error("Error when marking quizzes complete: " + error);
            res.status(500).send(error);
        });
});

// ------------------------- GENERAL --------------------------

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


router.get('/publicholidays', (req, res) => {
    mongo.getPublicHolidays()
        .then(publicHolidays => res.send(publicHolidays));
});


router.use((req, res) => {
    logger.error("Non existing API route: " + req.originalUrl);
    res.status(400).send({error: "Bad request"});
});



module.exports = router;