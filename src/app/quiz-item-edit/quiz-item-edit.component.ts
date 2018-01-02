import {Component, Input, OnInit} from '@angular/core';
import {QuizItem} from "../quizitem";
import {QuizService} from "../quiz.service";
import {Quiz} from "../quiz";
import * as _ from "lodash";

@Component({
    selector: 'quiz-item-edit',
    templateUrl: './quiz-item-edit.component.html',
    styleUrls: ['./quiz-item-edit.component.css']
})
export class QuizItemEditComponent implements OnInit {

    @Input() quizItem: QuizItem;
    @Input() quiz: Quiz;

    answer: string;
    editQuizItem: QuizItem;

    constructor(private quizService: QuizService) {
    }

    ngOnInit() {
    }

    setNewImageId(event) {
        this.editQuizItem.imageId = event;
    }

    // noinspection JSUnusedGlobalSymbols
    ngOnChanges() {
        this.editQuizItem = _.clone(this.quizItem);
        this.answer = this.quizItem.answer.toString();
    }

    save() {
        this.quizItem.question = this.editQuizItem.question;
        this.quizItem.alternatives = this.editQuizItem.alternatives;
        this.quizItem.answer = parseInt(this.answer);
        this.quizItem.imageId = this.editQuizItem.imageId;
        this.quizService.saveQuiz(this.quiz);
    }

}
