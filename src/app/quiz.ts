import {QuizItem} from "./quizitem";

export class Quiz {

    public _id: string;
    public name: string;
    public quizItems: QuizItem[];

    constructor(rawQuiz: any) {
        this._id = rawQuiz._id;
        this.name = rawQuiz.name;
        this.quizItems = rawQuiz.quizItems;
    }

    deleteQuizItem(quizItemId: any): void {
        let index = this.quizItems.findIndex(quizItem => quizItem.quizItemId === quizItemId);
        this.quizItems.splice(index, 1);
    }
}