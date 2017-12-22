import {Component} from '@angular/core';
import {QuizService} from "./quiz.service";
import {Quiz} from "./quiz";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    quizes: Quiz[];

    constructor(private quizService: QuizService) {

    }

    // noinspection JSUnusedGlobalSymbols
    ngOnInit() {
        this.quizService.getQuizes()
            .subscribe(quizes => this.quizes = quizes);
    }
}
