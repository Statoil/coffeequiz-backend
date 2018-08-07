import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {QuizService} from "../quiz.service";
import {Quiz} from "../quiz";
import {DomSanitizer} from "@angular/platform-browser";
import * as octicons from 'octicons';
import * as _ from 'lodash';

@Component({
    selector: 'app-statistics',
    templateUrl: './statistics.component.html',
    styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

    quiz: Quiz;
    statsPrQuestion: any;
    overallStats: any;
    backIcon: any;
    chartOptions = {
        responsive: true,
        //maintainAspectRatio: false,
        legend: {
            display: false
        }
    };

    // noinspection JSUnusedLocalSymbols
    constructor(
        private activatedRoute: ActivatedRoute,
        private quizService: QuizService,
        private sanitizer: DomSanitizer,
        public router: Router)
    {
        this.activatedRoute.params.subscribe((params) => {
            this.quizService.getQuiz(params.quizId)
                .then(quizData => {
                    this.quiz = quizData;
                    this.quizService.statistics(params.quizId)
                        .then(statistics => {
                            this.statsPrQuestion = this.statisticsPrQuestion(statistics, quizData);
                            this.overallStats = StatisticsComponent.overallStatistics(statistics, quizData)
                        });
                });


        });
    }

    private static overallStatistics(statistics: any, quizData: Quiz): any {
        const resultsWithResponse = _.uniq(statistics.map(statItem => statItem.quizItemId)).length;
        return {
            numberOfQuestions: quizData.quizItems.length,
            numberOfQuestionsWithResponse: resultsWithResponse,
            totalNumberOfResponses: statistics.length,
            totalCorrectness: statistics.filter(statItem => statItem.isCorrect).length * 100 / statistics.length
        }
    }

    private statisticsPrQuestion(statistics: any, quizData: Quiz): any {
        const prQuizItem = statistics.reduce((accumulator, currentValue) => {
            const quizItemId = currentValue.quizItemId;
            (accumulator[quizItemId] = accumulator[quizItemId] || []).push(currentValue);
            return accumulator;
        }, {});

        const statsPrQuestion = [];

        Object.keys(prQuizItem).forEach(quizItemId => {
            const quizGroup = prQuizItem[quizItemId];
            const accumulatedStats = quizGroup.reduce((accumulator, currentValue) => {
                accumulator[currentValue.isCorrect ? 'correct' : 'incorrect']++;
                accumulator[currentValue.answerIndex]++;
                return accumulator;
            }, {correct:0, incorrect:0, 1:0, 2:0, 3:0});

            let quizItem = quizData.getQuizItem(Number(quizItemId));
            accumulatedStats.quizItem = quizItem;
            accumulatedStats.pieChartData = {
                labels: [
                    StatisticsComponent.truncate(quizItem.alternative1),
                    StatisticsComponent.truncate(quizItem.alternative2),
                    StatisticsComponent.truncate(quizItem.alternative3)],
                data: [accumulatedStats[1], accumulatedStats[2], accumulatedStats[3]],
                colors: StatisticsComponent.getChartColors(quizItem.answer)
            };
            statsPrQuestion.push(accumulatedStats);
        });

        return _.sortBy(statsPrQuestion, (stat) => stat.quizItem.date.getTime());
    }

    private static getChartColors(answer: number):any {
        if (answer === 1) {
            return [{backgroundColor: ["lightgreen", "lightsalmon", "khaki"]}]
        }
        if (answer === 2) {
            return [{backgroundColor: ["lightsalmon", "lightgreen", "khaki"]}]
        }
        if (answer === 3) {
            return [{backgroundColor: ["lightsalmon", "khaki", "lightgreen"]}]
        }
    }

    private static truncate(text: string): string {
        return _.truncate(text, {
            'length': 20,
            'separator': ' '
        });
    }

    ngOnInit() {
        this.backIcon = this.sanitizer.bypassSecurityTrustHtml(octicons['arrow-left'].toSVG());
    }
}
