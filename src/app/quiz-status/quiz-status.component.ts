import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'quiz-status',
    templateUrl: './quiz-status.component.html',
    styleUrls: ['./quiz-status.component.css']
})
export class QuizStatusComponent implements OnInit {

    @Input() isStarted: boolean;

    constructor() {
    }

    ngOnInit() {
    }

}
