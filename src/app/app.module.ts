import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {QuizService} from "./quiz.service";
import {HttpClientModule} from "@angular/common/http";
import { QuizComponent } from './quiz/quiz.component';
import { AppRoutingModule } from './/app-routing.module';
import { QuizListComponent } from './quiz-list/quiz-list.component';
import { QuizItemComponent } from './quiz-item/quiz-item.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";

@NgModule({
    declarations: [
        AppComponent,
        QuizComponent,
        QuizListComponent,
        QuizItemComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        NgbModule.forRoot()
    ],
    providers: [QuizService],
    bootstrap: [AppComponent],
    entryComponents: [QuizItemComponent]
})
export class AppModule {
}
