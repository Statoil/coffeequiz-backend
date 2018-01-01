import {Component, OnInit, Input} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {Quiz} from "../quiz";

@Component({
    selector: 'app-quiz-metadata',
    templateUrl: './quiz-metadata.component.html',
    styleUrls: ['./quiz-metadata.component.css']
})
export class QuizMetadataComponent implements OnInit {

    @Input() quiz: Quiz;
    name: string;
    startTime: Date;

    constructor(public activeModal: NgbActiveModal) {
    }

    ngOnInit() {
        this.name = this.quiz.name;
        this.startTime = this.quiz.startTime;
    }

    save() {
        this.quiz.name = this.name;
        this.quiz.startTime = this.startTime;
        this.activeModal.close('saved');
    }

}
