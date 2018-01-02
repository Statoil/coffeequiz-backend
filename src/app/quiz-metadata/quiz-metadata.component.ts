import {Component, OnInit, Input} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {Quiz} from "../quiz";
import {QuizService} from "../quiz.service";

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

    constructor(
        public activeModal: NgbActiveModal,
        private quizService: QuizService) {
    }

    ngOnInit() {
        this.name = this.quiz.name;
        this.startTime = DatePickerDate.fromDate(this.quiz.startTime);
    }

    // noinspection JSUnusedGlobalSymbols
    save() {
        this.quiz.name = this.name;
        this.quiz.startTime = DatePickerDate.fromObject(this.startTime).toDate();
        this.quizService.saveQuiz(this.quiz);
        this.activeModal.close('saved');
    }



}
