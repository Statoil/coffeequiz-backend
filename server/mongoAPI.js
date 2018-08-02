"use strict";

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const logger = require('./logger');
const ObjectId = require('mongodb').ObjectId;
const moment = require('moment-timezone');
const _ = require('lodash');

const url = process.env.DB_URL || 'mongodb://localhost:27018/coffeequiz';
const mode = process.env.MODE || 'dev';
const platform = process.env.PLATFORM || 'web';
let db;

async function connect() {
    await MongoClient.connect(url)
        .then(database => {
            logger.info("Connected to " + url);
            db = database;
        })
        .catch(error => {
            logger.error(error);
            process.exit();
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
            if (quiz.phase === 'planned') {
                quiz.phase = 'started';
                logger.info(`Quiz ${quiz.name} started`);
                saveQuiz(quiz);
            }
        })
}


function populateEndDate(quiz, publicHolidays) {
    let candidateDate = moment(quiz.startTime);
    quiz.quizItems.forEach((quizItem) => {
        while(!validDate(candidateDate, publicHolidays)) {
            candidateDate = candidateDate.add(1, 'days');
        }
        quizItem.date = candidateDate.toDate();
        candidateDate.add(1, 'days');
    })
}

function validDate(date, publicHolidays) {
    return !(isWeekEnd(date) || isPublicHoliday(date, publicHolidays));
}

function isWeekEnd(date) {
    return moment(date).tz("Europe/Oslo").isoWeekday() > 5;
}

function isPublicHoliday(date, publicHolidays) {
    for (let i = 0; i < publicHolidays.length; i++) {
        if (date.tz("Europe/Oslo").isSame(publicHolidays[i], 'day')) {
            return true;
        }
    }
    return false;
}

function getAllQuizes() {
    return getPublicHolidays()
        .then(publicHolidays => {
            return db.collection('quiz').find().toArray()
                .then(quizData => {
                    const mappedQuizData = quizData.map(quiz => {
                        return {
                            id: quiz._id,
                            name: quiz.name,
                            startTime: quiz.startTime,
                            endTime: getEndDateForQuiz(quiz, publicHolidays),
                            numberOfItems: quiz.quizItems ? quiz.quizItems.length : 0,
                            createdBy: quiz.createdBy,
                            phase: quiz.phase
                        }
                    });
                    return _.sortBy(mappedQuizData, quiz => quiz.startTime);
                });
        });

}

function getEndDateForQuiz(quiz, publicHolidays) {
    if (!quiz.quizItems || quiz.quizItems.length === 0) {
        return;
    }
    populateEndDate(quiz, publicHolidays);
    return quiz.quizItems[quiz.quizItems.length - 1].date;
}

function getNotCompletedQuizes() {
    return getAllQuizes()
        .then(quizes => quizes.filter(quiz => moment(quiz.endTime).isSameOrAfter(moment().startOf('day'))));
}

function getQuiz(quizId) {
    return db.collection('quiz').findOne({"_id": ObjectId(quizId)})
        .then(quiz => getPublicHolidays()
            .then(publicHolidays => {
                populateEndDate(quiz, publicHolidays);
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
            return config.publicHolidays.map(item => moment({day: item.day, month: item.month - 1, year: item.year})); //month is zero-indexed
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

function getStatistics(quizId) {
    return db.collection('quizResponse').find({quizId, mode, platform}).toArray();
}

function markQuizComplete(quizId, name) {
    db.collection('quiz').updateOne({_id: quizId}, {$set: {phase: 'completed'}})
        .then(() => {
            logger.info(`Quiz "${name}", id: ${quizId} marked as completed`);
        });
}

function markCompletedQuizes() {
    logger.info('Running job "Mark Completed Quizes"');
    return getAllQuizes()
        .then(quizes => quizes.filter(quiz => quiz.phase === 'started').forEach(quiz => {
            if (moment().startOf('day').isSameOrAfter(moment(quiz.endTime).startOf('day').add(1, 'days'))) {
                markQuizComplete(quiz.id, quiz.name);
            }
        }));
}


const mongoAPI = {
    connect: connect,
    saveQuizResponse: saveQuizResponse,
    getAllQuizes: getAllQuizes,
    getNotCompletedQuizes: getNotCompletedQuizes,
    getQuiz: getQuiz,
    deleteQuiz: deleteQuiz,
    getQuizItems: getQuizItems,
    saveQuiz: saveQuiz,
    createQuiz: createQuiz,
    getPublicHolidays:getPublicHolidays,
    populateEndDate: populateEndDate, //for testing
    getStatistics: getStatistics,
    markComplete: markCompletedQuizes
};

module.exports = mongoAPI;

