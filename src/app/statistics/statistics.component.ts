import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {QuizService} from "../quiz.service";
import {Quiz} from "../quiz";

@Component({
    selector: 'app-statistics',
    templateUrl: './statistics.component.html',
    styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

    private quiz: Quiz;
    private statistics: any;

    constructor(private activatedRoute: ActivatedRoute,
                private quizService: QuizService) {
        this.activatedRoute.params.subscribe((params) => {
            this.quizService.getQuiz(params.quizId)
                .then(quizData => {
                    this.quiz = quizData;
                    this.quizService.statistics(params.quizId)
                        .then(statistics => this.statistics = this.processStatistics(statistics, quizData));
                });


        });
    }

    private processStatistics(statistics: any, quizData: Quiz): any {
        const prQuizItem = statistics.reduce((accumulator, currentValue) => {
            const quizItemId = currentValue.quizItemId;
            (accumulator[quizItemId] = accumulator[quizItemId] || []).push(currentValue);
            return accumulator;
        }, {});

        const processedStatistics = [];

        Object.keys(prQuizItem).forEach(quizItemId => {
            const quizGroup = prQuizItem[quizItemId];
            const accumulatedStats = quizGroup.reduce((accumulator, currentValue) => {
                accumulator[currentValue.isCorrect ? 'correct' : 'incorrect']++;
                accumulator[currentValue.answerIndex]++;
                return accumulator;
            }, {correct:0, incorrect:0, 1:0, 2:0, 3:0});
            accumulatedStats.quizItem = quizData.getQuizItem(Number(quizItemId));
            processedStatistics.push(accumulatedStats);
        });
        return processedStatistics;
    }

    ngOnInit() {

    }

}
