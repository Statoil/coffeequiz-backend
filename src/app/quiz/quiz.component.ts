import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {QuizService} from "../quiz.service";
import {Quiz} from "../quiz";
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {QuizItem} from "../quizitem";
import {QuizMetadataComponent} from "../quiz-metadata/quiz-metadata.component";

@Component({
    selector: 'app-quiz',
    templateUrl: './quiz.component.html',
    styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {

    quiz: Quiz;
    quizItem: QuizItem;

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
            .then (quiz => this.quiz = quiz);
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
        console.log("yo");
        const modalRef = this.modalService.open(QuizMetadataComponent);
        modalRef.componentInstance.quiz = this.quiz;
    }
}
