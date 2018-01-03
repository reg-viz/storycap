import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { MyButtonComponent } from './my-button/my-button.component';
import { ButtonGroupComponent } from './button-group/button-group.component';


@NgModule({
  declarations: [
    AppComponent,
    MyButtonComponent,
    ButtonGroupComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
