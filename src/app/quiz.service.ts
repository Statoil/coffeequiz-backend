import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Quiz} from "./quiz";
import {QuizMetadata} from "./quizmetadata";
import {catchError} from "rxjs/operators";
import {QuizFilter} from "./quizfilter";

@Injectable()
export class QuizService {
    private quizesUrl = 'api/auth/quizes';
    private quizUrl = 'api/auth/quiz';
    private quizFilter: QuizFilter = new QuizFilter(true, true, false);


    constructor(private http: HttpClient) {
    }

    getQuizes(): Observable<QuizMetadata[]> {
        return this.http.get<QuizMetadata[]>(this.quizesUrl)
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
            .then(rawQuiz => Quiz.fromObj(rawQuiz))
            .catch(error => {
                console.error(error);
                return null;
            })
    }

    saveQuiz(quiz: any): Promise<Quiz> {
        return this.http
            .put<any>(`${this.quizUrl}`, quiz)
            .toPromise()
            .then(rawQuiz => Quiz.fromObj(rawQuiz))
            .catch(error => {
                console.error(error);
                return null;
            })
    }

    deleteQuiz(quiz: any): Promise<void> {
        return this.http
            .delete<any>(`${this.quizUrl}/${quiz.id}`)
            .toPromise()
            .catch(error => {
                console.error(error);
            })
    }

    uploadFile(formData: FormData): Promise<any> {
        return this.http
            .post('api/auth/quiz/image', formData)
            .toPromise()
    }

    userInfo() : Promise<any> {
        return this.http
            .get<any>('api/userinfo')
            .toPromise()
            .catch(error => {
                console.error(error);
            })
    }

    publicHolidays() : Promise<any> {
        return this.http
            .get<any>('api/auth/publicholidays')
            .toPromise()
            .catch(error => {
            console.error(error);
        })
    }

    statistics(quizId) : Promise<any> {
        return this.http
            .get<any>(`api/auth/stats/${quizId}`)
            .toPromise()
            .catch(error => {
            console.error(error);
        })
    }

    //Storing the filter object in the service ensures state are keep on navigation within site (until reload)
    getPersistentFilter(): QuizFilter {
        return this.quizFilter;
    }



}
