import {Component} from '@angular/core';
import {QuizService} from "./quiz.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    isAuthenticated: boolean;

    constructor(private quizService: QuizService) {
        this.quizService.userInfo()
            .then(userInfo => {
                if (!userInfo || (!userInfo.isAuthenticated && !userInfo.loginUrl)) {
                    window.location.href = '/noaccess';
                }
                this.isAuthenticated = userInfo.isAuthenticated;
                if (userInfo.loginUrl) {
                    window.location.href = userInfo.loginUrl;
                }
            });
    }


}
