"use strict";

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const logger = require('./logger');
const ObjectId = require('mongodb').ObjectId;
const moment = require('moment');

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

function getWeekDay(date) {
    return (moment(date).day() + 6) % 7;
}

function getEndDate(quiz) {
    if (!quiz || !quiz.quizItems || quiz.quizItems.length === 0) {
        return;
    }
    const startWeekDay = getWeekDay(quiz.startTime);
    const endIndex = quiz.quizItems.length - 1;
    const numberOfWeekEndsInRange = Math.floor((startWeekDay + endIndex) / 5);
    return moment(quiz.startTime).add(endIndex + (numberOfWeekEndsInRange * 2), 'days').toDate();
}

function getQuizData() {
    return db.collection('quiz').find().toArray()
        .then(quizData => quizData.map(quiz => {
            return {
                id: quiz._id,
                name: quiz.name,
                startTime: quiz.startTime,
                endTime: getEndDate(quiz),
                numberOfItems: quiz.quizItems ? quiz.quizItems.length : 0,
                createdBy: quiz.createdBy
            }
        }));
}

function getQuiz(id) {
    return db.collection('quiz').findOne({"_id": ObjectId(id)})
}

function insertQuiz(quiz) {
    cleanUpUnusedImages();
    return db.collection('quiz').insertOne(quiz)
        .then(writeResult => writeResult.insertedId)
}


function cleanUpUnusedImages() {
    db.collection('quiz').find().toArray()
        .then(quizes => quizes.forEach(quiz => cleanUpUnusedImagesInQuiz(quiz)));
}

function cleanUpUnusedImagesInQuiz(quiz) {
    logger.info("cleaning up images in quiz: " + quiz.name);
    quiz.quizItems.forEach(quizItem => {
        if (quizItem.imageId) {
            const imageObjId = ObjectId(quizItem.imageId);
            db.collection('image').deleteMany({
                _id: {$ne: imageObjId},
                quizId: quiz._id.toHexString(),
                quizItemId: quizItem.quizItemId
            })
                .then(deleteResult => logger.info(`${deleteResult.deletedCount} unused images deleted for quiz ${quiz._id}`));
        }
    });
}

function saveQuiz(quiz) {
    if (!quiz._id) {
        return insertQuiz(quiz);
    }
    quiz._id = ObjectId(quiz._id);
    const criteria = {_id: quiz._id};
    return db.collection('quiz').updateOne(criteria, quiz)
        .then((result) => {
            if (result.modifiedCount !== 1) {
                const message = "Could not save quiz with id: " + quiz._id;
                logger.error(message);
                throw new Error(message);
            }
            return quiz._id;
        });
}

function saveImage(quizId, quizItemId, imageData, fileType) {
    const document = {quizId, quizItemId, imageData, fileType};
    return db.collection('image').insertOne(document)
        .then(writeResult => writeResult.insertedId.toHexString())
    .catch(errorHandler);
}

function getImage(imageId) {
    const criteria = ObjectId(imageId);
    return db.collection('image').findOne(criteria)
        .catch(error => logger.error(error));
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

