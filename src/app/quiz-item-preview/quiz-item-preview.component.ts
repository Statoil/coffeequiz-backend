import {Component, Input, OnInit} from '@angular/core';
import {QuizItem} from "../quizitem";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Component({
    selector: 'quiz-item-preview',
    templateUrl: './quiz-item-preview.component.html',
    styleUrls: ['./quiz-item-preview.component.css']
})
export class QuizItemPreviewComponent implements OnInit {

    @Input() imageUrl: string;
    @Input() quizItem: QuizItem;
    @Input() quizId: string;
    safeUrl: SafeUrl;

    constructor(private sanitizer: DomSanitizer) {
    }

    ngOnInit() {
    }

    // noinspection JSUnusedGlobalSymbols
    ngOnChanges() {
        this.safeUrl = this.sanitizer.bypassSecurityTrustStyle(`url(${this.imageUrl})`);
    }

}
