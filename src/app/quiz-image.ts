export class QuizImage {
    constructor(
        public quizId: string,
        public quizItemId: number,
        public encodedFile: string) {}
}