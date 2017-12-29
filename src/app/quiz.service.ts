import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {Quiz} from "./quiz";
import {QuizMetadata} from "./quizmetadata";
import {catchError} from "rxjs/operators";

@Injectable()
export class QuizService {
    private quizesUrl = 'api/quizes';
    private quizUrl = 'api/quiz';

    constructor(private http: HttpClient) {
    }

    getQuizes(): Observable<QuizMetadata[]> {
        return this.http.get<Quiz[]>(this.quizesUrl)
            .pipe(
                catchError(error => {
                    console.error(error);
                    return []
                })
            )
    }

    getQuiz(quizId): Observable<Quiz> {
        return this.http.get<Quiz[]>(`${this.quizUrl}/${quizId}`)
            .pipe(
                catchError(error => {
                    console.error(error);
                    return []
                })
            )
    }

}
