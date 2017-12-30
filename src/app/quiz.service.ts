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

    getQuiz(quizId): Promise<Quiz> {
        return this.http.get<Quiz[]>(`${this.quizUrl}/${quizId}`)
            .toPromise()
            .then(rawQuiz => new Quiz(rawQuiz))
            .catch(error => {
                console.error(error);
                return null;
            })
    }

    saveQuiz(quiz: Quiz): void {
        this.http
            .put(`${this.quizUrl}/${quiz._id}`, quiz)
            .subscribe(
                () => {},
                error => console.error(error)
            );
    }

}
