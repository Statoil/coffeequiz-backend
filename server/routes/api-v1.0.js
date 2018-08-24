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
const cache = new NodeCache({stdTTL: 60 * 5}); //Device info cached for 5 minutes

const TOKEN_KEY = 'X-COFFEEQUIZ-TOKEN';
const DEVICE_NAME_KEY = "X-COFFEEQUIZ-DEVICE-NAME";
const DEVICE_ID_KEY = "X-COFFEEQUIZ-DEVICE-ID";


// ******************** Open Endpoints ************************
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

// **************** APP Endpoints ****************************

router.all('/app/*', authenticateApp);

async function authenticateApp(req, res, next) {
    const token = req.get(TOKEN_KEY);
    if (!token) {
        res.status(401).send({error: 'Unauthorized'});
        return;
    }
    let device = cache.get(token);
    if (_.isNil(device)) {
        device = await mongo.getDevice(token);
        if (device) {
            cache.set(token, device);
        }
    }
    if (device) {
        req.headers[DEVICE_NAME_KEY] = device.deviceName;
        req.headers[DEVICE_ID_KEY] = device._id.toString();
        next();
    }
    else {
        res.status(401).send({error: 'Unauthorized'});
    }
}

router.get('/app/quiz/notcompleted', (req, res) => {
    mongo.getNotCompletedQuizes()
        .then(quizData => res.send(quizData));
});


router.post('/app/quiz/:id/response', (req, res) => {
    const quizResponse = req.body;
    quizResponse.quizId = req.params.id;
    quizResponse.timestamp = new Date();
    quizResponse.deviceId = req.headers[DEVICE_ID_KEY];
    quizResponse.deviceName = req.headers[DEVICE_NAME_KEY];
    logger.debug("quiz response: ", quizResponse);
    mongo.saveQuizResponse(quizResponse);
    res.send({});
});

router.get('/app/quiz/:id/items', (req, res) => {
    const id = req.params.id;
    mongo.getQuizItems(id)
        .then(quiz => {
            res.send(quiz ? quiz : {})
        });
});


// **************** Admin Endpoints **************************


router.all('/*', authenticateAzureAD);

//User authenticated in AzureAD
function authenticateAzureAD(req, res, next) {
    if (!isAzure || !_.isNil(req.get('X-MS-CLIENT-PRINCIPAL-NAME'))) {
        next();
    }
    else {
        res.status(401).send({error: 'Unauthorized'});
    }
}

// --------------------------- QUIZ ----------------------------------

router.get('/quiz', (req, res) => {
    mongo.getAllQuizes()
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



//Update quiz
router.put('/quiz/:id', (req, res) => {
    const quizId = req.params.id;
    const quiz = req.body;
    if (quizId !== quiz._id) {
        const errorMsg = `Integrity check fail - mismatch in url quizId(${quizId}) and object quizId(${quiz._id})`;
        logger.error(errorMsg);
        res.status(500).send({error: errorMsg});
    }
    else {
        quiz.createdBy = getUserIdFromRequest(req);
        mongo.saveQuiz(quiz)
            .then(quizId => mongo.getQuiz(quizId))
            .then(quiz => res.send(quiz))
            .catch(error => {
                logger.error("Error when updating quiz: " + error);
                res.status(500).send(error);
            })
    }
});

//Create quiz
router.post('/quiz', (req, res) => {
    const userId = getUserIdFromRequest(req);
    const quiz = req.body;
    quiz.createdBy = userId;
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
    mongo.getResponses(req.params.quizId)
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

router.get('/publicholidays', (req, res) => {
    mongo.getPublicHolidays()
        .then(publicHolidays => res.send(publicHolidays));
});


router.use((req, res) => {
    logger.error(`Non existing API route: ${req.method} ${req.originalUrl}`);
    res.status(400).send({error: "Bad request"});
});


module.exports = router;