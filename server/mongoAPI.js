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

function updateQuiz(quiz) {
    quiz._id = ObjectId(quiz._id);
    const criteria = {_id: ObjectId(quiz._id)};
    quiz.quizItems.forEach((quizItem, index) => quizItem.quizItemId = index);
    db.collection('quiz').updateOne(criteria, quiz); //todo: use promise
    return Promise.resolve(quiz);
}

function updateImageInQuizItem(quizId, quizItemId, imageId) {
    return getQuiz(quizId)
        .then(quiz => {
            const quizItem = quiz.quizItems.find(quizItem => quizItem.quizItemId === quizItemId);
            quizItem.imageId = imageId;
            return updateQuiz(quiz);
        })
}

function saveImage(quizId, quizItemId, imageData) {
    const criteria = {quizId, quizItemId};
    const document = {quizId, quizItemId, imageData};
    return db.collection('image').deleteMany(criteria)
        .then(() => {
            return db.collection('image').insertOne(document)
                .then(writeResult => {
                    const insertedId = writeResult.insertedId.toHexString();
                    updateImageInQuizItem(quizId, quizItemId, insertedId);
                    return insertedId;
                });
        })
        .catch(errorHandler);
}

function getImage(imageId) {
    const criteria = ObjectId(imageId);
    return db.collection('image').findOne(criteria);
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
    updateQuiz: updateQuiz,
    saveImage: saveImage,
    getImage: getImage
};

module.exports = mongoAPI;

