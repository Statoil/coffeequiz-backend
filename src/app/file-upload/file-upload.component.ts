import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {QuizService} from "../quiz.service";

@Component({
    selector: 'file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {

    @Input() quizId: string;
    @Input() quizItemId: number;

    @Output() change: EventEmitter<string> = new EventEmitter<string>();

    isLoading: boolean;

    constructor(private quizService: QuizService,) {
    }

    ngOnInit() {
    }

    onFileChange(event) {
        if(event.target.files.length > 0) {
            let file = event.target.files[0];
            const formData = new FormData();
            formData.append('quizId', this.quizId);
            formData.append('quizItemId', this.quizItemId.toString());
            formData.append('imageFile', file);
            formData.append('fileType', file.type);
            this.quizService.uploadFile(formData)
                .then(response => {
                    this.change.emit(response.imageUrl);
                    this.isLoading = false;
                })
                .catch(error => {
                    console.error(error);
                    this.isLoading = false;
                })
        }
    }
}
