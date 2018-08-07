import { Pipe, PipeTransform } from '@angular/core';
import {Quiz} from "./quiz";
import {QuizFilter} from "./quizfilter";
import * as _ from 'lodash';

@Pipe({
    name: 'quizfilter',
    pure: false
})
export class QuizFilterPipe implements PipeTransform {
    transform(quizList: Quiz[], filter: QuizFilter): any {
        if (!quizList || !filter) {
            return quizList;
        }
        return quizList.filter(quiz => _.includes(filter.selectedPhases(), quiz.phase));
    }
}