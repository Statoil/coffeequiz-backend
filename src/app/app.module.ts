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
import { QuizItemPreviewComponent } from './quiz-item-preview/quiz-item-preview.component';
import { VotingButtonComponent } from './voting-button/voting-button.component';
import { FileUploadComponent } from './file-upload/file-upload.component';

@NgModule({
    declarations: [
        AppComponent,
        QuizComponent,
        QuizListComponent,
        QuizItemComponent,
        QuizItemPreviewComponent,
        VotingButtonComponent,
        FileUploadComponent
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
