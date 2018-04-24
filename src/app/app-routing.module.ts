import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {QuizComponent} from "./quiz/quiz.component";
import {QuizListComponent} from "./quiz-list/quiz-list.component";
import {StatisticsComponent} from "./statistics/statistics.component";

const routes: Routes = [
    { path: '', redirectTo: '/quizlist', pathMatch: 'full'},
    { path: 'quiz/:id', component: QuizComponent },
    { path: 'quizlist', component: QuizListComponent },
    { path: 'stats/:quizId', component: StatisticsComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
