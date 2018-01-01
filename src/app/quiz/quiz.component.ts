import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {QuizService} from "../quiz.service";
import {Quiz} from "../quiz";
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {QuizItem} from "../quizitem";
import {QuizMetadataComponent} from "../quiz-metadata/quiz-metadata.component";
import * as moment from 'moment';

@Component({
    selector: 'app-quiz',
    templateUrl: './quiz.component.html',
    styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {

    quiz: Quiz;
    quizItem: QuizItem;
    private startWeekDay: number;

    constructor(
        private quizService: QuizService,
        private activatedRoute: ActivatedRoute,
        private modalService: NgbModal) {
    }

    ngOnInit() {
        this.getQuiz();
    }

    getQuiz() {
        const id = this.activatedRoute.snapshot.paramMap.get('id');
        console.log("id: " + id);
        this.quizService.getQuiz(id)
            .then (quiz => {
                this.quiz = quiz;
                this.startWeekDay = QuizComponent.getWeekDay(quiz.startTime);
            });
    }

    openQuizItem(quizItemId) {
        this.quizItem = this.quiz.quizItems.find(quizItem => quizItem.quizItemId === quizItemId);

    }

    deleteQuizItem(quizItemId: any) {
        this.quiz.deleteQuizItem(quizItemId);
        this.saveQuiz();
    }

    saveQuiz() {
        this.quizService.saveQuiz(this.quiz)
            .then(quiz => this.quiz = quiz);
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
}
