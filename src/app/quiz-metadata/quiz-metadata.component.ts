import {Component, OnInit, Input} from '@angular/core';
import {NgbActiveModal, NgbDatepickerConfig, NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import {Quiz} from "../quiz";
import {QuizService} from "../quiz.service";
import {Router} from "@angular/router";
import * as moment from 'moment-timezone';

class DatePickerDate {
    constructor(
        public year: number,
        public month: number,
        public day: number) {}

    static fromDate(date: Date): DatePickerDate {
        return new DatePickerDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }

    static fromObject(object: any): DatePickerDate {
        return new DatePickerDate(object.year, object.month, object.day);
    }

    toDate(): Date {
        return new Date(this.year, this.month - 1, this.day, 0, 0, 0, 0);
    }
}

@Component({
    selector: 'app-quiz-metadata',
    templateUrl: './quiz-metadata.component.html',
    styleUrls: ['./quiz-metadata.component.css']
})
export class QuizMetadataComponent implements OnInit {

    @Input() quiz: Quiz;
    name: string;
    startTime: any;
    createMode: boolean;

    constructor(
        public activeModal: NgbActiveModal,
        private quizService: QuizService,
        private router: Router,
        private config: NgbDatepickerConfig)
    {
        this.quizService.publicHolidays()
            .then(publicHolidays => {
                config.markDisabled = (dateStruct: NgbDateStruct) => {
                    const date = moment([dateStruct.year, dateStruct.month - 1, dateStruct.day]);
                    return date.isBefore(moment().startOf('day')) ||
                        date.tz("Europe/Oslo").isoWeekday() > 5 ||
                        this.isPublicHoliday(date, publicHolidays);
                };
            })
    }

    ngOnInit() {
        if (!this.quiz) {
            this.createMode = true;
            this.startTime = DatePickerDate.fromDate(new Date());
        }
        else {
            this.name = this.quiz.name;
            this.startTime = DatePickerDate.fromDate(this.quiz.startTime);
            this.createMode = !this.quiz.name;
        }
    }

    isPublicHoliday(date, publicHolidays): boolean {
        const holidayMoments = publicHolidays.map(holiday => moment(holiday));
        for (let i = 0; i < holidayMoments.length; i++) {
            if (date.isSame(holidayMoments[i], 'day')) {
                return true;
            }
        }
        return false;
    }

    // noinspection JSUnusedGlobalSymbols
    save() {
        if (this.createMode) {
            this.createNewQuiz();
        } else {
            this.quiz.name = this.name;
            this.quiz.startTime = this.getDatePickerDate();
        }
        this.activeModal.close('saved');
    }

    saveButtonDisabled(): boolean {
        return !this.name || (this.quiz && (this.quiz.name === this.name && this.quiz.startTime.getTime() === this.getDatePickerDate().getTime()));
    }

    createNewQuiz() {
        const quiz = new Quiz(undefined, this.name, [], this.getDatePickerDate(), 0, null, "planned");
        this.quizService.createQuiz(quiz)
            .then(quiz => this.router.navigate(['quiz', quiz._id]))
            .catch((error) => console.error(error));
    }

    getDatePickerDate(): Date {
        return DatePickerDate.fromObject(this.startTime).toDate();
    }


}
