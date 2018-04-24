import {Component, OnInit} from '@angular/core';
import {QuizService} from "../quiz.service";
import {Router} from "@angular/router";
import {QuizMetadata} from "../quizmetadata";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import * as octicons from 'octicons';
import {DomSanitizer} from "@angular/platform-browser";
import {QuizMetadataComponent} from "../quiz-metadata/quiz-metadata.component";

@Component({
    selector: 'app-quiz-list',
    templateUrl: './quiz-list.component.html',
    styleUrls: ['./quiz-list.component.css']
})
export class QuizListComponent implements OnInit {

    quizes: QuizMetadata[];
    removeIcon: any;
    graphIcon: any;

    constructor(
        private quizService: QuizService,
        private router: Router,
        private modalService: NgbModal,
        private sanitizer: DomSanitizer)
    {}

    // noinspection JSUnusedGlobalSymbols
    ngOnInit() {
        this.getData();
        this.removeIcon = this.sanitizer.bypassSecurityTrustHtml(octicons.trashcan.toSVG());
        this.graphIcon = this.sanitizer.bypassSecurityTrustHtml(octicons.graph.toSVG());
    }

    getData() {
        this.quizService.getQuizes()
            .subscribe(quizes => this.quizes = quizes);
    }

    quizClicked(quizId) {
        this.router.navigate(["quiz", quizId]);
    }

    createNewQuiz() {
        this.modalService.open(QuizMetadataComponent);
    }

    isDeleteColumnVisible(): boolean {
        if (!this.quizes) {
            return false;
        }
        return this.quizes
            .map(quiz => quiz.numberOfItems)
            .filter(numberOfItems => numberOfItems === 0).length > 0;
    }

    deleteQuiz(quiz: any, confirmModalContent) {
        this.modalService.open(confirmModalContent).result.then(() => {
            this.quizService.deleteQuiz(quiz)
                .then(() => this.getData());
        }, () => {});
    }

}

