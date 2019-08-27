import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlayersService {

  jugadas = {"jugadas": 
    []
  };
  cardImage = new Map();

 
  constructor() { 

  }
}
