import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {QuizService} from "../quiz.service";
import {Quiz} from "../quiz";

@Component({
    selector: 'app-quiz',
    templateUrl: './quiz.component.html',
    styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {

    quiz: Quiz;

    constructor(private quizService: QuizService, private activatedRoute: ActivatedRoute) {
    }

    ngOnInit() {
        this.getQuiz();
    }

    getQuiz() {
        const id = this.activatedRoute.snapshot.paramMap.get('id');
        console.log("id: " + id);
        this.quizService.getQuiz(id)
            .subscribe(quiz => this.quiz = quiz);
    }
}
