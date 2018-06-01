export class QuizFilter {

    constructor(public planned: boolean, public started: boolean, public completed: boolean) {
    }

    selectedPhases(): string[] {
        const phases = [];
        if (this.planned) {
            phases.push("planned");
        }
        if (this.started) {
            phases.push("started");
        }
        if (this.completed) {
            phases.push("completed");
        }
        return phases;
    }


}