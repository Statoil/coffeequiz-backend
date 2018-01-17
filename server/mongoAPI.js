"use strict";

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const logger = require('./logger');
const ObjectId = require('mongodb').ObjectId;
const Binary = require('mongodb').Binary;
const moment = require('moment');
const _ = require('lodash');
const fs = require('fs');

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
    const endIndex = quiz.quizItems.length - 1;
    return getQuizItemDate(quiz, endIndex);
}

function getQuizItemDate(quiz, index) {
    const startWeekDay = getWeekDay(quiz.startTime);
    const numberOfWeekEndsInRange = Math.floor((startWeekDay + index) / 5);
    return moment(quiz.startTime).add(index + (numberOfWeekEndsInRange * 2), 'days').toDate();
}

function getQuizes() {
    return db.collection('quiz').find().toArray()
        .then(quizData => {
            const mappedQuizData = quizData.map(quiz => {
                return {
                    id: quiz._id,
                    name: quiz.name,
                    startTime: quiz.startTime,
                    endTime: getEndDate(quiz),
                    numberOfItems: quiz.quizItems ? quiz.quizItems.length : 0,
                    createdBy: quiz.createdBy
                }
            });
            return _.sortBy(mappedQuizData, quiz => quiz.startTime);
        });
}

function getQuizesForApp() {
    return getQuizes()
        .then(quizes => quizes.filter(quiz => moment(quiz.endTime).isSameOrAfter(moment().startOf('day'))));
}

function getQuizData(id) {
    return db.collection('quiz').findOne({"_id": ObjectId(id)})
}

function getQuizDataForApp(id) {
    return getQuizData(id)
        .then(quizData => {
            quizData.quizItems.forEach((quizItem, index) => quizItem.startTime = getQuizItemDate(quizData, index));
            return quizData.quizItems;
        })
}

function insertQuiz(quiz) {
    return db.collection('quiz').insertOne(quiz)
        .then(writeResult => writeResult.insertedId)
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

function saveImage(quizId, quizItemId, fileType, imageFile) {
    const imageData = imageFile ? Binary(fs.readFileSync(imageFile.path)) : null;
    const document = {quizId, quizItemId, fileType, imageData};
    return db.collection('image').insertOne(document)
        .then(writeResult => writeResult.insertedId.toHexString())
    .catch(errorHandler);
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
    getQuizes: getQuizes,
    getQuizesForApp: getQuizesForApp,
    getQuizData: getQuizData,
    getQuizDataForApp: getQuizDataForApp,
    saveQuiz: saveQuiz,
    saveImage: saveImage
};

module.exports = mongoAPI;

