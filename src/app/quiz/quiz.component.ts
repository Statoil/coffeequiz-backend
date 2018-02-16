import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {QuizService} from "../quiz.service";
import {Quiz} from "../quiz";
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {QuizItem} from "../quizitem";
import {QuizMetadataComponent} from "../quiz-metadata/quiz-metadata.component";
import {QuizItemEditComponent} from "../quiz-item-edit/quiz-item-edit.component";
import octicons from 'octicons';
import {DomSanitizer} from "@angular/platform-browser";

@Component({
    selector: 'app-quiz',
    templateUrl: './quiz.component.html',
    styleUrls: ['./quiz.component.css']
})
export class QuizComponent {

    @ViewChild(QuizItemEditComponent)
    private quizItemEditComponent: QuizItemEditComponent;

    quiz: Quiz;
    quizItem: QuizItem;
    icons = {
        up: null,
        down: null,
        remove: null,
        back: null,
        edit: null,
        lock: null
    };

    // noinspection JSUnusedLocalSymbols
    constructor(
        private quizService: QuizService,
        private activatedRoute: ActivatedRoute,
        private modalService: NgbModal,
        private sanitizer: DomSanitizer,
        private router: Router)
    {
        this.activatedRoute.params.subscribe((params) => {
            this.loadQuiz(params.id);
        })
    }

    loadQuiz(quizId: string) {
        this.quizService.getQuiz(quizId)
            .then(quiz => {
                this.quiz = quiz;

                if (!this.quiz.name) {
                    this.editMetadata();
                }
            });
        this.loadIcons();
    }

    openQuizItem(quizItem, modalContent) {
        if (this.quizItemEditComponent && this.quizItemEditComponent.hasUnsavedData()) {
            this.modalService.open(modalContent).result.then(() => {
                this.setCurrentQuizItem(quizItem);
            });
        }
        else {
            this.setCurrentQuizItem(quizItem);
        }
    }

    setCurrentQuizItem(quizItem) {
        this.quizItem = quizItem;
    }

    deleteQuizItem(quizItem: QuizItem, confirmModalContent) {
        this.modalService.open(confirmModalContent).result.then(() => {
            if (this.quizItem && this.quizItem.quizItemId === quizItem.quizItemId) {
                this.quizItem = null;
            }
            this.quiz.deleteQuizItem(quizItem);
            this.saveQuiz();
        }, () => {});
    }

    moveUp(quizItem: QuizItem) {
        this.quiz.moveUp(quizItem);
        this.saveAndLoadQuiz();
    }

    moveDown(quizItem: QuizItem) {
        this.quiz.moveDown(quizItem);
        this.saveAndLoadQuiz();
    }

    addQuizItem() {
        this.setCurrentQuizItem(this.quiz.newQuizItem());
    }

    saveQuiz(): Promise<Quiz> {
        return this.quizService.saveQuiz(this.quiz);
    }

    saveQuizItem(quizItem: QuizItem) {
        this.quiz.addOrUpdateQuizItem(quizItem);
        this.setCurrentQuizItem(quizItem);
        this.saveAndLoadQuiz();
    }

    cancelEditQuizItem() {
        this.setCurrentQuizItem(null);
    }

    saveAndLoadQuiz() {
        this.saveQuiz()
            .then(quiz => this.quiz = quiz);
    }

    editMetadata() {
        const modalRef = this.modalService.open(QuizMetadataComponent);
        modalRef.componentInstance.quiz = this.quiz;
        modalRef.result.then(() => this.saveAndLoadQuiz());
    }

    loadIcons() {
        this.icons.up = this.sanitizer.bypassSecurityTrustHtml(octicons['chevron-up'].toSVG());
        this.icons.down = this.sanitizer.bypassSecurityTrustHtml(octicons['chevron-down'].toSVG());
        this.icons.remove = this.sanitizer.bypassSecurityTrustHtml(octicons.trashcan.toSVG());
        this.icons.back = this.sanitizer.bypassSecurityTrustHtml(octicons['arrow-left'].toSVG());
        this.icons.edit = this.sanitizer.bypassSecurityTrustHtml(octicons['pencil'].toSVG());
        this.icons.lock = this.sanitizer.bypassSecurityTrustHtml(octicons['lock'].toSVG());
    }
}
