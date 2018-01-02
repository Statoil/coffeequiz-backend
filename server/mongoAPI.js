"use strict";

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const logger = require('./logger');
const ObjectId = require('mongodb').ObjectId;

const url = process.env.DB_URL || 'mongodb://localhost:27018/statoilquiz';
let db;

function connect() {
    return MongoClient.connect(url)
        .then(database => {
            logger.info("Connected to " + url);
            db = database;
        });
}

function saveQuizResponse(quizResponse) {
    db.collection('quizResponse').insertOne(quizResponse, (err, r) => {
        assert.notEqual(db, undefined);
        assert.equal(null, err);
        assert.equal(1, r.insertedCount);
        logger.debug("Document inserted successfully", quizResponse);
    });
}

function getQuizData() {
    return db.collection('quiz').find().toArray()
        .then(quizData => quizData.map(quiz => {
            let startTime = findQuizTimeExtent(quiz.quizItems, Math.min);
            let endTime = findQuizTimeExtent(quiz.quizItems, Math.max);
            return {
                id: quiz._id,
                name: quiz.name,
                startTime: startTime,
                endTime: endTime,
                numberOfItems: quiz.quizItems ? quiz.quizItems.length : 0,
                createdBy: quiz.createdBy
            }
        }));
}

function getQuiz(id) {
    return db.collection('quiz').findOne({"_id": ObjectId(id)})
}

function saveQuiz(quiz) {
    const criteria = {_id: ObjectId(quiz._id)};
    quiz.quizItems.forEach(quizItem => {
        if (quizItem.imageId) {
            const imageObjId = ObjectId(quizItem.imageId);
            db.collection('image').deleteMany({
                _id: {$ne: imageObjId},
                quizId: quiz._id,
                quizItemId: quizItem.quizItemId
            }); //clean up unsaved, uploaded images
        }
    });
    quiz._id = ObjectId(quiz._id);
    return db.collection('quiz').updateOne(criteria, quiz)
        .then(() => quiz);
}

function saveImage(quizId, quizItemId, imageData) {
    const document = {quizId, quizItemId, imageData};
    return db.collection('image').insertOne(document)
        .then(writeResult => writeResult.insertedId.toHexString())
    .catch(errorHandler);
}

function getImage(imageId) {
    const criteria = ObjectId(imageId);
    return db.collection('image').findOne(criteria)
        .catch(error => logger.error(error));
}

function findQuizTimeExtent(quizData, minMax) {
    const initialValue = quizData.length > 0 ? new Date(quizData[0].startTime).getTime() : null;
    const timeValue = quizData
        .map(item => item.startTime)
        .reduce(
            (acc, curr) => minMax(acc, new Date(curr).getTime()),
            initialValue);
    return new Date(timeValue);
}

function errorHandler(error) {
    if (!error) {
        return;
    }
    logger.error(error);
}


const mongoAPI = {
    connect: connect,
    saveQuizResponse: saveQuizResponse,
    getQuizData: getQuizData,
    getQuiz: getQuiz,
    saveQuiz: saveQuiz,
    saveImage: saveImage,
    getImage: getImage
};

module.exports = mongoAPI;

