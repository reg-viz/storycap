import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-button-group',
  template: `
    <div>
      <app-my-button *ngFor="let l of labels" [text]="l"></app-my-button>
    </div>
  `
})
export class ButtonGroupComponent implements OnInit {
  @Input() labels: string[] = [];

  constructor() {}

  ngOnInit() {}
}
