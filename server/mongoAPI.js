"use strict";

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const logger = require('./logger');
const ObjectId = require('mongodb').ObjectId;
const moment = require('moment-timezone');
const _ = require('lodash');

const url = process.env.DB_URL || 'mongodb://localhost:27018/coffeequiz';
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
        setQuizToStarted(quizResponse.quizId);
    });
}

function setQuizToStarted(quizId) {
    getQuiz(quizId)
        .then(quiz => {
            if (!quiz.isStarted) {
                quiz.isStarted = true;
                logger.info(`Quiz ${quiz.name} started`);
                saveQuiz(quiz);
            }
        })
}

function getWeekDay(date) {
    return moment(date).tz("Europe/Oslo").isoWeekday() - 1; //0 == Monday, 6 == Sunday
}

function getEndDate(quiz, publicHolidays) {
    if (!quiz || !quiz.quizItems || quiz.quizItems.length === 0) {
        return;
    }
    const endIndex = quiz.quizItems.length - 1;
    return getQuizItemDate(quiz, endIndex, publicHolidays);
}

function getQuizItemDate(quiz, index, publicHolidays) {
    const startWeekDay = getWeekDay(quiz.startTime);
    const indexAdjustedForHolidays = index + publicHolidaysInRange(quiz.startTime, index, publicHolidays);
    const numberOfWeekEndsInRange = Math.floor((startWeekDay + indexAdjustedForHolidays) / 5);
    const tentativeDate = moment(quiz.startTime).add(indexAdjustedForHolidays + (numberOfWeekEndsInRange * 2), 'days');
    if (startWeekDay === 6) {
        return tentativeDate.subtract(1, 'day').toDate();
    }
    return tentativeDate.toDate();
}

function publicHolidaysInRange(quizStartDay, quizItemId, publicHolidays) {
    const startDayOfYear = moment(quizStartDay).dayOfYear();
    const holidaysOfYear = publicHolidays.map(holiday => moment(holiday).dayOfYear());
    const startDayIndex = _.sortedIndex(holidaysOfYear, startDayOfYear);
    let indexDayOfYear = startDayOfYear + quizItemId;
    while (_.sortedIndexOf(holidaysOfYear, indexDayOfYear) !== -1) {
        //fast forward do first non-holiday
        indexDayOfYear++;
    }
    const quizItemIndex = _.sortedLastIndex(holidaysOfYear, indexDayOfYear);
    return quizItemIndex - startDayIndex;
}

function getQuizes() {
    return getPublicHolidays()
        .then(publicHolidays => {
            return db.collection('quiz').find().toArray()
                .then(quizData => {
                    const mappedQuizData = quizData.map(quiz => {
                        return {
                            id: quiz._id,
                            name: quiz.name,
                            startTime: quiz.startTime,
                            endTime: getEndDate(quiz, publicHolidays),
                            numberOfItems: quiz.quizItems ? quiz.quizItems.length : 0,
                            createdBy: quiz.createdBy,
                            isStarted: quiz.isStarted
                        }
                    });
                    return _.sortBy(mappedQuizData, quiz => quiz.startTime);
                });
        });

}

function getQuizesForApp() {
    return getQuizes()
        .then(quizes => quizes.filter(quiz => moment(quiz.endTime).isSameOrAfter(moment().startOf('day'))));
}

function getQuiz(quizId) {
    return db.collection('quiz').findOne({"_id": ObjectId(quizId)})
        .then(quiz => getPublicHolidays()
            .then(publicHolidays => {
                quiz.quizItems.forEach((quizItem, index) => {
                    quizItem.date = getQuizItemDate(quiz, index, publicHolidays);
                });
                return quiz;
            })
        );
}

function getPublicHolidays() {
    return db.collection('config').findOne({"_id": 1})
        .then(config => {
            if (!config) {
                logger.error("Could not find config object!");
                return [];
            }
            if (!config.publicHolidays) {
                logger.error("Config object does not contain publicHolidays array");
                return [];
            }
            return config.publicHolidays;
        })
        .catch(error => {
            logger.error(error);
            return [];
        })
}

function deleteQuiz(quizId) {
    return db.collection('quiz').deleteOne({"_id": ObjectId(quizId)});
}

function getQuizItems(quizId) {
    return getQuiz(quizId)
        .then(quizData => {
            quizData.quizItems.forEach((quizItem) => {
                quizItem.quizId = quizData._id;
            });
            return quizData.quizItems;
        })
}

function createQuiz(quiz) {
    return db.collection('quiz').insertOne(quiz)
        .then(writeResult => writeResult.insertedId)
}

function saveQuiz(quiz) {
    quiz._id = ObjectId(quiz._id);
    const criteria = {_id: quiz._id};
    return db.collection('quiz').updateOne(criteria, quiz)
        .then((result) => {
            if (result.result.ok !== 1) {
                const message = "Could not save quiz with id: " + quiz._id;
                throw new Error(message);
            }
            return quiz._id;
        });
}


const mongoAPI = {
    connect: connect,
    saveQuizResponse: saveQuizResponse,
    getQuizes: getQuizes,
    getQuizesForApp: getQuizesForApp,
    getQuiz: getQuiz,
    deleteQuiz: deleteQuiz,
    getQuizItems: getQuizItems,
    saveQuiz: saveQuiz,
    createQuiz: createQuiz,
    publicHolidaysInRange: publicHolidaysInRange //for testing
};

module.exports = mongoAPI;

