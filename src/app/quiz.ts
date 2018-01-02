import {QuizItem} from "./quizitem";

export class Quiz {

    public _id: string;
    public name: string;
    public quizItems: QuizItem[];
    public startTime: Date;

    constructor(rawQuiz: any) {
        this._id = rawQuiz._id;
        this.name = rawQuiz.name;
        this.quizItems = rawQuiz.quizItems.map(rawQuizItems => new QuizItem(rawQuizItems));
        this.startTime = new Date(rawQuiz.startTime);
    }

    deleteQuizItem(quizItemId: any): void {
        let index = this.quizItems.findIndex(quizItem => quizItem.quizItemId === quizItemId);
        this.quizItems.splice(index, 1);
    }
}