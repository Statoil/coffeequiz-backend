import {Component, Input, OnInit} from '@angular/core';
import {NgbPopoverConfig} from "@ng-bootstrap/ng-bootstrap";

enum Placement {
    // noinspection JSUnusedGlobalSymbols
    top = 'top',
    bottom = 'bottom',
    left = 'left',
    right = 'right'
}

@Component({
    selector: 'quiz-status',
    templateUrl: './quiz-status.component.html',
    styleUrls: ['./quiz-status.component.css'],
    providers: [NgbPopoverConfig]
})
export class QuizStatusComponent implements OnInit {

    @Input() phase: string;
    @Input() placement: string;

    constructor(private config: NgbPopoverConfig) {
        this.config.placement = 'right';
        this.config.triggers="mouseenter:mouseleave";

    }

    ngOnInit() {
        this.config.placement = Placement[this.placement];
        this.config.triggers="mouseenter:mouseleave";
    }

}
