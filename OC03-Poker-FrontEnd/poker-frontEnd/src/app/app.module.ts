import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';  

//Form
import { ReactiveFormsModule } from '@angular/forms';

//For make http requests
import { HttpClientModule} from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormComponent } from './components/form/form.component';
import { PlayersComponent } from './components/players/players.component';
import { PlaysAndResultComponent } from './components/plays-and-result/plays-and-result.component';

@NgModule({
  declarations: [
    AppComponent,
    FormComponent,
    PlayersComponent,
    PlaysAndResultComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
