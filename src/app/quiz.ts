import {QuizItem} from "./quizitem";

export class Quiz {

    constructor(
        public _id: string,
        public name: string,
        public quizItems: QuizItem[],
        public startTime: Date,
        public sequenceNumber: number,
        public createdBy: string,
        public phase: string
    ) {}

    static fromObj(rawQuiz: any) {
        return new Quiz(rawQuiz._id, rawQuiz.name, rawQuiz.quizItems.map(rawQuizItems => QuizItem.fromObj(rawQuizItems)),
            new Date(rawQuiz.startTime), rawQuiz.sequenceNumber, rawQuiz.createdBy, rawQuiz.phase);
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

    //New quiz items are not implicitly added to list of quizItems. This must be done through addQuizItem()
    newQuizItem(): QuizItem {
        const quizItemId = ++this.sequenceNumber;
        return new QuizItem(quizItemId, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    }

    addOrUpdateQuizItem(quizItem: QuizItem) {
        const existingIndex = this.quizItems.findIndex((item) => item.quizItemId === quizItem.quizItemId);
        if (existingIndex === -1) {
            this.quizItems.push(quizItem);
        }
        else {
            this.quizItems.splice(existingIndex, 1, quizItem);
        }
    }

    isStarted(): boolean {
        return this.phase === 'started';
    }

    isCompleted(): boolean {
        return this.phase === 'completed';
    }

    getQuizItem(quizItemId: number): QuizItem {
        return this.quizItems.filter(quizItem => quizItem.quizItemId === quizItemId)[0];
    }


}