import {Component} from '@angular/core';
import {QuizService} from "./quiz.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    constructor(private quizService: QuizService) {
        this.quizService.userInfo()
            .then(userInfo => {
                if (!userInfo || !userInfo.isAuthenticated) {
                    window.location.href = userInfo.loginUrl;
                }
            })
    }


}
