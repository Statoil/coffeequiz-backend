import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Quiz} from "./quiz";
import {QuizMetadata} from "./quizmetadata";
import {catchError} from "rxjs/operators";
import {QuizFilter} from "./quizfilter";

@Injectable()
export class QuizService {
    private baseUrl = 'api/v1.0';
    private quizFilter: QuizFilter = new QuizFilter(true, true, false);


    constructor(private http: HttpClient) {
    }

    getQuizes(): Observable<QuizMetadata[]> {
        return this.http.get<QuizMetadata[]>(`${this.baseUrl}/quiz`)
            .pipe(
                catchError(error => {
                    console.error(error);
                    return []
                })
            )
    }

    getQuiz(quizId): Promise<Quiz> {
        return this.http.get<Quiz[]>(`${this.baseUrl}/quiz/${quizId}`)
            .toPromise()
            .then(rawQuiz => Quiz.fromObj(rawQuiz))
            .catch(error => {
                console.error(error);
                return null;
            })
    }

    createQuiz(quiz: Quiz): Promise<Quiz> {
        return this.http
            .post<any>(`${this.baseUrl}/quiz`, quiz)
            .toPromise()
            .then(rawQuiz => Quiz.fromObj(rawQuiz))
            .catch(error => {
                console.error(error);
                return null;
            })
    }

    updateQuiz(quiz: Quiz): Promise<Quiz> {
        return this.http
            .put<any>(`${this.baseUrl}/quiz/${quiz._id}`, quiz)
            .toPromise()
            .then(rawQuiz => Quiz.fromObj(rawQuiz))
            .catch(error => {
                console.error(error);
                return null;
            })
    }

    deleteQuiz(quiz: any): Promise<void> {
        return this.http
            .delete<any>(`${this.baseUrl}/quiz/${quiz.id}`)
            .toPromise()
            .catch(error => {
                console.error(error);
            })
    }

    uploadFile(quizId: string, quizItemId: number, file: any, fileType: string): Promise<any> {
        const formData = new FormData();
        formData.append('quizItemId', quizItemId.toString());
        formData.append('imageFile', file);
        formData.append('fileType', fileType);

        return this.http
            .post(`${this.baseUrl}/quiz/${quizId}/image`, formData)
            .toPromise()
    }

    userInfo() : Promise<any> {
        return this.http
            .get<any>(`${this.baseUrl}/userinfo`)
            .toPromise()
            .catch(error => {
                console.error(error);
            })
    }

    publicHolidays() : Promise<any> {
        return this.http
            .get<any>(`${this.baseUrl}/publicholidays`)
            .toPromise()
            .catch(error => {
            console.error(error);
        })
    }

    statistics(quizId) : Promise<any> {
        return this.http
            .get<any>(`${this.baseUrl}/quiz/${quizId}/responses`)
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
