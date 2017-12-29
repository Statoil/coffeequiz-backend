import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {QuizComponent} from "./quiz/quiz.component";
import {QuizListComponent} from "./quiz-list/quiz-list.component";

const routes: Routes = [
    { path: '', redirectTo: '/quizlist', pathMatch: 'full'},
    { path: 'quiz/:id', component: QuizComponent },
    { path: 'quizlist', component: QuizListComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
