import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {Quiz} from "./quiz";
import {catchError} from "rxjs/operators";

@Injectable()
export class QuizService {
    private quizUrl = 'api/quiz';

    constructor(private http: HttpClient) {
    }

    getQuizes(): Observable<Quiz[]> {
        return this.http.get<Quiz[]>(this.quizUrl)
            .pipe(
                catchError(error => {
                    console.error(error);
                    return []
                })
            )
    }

}
