import {Component, OnInit} from '@angular/core';
import {QuizService} from "../quiz.service";
import {Router} from "@angular/router";
import {QuizMetadata} from "../quizmetadata";

@Component({
    selector: 'app-quiz-list',
    templateUrl: './quiz-list.component.html',
    styleUrls: ['./quiz-list.component.css']
})
export class QuizListComponent implements OnInit {

    quizes: QuizMetadata[];

    constructor(private quizService: QuizService, private router: Router) {

    }

    // noinspection JSUnusedGlobalSymbols
    ngOnInit() {
        this.quizService.getQuizes()
            .subscribe(quizes => this.quizes = quizes);
    }

    quizClicked(quizId) {
        console.log("Quiz clicked: " + quizId);
        this.router.navigate(["quiz", quizId]);
    }

}

