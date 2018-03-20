'use strict';

let mongoAPI = require('../server/mongoAPI.js');

describe("publicHolidaysInRange, one holiday in holiday list", function() {
    it("first index, no holidays in range, should return zero", function() {
        const holidaysInRange = mongoAPI.publicHolidaysInRange(new Date('2018-01-01T00:00'), 0, [new Date('2018-01-02T00:00')]);
        expect(holidaysInRange).toEqual(0);
    });

    it("second index, 1 holiday in range, should return 1", function() {
        const holidaysInRange = mongoAPI.publicHolidaysInRange(new Date('2018-01-01T00:00'), 1, [new Date('2018-01-02T00:00')]);
        expect(holidaysInRange).toEqual(1);
    });

    it("third index, 1 holiday in range, should return 1", function() {
        const holidaysInRange = mongoAPI.publicHolidaysInRange(new Date('2018-01-01T00:00'), 2, [new Date('2018-01-02T00:00')]);
        expect(holidaysInRange).toEqual(1);
    });

});

describe("publicHolidaysInRange, two holiday in holiday list", function() {
    it("index 0, no holidays in range, should return zero", function() {
        const holidaysInRange = mongoAPI.publicHolidaysInRange(new Date('2018-01-01T00:00'), 0, [new Date('2018-01-02T00:00'), new Date('2018-01-03T00:00')]);
        expect(holidaysInRange).toEqual(0);
    });

    it("index 1, 2 holiday in range, should return 2", function() {
        const holidaysInRange = mongoAPI.publicHolidaysInRange(new Date('2018-01-01T00:00'), 1, [new Date('2018-01-02T00:00'), new Date('2018-01-03T00:00')]);
        expect(holidaysInRange).toEqual(2);
    });

    it("index 2, 2 holiday in range, should return 1", function() {
        const holidaysInRange = mongoAPI.publicHolidaysInRange(new Date('2018-01-01T00:00'), 2, [new Date('2018-01-02T00:00'), new Date('2018-01-03T00:00')]);
        expect(holidaysInRange).toEqual(2);
    });

});

describe("publicHolidaysInRange, three holiday in holiday list", function() {
    const publicHolidays = [new Date('2018-01-02T00:00'), new Date('2018-01-03T00:00'), new Date('2018-01-05T00:00')];
    it("index 0, no holidays in range, should return zero", function() {
        const holidaysInRange = mongoAPI.publicHolidaysInRange(new Date('2018-01-01T00:00'), 0, publicHolidays);
        expect(holidaysInRange).toEqual(0);
    });

    it("index 1, 1 holiday in range, should return 1", function() {
        const holidaysInRange = mongoAPI.publicHolidaysInRange(new Date('2018-01-01T00:00'), 1, publicHolidays);
        expect(holidaysInRange).toEqual(2);
    });

    it("index 2, 1 holiday in range, should return 1", function() {
        const holidaysInRange = mongoAPI.publicHolidaysInRange(new Date('2018-01-01T00:00'), 2, publicHolidays);
        expect(holidaysInRange).toEqual(2);
    });

    it("index 3, 3 holidays in range, should return 3", function() {
        const holidaysInRange = mongoAPI.publicHolidaysInRange(new Date('2018-01-01T00:00'), 3, publicHolidays);
        expect(holidaysInRange).toEqual(2);
    });

    it("index 4, 3 holidays in range, should return 3", function() {
        const holidaysInRange = mongoAPI.publicHolidaysInRange(new Date('2018-01-01T00:00'), 4, publicHolidays);
        expect(holidaysInRange).toEqual(3);
    });

});