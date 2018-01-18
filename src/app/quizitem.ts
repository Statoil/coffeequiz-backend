export class QuizItem {

    constructor(
        public quizItemId: number,
        public imageUrl: string,
        public question: string,
        public alternative1: string,
        public alternative2: string,
        public alternative3: string,
        public answer: number,
    ) {}

    static fromObj(rawQuizItem: any) {
        return new QuizItem(rawQuizItem.quizItemId, rawQuizItem.imageUrl, rawQuizItem.question, rawQuizItem.alternative1,
            rawQuizItem.alternative2, rawQuizItem.alternative3, rawQuizItem.answer);
    }

    public equals(other: QuizItem) {
        return (
            this.quizItemId === other.quizItemId &&
            this.imageUrl === other.imageUrl &&
            this.question === other.question &&
            this.alternative1 === other.alternative1 &&
            this.alternative2 === other.alternative2 &&
            this.alternative3 === other.alternative3 &&
            this.answer === other.answer
        );
    }

}