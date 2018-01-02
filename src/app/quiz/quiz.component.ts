import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {QuizService} from "../quiz.service";
import {Quiz} from "../quiz";
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {QuizItem} from "../quizitem";
import {QuizMetadataComponent} from "../quiz-metadata/quiz-metadata.component";
import * as moment from 'moment';
import {QuizItemEditComponent} from "../quiz-item-edit/quiz-item-edit.component";
import octicons from 'octicons';
import {DomSanitizer} from "@angular/platform-browser";

@Component({
    selector: 'app-quiz',
    templateUrl: './quiz.component.html',
    styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {

    @ViewChild(QuizItemEditComponent)
    private quizItemEditComponent: QuizItemEditComponent;

    quiz: Quiz;
    quizItem: QuizItem;
    private startWeekDay: number;
    icons = {
        up: null,
        down: null,
        remove: null,
        back: null,
        edit: null
    };

    // noinspection JSUnusedLocalSymbols
    constructor(
        private quizService: QuizService,
        private activatedRoute: ActivatedRoute,
        private modalService: NgbModal,
        private sanitizer: DomSanitizer,
        private router: Router) {
    }

    ngOnInit() {
        this.getQuiz();
        this.loadIcons();
    }

    createNewQuiz() {
        const quiz = new Quiz(undefined, "New Quiz", [], moment().endOf('day').toDate(), 0);
        return this.quizService.saveQuiz(quiz);
    }

    getQuizId() {
        const id = this.activatedRoute.snapshot.paramMap.get('id');
        if (id === 'create-new-quiz') {
            return this.createNewQuiz()
        }
        return Promise.resolve(id);
    }

    getQuiz() {
        this.getQuizId()
            .then(id => {
                this.quizService.getQuiz(id)
                    .then (quiz => {
                        this.quiz = quiz;
                        this.startWeekDay = QuizComponent.getWeekDay(quiz.startTime);
                    });
            });
    }

    openQuizItem(quizItem, modalContent) {
        if (this.quizItemEditComponent && this.quizItemEditComponent.hasUnsavedData()) {
            this.modalService.open(modalContent).result.then((result) => {
                console.log("result: " + result);
                this.setCurrentQuizItem(quizItem);
            }, (reason) => {
                console.log("reason: " + reason);
            });
        }
        else {
            this.setCurrentQuizItem(quizItem);
        }
    }

    setCurrentQuizItem(quizItem) {
        this.quizItem = quizItem;
    }

    deleteQuizItem(quizItem: QuizItem) {
        if (this.quizItem && this.quizItem.quizItemId === quizItem.quizItemId) {
            this.quizItem = null;
        }
        this.quiz.deleteQuizItem(quizItem);
        this.saveQuiz();
    }

    moveUp(quizItem: QuizItem) {
        this.quiz.moveUp(quizItem);
        this.saveQuiz();
    }

    moveDown(quizItem: QuizItem) {
        this.quiz.moveDown(quizItem);
        this.saveQuiz();
    }

    addQuizItem() {
        this.setCurrentQuizItem(this.quiz.newQuizItem());
        this.saveQuiz();
    }

    saveQuiz() {
        this.quizService.saveQuiz(this.quiz);
    }

    editMetadata() {
        const modalRef = this.modalService.open(QuizMetadataComponent);
        modalRef.componentInstance.quiz = this.quiz;
    }

    getQuizItemDate(index) {
        const numberOfWeekEndsInRange = Math.floor((this.startWeekDay + index) / 5);
        return moment(this.quiz.startTime).add(index + (numberOfWeekEndsInRange * 2), 'days').toDate();
    }

    static getWeekDay(date: Date): number {
        return (moment(date).day() + 6) % 7;
    }

    loadIcons() {
        this.icons.up = this.sanitizer.bypassSecurityTrustHtml(octicons['chevron-up'].toSVG());
        this.icons.down = this.sanitizer.bypassSecurityTrustHtml(octicons['chevron-down'].toSVG());
        this.icons.remove = this.sanitizer.bypassSecurityTrustHtml(octicons.trashcan.toSVG());
        this.icons.back = this.sanitizer.bypassSecurityTrustHtml(octicons['arrow-left'].toSVG());
        this.icons.edit = this.sanitizer.bypassSecurityTrustHtml(octicons['pencil'].toSVG());
    }
}
