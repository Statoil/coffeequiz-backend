export class QuizItem {
    quizItemId: number;
    imageId: string;
    question: string;
    alternative1: string;
    alternative2: string;
    alternative3: string;
    answer: string;

    constructor(rawQuizItem: any) {
        this.quizItemId = rawQuizItem.quizItemId;
        this.imageId = rawQuizItem.imageId;
        this.question = rawQuizItem.question;
        this.alternative1 = rawQuizItem.alternative1;
        this.alternative2 = rawQuizItem.alternative2;
        this.alternative3 = rawQuizItem.alternative3;
        this.answer = rawQuizItem.answer;
    }

    public equals(other: QuizItem) {
        return (
            this.quizItemId === other.quizItemId &&
            this.imageId === other.imageId &&
            this.question === other.question &&
            this.alternative1 === other.alternative1 &&
            this.alternative2 === other.alternative2 &&
            this.alternative3 === other.alternative3 &&
            this.answer === other.answer
        );
    }

}