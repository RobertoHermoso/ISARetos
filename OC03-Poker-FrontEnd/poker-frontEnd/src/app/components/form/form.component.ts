import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http'

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  playerForm: FormGroup


  constructor(private formBuilder: FormBuilder, private http: HttpClient) { }


  partida= { "jugadas" : []};
  
  jugada = [];

  ngOnInit() {
    this.playerForm = this.formBuilder.group({
      playerName: ['', Validators.required],
      moneyPot: ['', [Validators.required, Validators.min(0)]],
      value1:['', Validators.required],
      value2:['', Validators.required],
      value3:['', Validators.required],
      value4:['', Validators.required],
      value5:['', Validators.required],
      suit1:['', Validators.required],
      suit2:['', Validators.required],
      suit3:['', Validators.required],
      suit4:['', Validators.required],
      suit5:['', Validators.required],

  });
  }

  addPlayer(){
    //this.jugadas.push(this.playerForm.valueChanges)
    this.jugada.push(this.playerForm.value.playerName)
    console.log(this.playerForm.value)
  }

  onReset() {
    this.playerForm.reset();
  }

}
