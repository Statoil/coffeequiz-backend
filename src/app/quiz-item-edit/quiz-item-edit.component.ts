import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {QuizItem} from "../quizitem";
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
    editQuizItem: QuizItem;
    @Output() saveEvent = new EventEmitter();

    constructor() {
    }

    ngOnInit() {
    }

    setNewImageUrl(event) {
        this.editQuizItem.imageUrl = event;
    }

    // noinspection JSUnusedGlobalSymbols
    ngOnChanges() {
        this.reload();
    }

    save() {
        this.quizItem.question = this.editQuizItem.question;
        this.quizItem.alternative1 = this.editQuizItem.alternative1;
        this.quizItem.alternative2 = this.editQuizItem.alternative2;
        this.quizItem.alternative3 = this.editQuizItem.alternative3;
        this.quizItem.answer = this.editQuizItem.answer;
        this.quizItem.imageUrl = this.editQuizItem.imageUrl;
        this.saveEvent.emit();
    }

    hasUnsavedData(): boolean {
        return (!this.quizItem.equals(this.editQuizItem));
    }

    reload() {
        this.editQuizItem = _.cloneDeep(this.quizItem);
    }

}
