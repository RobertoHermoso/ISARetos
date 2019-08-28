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
  results : any

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

  this.http.get(this.PlayersService.rootURL+"/resultados").subscribe(
    (data: []) => {
      var acum = []
       data['result'].forEach(element => {
            acum.push(element)
      });
      this.results = acum
      console.log(this.results)
    }
  )

  }

  getIndex (list: [], element: any){
    return list.findIndex(element); 
  }

  delete(){

    let headers = new HttpHeaders().set('Content-Type','application/json');

    this.http.delete<any>(this.PlayersService.rootURL+"/jugadas", {headers: headers}).subscribe(
  
    );
    window.location.reload();
  }

  
}
