import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {QuizService} from "./quiz.service";
import {HttpClientModule} from "@angular/common/http";
import { QuizComponent } from './quiz/quiz.component';
import { AppRoutingModule } from './/app-routing.module';
import { QuizListComponent } from './quiz-list/quiz-list.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";
import { QuizItemPreviewComponent } from './quiz-item-preview/quiz-item-preview.component';
import { VotingButtonComponent } from './voting-button/voting-button.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { QuizMetadataComponent } from './quiz-metadata/quiz-metadata.component';
import { QuizItemEditComponent } from './quiz-item-edit/quiz-item-edit.component';
import { QuizStatusComponent } from './quiz-status/quiz-status.component';
import { StatisticsComponent } from './statistics/statistics.component';
import {ChartsModule} from "ng2-charts";
import {QuizFilterPipe} from "./quiz-filter.pipe";

@NgModule({
    declarations: [
        AppComponent,
        QuizComponent,
        QuizListComponent,
        QuizItemPreviewComponent,
        VotingButtonComponent,
        FileUploadComponent,
        QuizMetadataComponent,
        QuizItemEditComponent,
        QuizStatusComponent,
        StatisticsComponent,
        QuizFilterPipe
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        NgbModule.forRoot(),
        ChartsModule
    ],
    providers: [QuizService],
    bootstrap: [AppComponent],
    entryComponents: [QuizMetadataComponent]
})
export class AppModule {
}
