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
                this.isAuthenticated = userInfo.isAuthenticated;
                if (!userInfo || !userInfo.isAuthenticated) {
                    if (userInfo.loginUrl) {
                        window.location.href = userInfo.loginUrl;
                    }
                    else {
                        window.location.href = '/noaccess';
                    }
                }
            })
    }


}
