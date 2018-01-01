import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {Quiz} from "./quiz";
import {QuizMetadata} from "./quizmetadata";
import {catchError} from "rxjs/operators";
import {QuizImage} from "./quiz-image";

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

    saveQuiz(quiz: Quiz): Promise<Quiz> {
        return this.http
            .put(`${this.quizUrl}/${quiz._id}`, quiz)
            .toPromise()
            .then(rawQuiz => new Quiz(rawQuiz))
            .catch(error => {
                console.error(error);
                return null;
            })
    }

    uploadFile(quizImage: QuizImage): Promise<any> {
        return this.http
            .post('api/quiz/file', quizImage)
            .toPromise()
            .catch(error => {
                console.error(error);
                return null;
            })
    }

}
