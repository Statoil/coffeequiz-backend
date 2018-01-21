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
                    window.location.href = "https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/oauth2/authorize?response_type=code+id_token&redirect_uri=https%3A%2F%2Fcoffeequiz-test.azurewebsites.net%2F.auth%2Flogin%2Faad%2Fcallback&client_id=1ff10f69-abb6-4edf-babb-af5c9229d6b0&scope=openid+profile+email&response_mode=form_post&nonce=6fa81e78a50b4f078f6ddd64ceca7c6a_20180121143059&state=redir%3D%252F";
                }
            })
    }


}
