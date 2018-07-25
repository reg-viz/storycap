import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-my-button',
  template: `<div>{{text}}</div>`,
  styles: [
    `
      :host {
        display: inline-block;
        padding: 5px 15px;
        background: orange;
        color: white;
        border-radius: 3px;
        font-family: sans-serif;
        cursor: pointer;
      }
    `
  ]
  // styleUrls: ['./my-button.component.css']
})
export class MyButtonComponent implements OnInit {
  @Input() text = 'button label';

  constructor() {}

  ngOnInit() {}
}
