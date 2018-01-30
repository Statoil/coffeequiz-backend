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
    @Output() saveEvent = new EventEmitter<QuizItem>();

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
        this.saveEvent.emit(this.editQuizItem);
    }

    hasUnsavedData(): boolean {
        return (!this.quizItem.equals(this.editQuizItem));
    }

    reload() {
        this.editQuizItem = _.cloneDeep(this.quizItem);
    }

}
