import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {QuizService} from "../quiz.service";
import {QuizImage} from "../quiz-image";

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
        this.isLoading = true;
        let reader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            let file = event.target.files[0];
            reader.readAsDataURL(file);
            reader.onload = () => {
                const encodedImage = reader.result;
                this.quizService.uploadFile(new QuizImage(this.quizId, this.quizItemId, encodedImage, file.type))
                    .then(result => {
                        this.change.emit(result.imageId);
                        this.isLoading = false;
                    })
                    .catch(error => {
                        console.error(error);
                        this.isLoading = false;
                    })
            };
        }
    }
}
