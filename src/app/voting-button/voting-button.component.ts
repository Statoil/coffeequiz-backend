import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'voting-button',
  templateUrl: './voting-button.component.html',
  styleUrls: ['./voting-button.component.css']
})
export class VotingButtonComponent implements OnInit {

  @Input() text: string;

  constructor() { }

  ngOnInit() {
  }

}
