import { Component, OnInit } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http'
import { PlayersService } from '../../services/players.service'

@Component({
  selector: 'app-plays-and-result',
  templateUrl: './plays-and-result.component.html',
  styleUrls: ['./plays-and-result.component.css']
})
export class PlaysAndResultComponent implements OnInit {

  jugadasResult : any

  constructor(public PlayersService : PlayersService ,private http: HttpClient ) { }

  ngOnInit() {
    
  this.http.get(this.PlayersService.rootURL+"/jugadas").subscribe(
    (data: []) => {
      var acum = []
       data['partida'].forEach(element => {
            acum.push(element)
      });
      this.jugadasResult = acum
      console.log(this.jugadasResult)
    }
  )

  }

  getIndex (list: [], element: any){
    return list.findIndex(element); 
  }

  
}
