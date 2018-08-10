const express = require('express');
const router = express.Router();
const mongo = require("../mongoAPI");
const azure = require("../fileStorage");
const logger = require("../logger");
const isAzure = process.env.BLOB_URL || false;
const multer  = require('multer');
const upload = multer({ dest: 'server/uploads/' });
const _ = require('lodash');
const NodeCache = require( "node-cache" );
const cache = new NodeCache({stdTTL: 3600 * 6});


router.all('/*', authenticate);

async function authenticate(req, res, next) {
    if (isAzure && (!authenticateAzureAD(req) && !await authenticateHeader(req))) {
        res.status(401).send({error: 'Unauthorized'});
    }
    else {
        next();
    }
}

//User authenticated in AzureAD
function authenticateAzureAD(request) {
    return request.get('X-MS-CLIENT-PRINCIPAL-NAME');
}

//Client provides secret in header
async function authenticateHeader(request) {
    const token = request.get('X-COFFEEQUIZ-TOKEN');
    if (!token) {
        return false;
    }
    let isValid = cache.get(token);
    if (isValid === undefined) {
        isValid = await validateToken(token);
        cache.set(token, isValid);
    }
    return isValid;
}

async function validateToken(token) {
    // noinspection UnnecessaryLocalVariableJS
    const hash = token;
    let device = await mongo.getDevice(hash);
    return (!_.isNil(device) && device.deviceName);
}


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

//Update quiz
router.put('/quiz/:id', (req, res) => {
    const quizId = req.params.id;
    const quiz = req.body;
    if (quizId !== quiz.id) {
        const errorMsg = `Integrity check fail - mismatch in url quizId(${quizId}) and object quizId(${quiz.id})`;
        logger.error(errorMsg);
        res.status(500).send({error: errorMsg});
    }
    mongo.saveQuiz(quiz)
        .then(quiz => res.send(quiz))
        .catch(error => {
            logger.error("Error when updating quiz: " + error);
            res.status(500).send(error);
        })
});

//Create quiz
router.post('/quiz', (req, res) => {
    const userId = getUserIdFromRequest(req);
    const quiz = req.body;
    logger.info(`User ${userId} creating new quiz: "${quiz.name}"`);
    mongo.createQuiz(quiz)
        .then(quizId => mongo.getQuiz(quizId))
        .then(quiz => res.send(quiz))
        .catch(error => {
            logger.error("Error when creating quiz: " + error);
            res.status(500).send(error);
        });
});

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

router.post('/quiz/:id/response', (req, res) => {
    const quizResponse = req.body;
    quizResponse.quizId = req.params.id;
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