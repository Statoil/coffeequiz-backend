'use strict';

let mongoAPI = require('../server/mongoAPI.js');



describe("populateEndDate", function() {
    it("One quizItem, no holidays, should return quiz start date", function() {
        const publicHolidays = [];
        const quiz = {
            startTime: new Date('2018-01-01T00:00'),
            quizItems: [{}]
        };
        mongoAPI.populateEndDate(quiz, publicHolidays);
        expect(quiz.quizItems[0].date).toEqual(new Date('2018-01-01T00:00'));
    });

   it("One quizItem, one holiday, should return quiz start date + one day", function() {
        const publicHolidays = [new Date('2018-01-01T00:00')];
        const quiz = {
            startTime: new Date('2018-01-01T00:00'),
            quizItems: [{}]
        };
        mongoAPI.populateEndDate(quiz, publicHolidays);
        expect(quiz.quizItems[0].date).toEqual(new Date('2018-01-02T00:00'));
    });

   it("Two quizItems, two holidays", function() {
        const publicHolidays = [new Date('2018-01-01T00:00'), new Date('2018-01-03T00:00')];
        const quiz = {
            startTime: new Date('2018-01-01T00:00'),
            quizItems: [{}, {}]
        };
        mongoAPI.populateEndDate(quiz, publicHolidays);
        expect(quiz.quizItems[0].date).toEqual(new Date('2018-01-02T00:00'));
        expect(quiz.quizItems[1].date).toEqual(new Date('2018-01-04T00:00'));
    });

   it("One quizItems, no holidays, starting on Friday, should return start date", function() {
        const publicHolidays = [];
        const quiz = {
            startTime: new Date('2018-01-05T00:00'),
            quizItems: [{}]
        };
        mongoAPI.populateEndDate(quiz, publicHolidays);
        expect(quiz.quizItems[0].date).toEqual(new Date('2018-01-05T00:00'));
    });

    it("Two quizItems, one holiday in week end, starting on Friday", function() {
        const publicHolidays = [new Date('2018-01-06T00:00')];
        const quiz = {
            startTime: new Date('2018-01-05T00:00'),
            quizItems: [{}, {}]
        };
        mongoAPI.populateEndDate(quiz, publicHolidays);
        expect(quiz.quizItems[0].date).toEqual(new Date('2018-01-05T00:00'));
        expect(quiz.quizItems[1].date).toEqual(new Date('2018-01-08T00:00'));
    });

    it("Two quizItems, one holiday, starting on Friday", function() {
        const publicHolidays = [new Date('2018-01-08T00:00')];
        const quiz = {
            startTime: new Date('2018-01-05T00:00'),
            quizItems: [{}, {}]
        };
        mongoAPI.populateEndDate(quiz, publicHolidays);
        expect(quiz.quizItems[0].date).toEqual(new Date('2018-01-05T00:00'));
        expect(quiz.quizItems[1].date).toEqual(new Date('2018-01-09T00:00'));
    });

});



