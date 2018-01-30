import {Component, OnInit, Input} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {Quiz} from "../quiz";
import {QuizService} from "../quiz.service";
import {Router} from "@angular/router";

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
        private router: Router)
    { }

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

    // noinspection JSUnusedGlobalSymbols
    save() {
        if (this.createMode) {
            this.createNewQuiz();
        } else {
            this.quiz.name = this.name;
            this.quiz.startTime = this.getDatePickerDate();
            this.quizService.saveQuiz(this.quiz);
        }
        this.activeModal.close('saved');
    }

    saveButtonDisabled(): boolean {
        return !this.name || (this.quiz && (this.quiz.name === this.name && this.quiz.startTime.getTime() === this.getDatePickerDate().getTime()));
    }

    createNewQuiz() {
        const quiz = new Quiz(undefined, this.name, [], this.getDatePickerDate(), 0, null, false);
        this.quizService.saveQuiz(quiz)
            .then(quiz => this.router.navigate(['quiz', quiz._id]))
            .catch((error) => console.error(error));
    }

    getDatePickerDate(): Date {
        return DatePickerDate.fromObject(this.startTime).toDate();
    }


}
