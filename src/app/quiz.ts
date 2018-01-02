import {QuizItem} from "./quizitem";

export class Quiz {

    public _id: string;
    public name: string;
    public quizItems: QuizItem[];
    public startTime: Date;

    constructor(rawQuiz: any) {
        this._id = rawQuiz._id;
        this.name = rawQuiz.name;
        this.quizItems = rawQuiz.quizItems.map(rawQuizItems => QuizItem.fromObj(rawQuizItems));
        this.startTime = new Date(rawQuiz.startTime);
    }

    deleteQuizItem(quizItemId: any): void {
        let index = this.quizItems.findIndex(quizItem => quizItem.quizItemId === quizItemId);
        this.quizItems.splice(index, 1);
    }

    newQuizItem(): QuizItem {
        const newQuizItemId = this.quizItems
            .map(quizItem => quizItem.quizItemId)
            .reduce((acc, curr) => Math.max(acc, curr), Number.MIN_VALUE) + 1;
        const quizItem = new QuizItem(newQuizItemId, null, null, null, null, null, null);
        this.quizItems.push(quizItem);
        return quizItem;
    }
}