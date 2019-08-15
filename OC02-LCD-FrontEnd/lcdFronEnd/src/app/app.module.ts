import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

//Form
import { ReactiveFormsModule } from '@angular/forms';

//For make http requests
import { HttpClientModule} from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
