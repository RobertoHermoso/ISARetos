import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, Form} from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http'

import {PlayersService} from '../../services/players.service'

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  playerForm: FormGroup
  boteForm : FormGroup



  constructor(private formBuilder: FormBuilder, private http: HttpClient, private PlayersService: PlayersService) { }



  ngOnInit() {
    this.playerForm = this.formBuilder.group({
      playerName: ['', Validators.required],
      bet: ['', [Validators.required, Validators.min(0)]],
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

  this.boteForm = this.formBuilder.group({
    money: ['', Validators.required]
  });
  }

  addPlayer(){
    var jugada = {
      "jugador": this.playerForm.value.playerName,
      "apuesta": this.playerForm.value.bet,
      "cartas":[
        {
          "valor":this.playerForm.value.value1,
          "palo": this.playerForm.value.suit1
        },
        {
          "valor":this.playerForm.value.value2,
          "palo": this.playerForm.value.suit2
        },
        {
          "valor":this.playerForm.value.value3,
          "palo": this.playerForm.value.suit3
        },
        {
          "valor":this.playerForm.value.value4,
          "palo": this.playerForm.value.suit4
        },
        {
          "valor":this.playerForm.value.value5,
          "palo": this.playerForm.value.suit5
        },
      ]
    }
    this.PlayersService.jugadas.jugadas.push(jugada)
    var res = JSON.stringify(this.PlayersService.jugadas, null, "\t")
    console.log(this.playerForm.value)
    console.log(res)
  }

  addBote(){
    var bote = this.boteForm.value.money
    this.PlayersService.jugadas.bote = bote
    var res = JSON.stringify(this.PlayersService.jugadas, null, "\t")
    console.log(res)
    this.boteForm.reset()
  }



  onReset() {
    this.playerForm.reset();
  }

}
