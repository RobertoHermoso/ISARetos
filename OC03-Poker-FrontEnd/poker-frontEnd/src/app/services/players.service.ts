import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlayersService {

  jugadas = {"jugadas": 
    []
  };

  constructor() { }
}
