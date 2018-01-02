import {QuizItem} from "./quizitem";

export class Quiz {

    public _id: string;
    public name: string;
    public quizItems: QuizItem[];
    public startTime: Date;
    public sequenceNumber: number;

    constructor(rawQuiz: any) {
        this._id = rawQuiz._id;
        this.name = rawQuiz.name;
        this.quizItems = rawQuiz.quizItems.map(rawQuizItems => QuizItem.fromObj(rawQuizItems));
        this.startTime = new Date(rawQuiz.startTime);
        this.sequenceNumber = rawQuiz.sequenceNumber;
    }

    deleteQuizItem(quizItem: QuizItem): void {
        let index = this.quizItems.findIndex(searchItem => searchItem.quizItemId === quizItem.quizItemId);
        this.quizItems.splice(index, 1);
    }

    moveUp(quizItem: QuizItem): void {
        let index = this.quizItems.findIndex(searchItem => searchItem.quizItemId === quizItem.quizItemId);
        if (index > 0) {
            this.quizItems.splice(index, 1);
            this.quizItems.splice(index - 1, 0, quizItem);
        }
    }


    moveDown(quizItem: QuizItem): void {
        let index = this.quizItems.findIndex(searchItem => searchItem.quizItemId === quizItem.quizItemId);
        if (index < this.quizItems.length - 1) {
            this.quizItems.splice(index, 1);
            this.quizItems.splice(index + 1, 0, quizItem);
        }
    }

    newQuizItem(): QuizItem {
        const quizItemId = ++this.sequenceNumber;
        const quizItem = new QuizItem(quizItemId, undefined, undefined, undefined, undefined, undefined, undefined);
        this.quizItems.push(quizItem);
        return quizItem;
    }
}