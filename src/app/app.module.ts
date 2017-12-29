import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {QuizService} from "./quiz.service";
import {HttpClientModule} from "@angular/common/http";
import { QuizComponent } from './quiz/quiz.component';
import { AppRoutingModule } from './/app-routing.module';
import { QuizListComponent } from './quiz-list/quiz-list.component';

@NgModule({
    declarations: [
        AppComponent,
        QuizComponent,
        QuizListComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
    ],
    providers: [QuizService],
    bootstrap: [AppComponent]
})
export class AppModule {
}
