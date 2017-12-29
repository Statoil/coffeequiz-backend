import { Component, Input, OnInit } from '@angular/core';
import {QuizItem} from "../quizitem";

@Component({
    selector: 'app-quiz-item',
    templateUrl: './quiz-item.component.html',
    styleUrls: ['./quiz-item.component.css']
})
export class QuizItemComponent implements OnInit {

    @Input() quizItem: QuizItem;

    constructor() {

    }

    ngOnInit() {
    }

}
