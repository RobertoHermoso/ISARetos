import { Component, OnInit, ElementRef } from '@angular/core';

import {PlayersService} from '../../services/players.service'

import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http'

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {

  constructor(private PlayersService: PlayersService, private http: HttpClient ,private myScrollContainer: ElementRef) {



   }
  ngOnInit() {
  }

  addGame(){
    let headers = new HttpHeaders().set('Content-Type','application/json');

    this.http.post<any>(this.PlayersService.rootURL+"/jugadas" , this.PlayersService.jugadas , {headers: headers}).subscribe(
      res=> console.log(res)
    );
    window.location.reload();
    this.scrollToBottom();      
  }

  scrollToBottom(): void {
    try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }                 
}
  

}
