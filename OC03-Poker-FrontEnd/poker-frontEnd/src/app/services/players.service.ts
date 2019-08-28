import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlayersService {

  jugadas = {"jugadas": 
    []
  };
  cardImage = new Map();

  rootURL = "http://localhost:8080/Quimi11/Poker/1.0.0";

  jugadasResult = []



  constructor() { 

  }

  getUrlFromCard(card: any){

    //CLUBS

    if(card.valor=="A" && card.palo=="C"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Playing_card_club_A.svg/200px-Playing_card_club_A.svg.png"
    }
    if(card.valor=="2" && card.palo=="C"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Playing_card_club_2.svg/200px-Playing_card_club_2.svg.png"
    }
    if(card.valor=="3" && card.palo=="C"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Playing_card_club_3.svg/200px-Playing_card_club_3.svg.png"
    }
    if(card.valor=="4" && card.palo=="C"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Playing_card_club_4.svg/200px-Playing_card_club_4.svg.png"
    }
    if(card.valor=="5" && card.palo=="C"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Playing_card_club_5.svg/200px-Playing_card_club_5.svg.png"
    }
    if(card.valor=="6" && card.palo=="C"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Playing_card_club_6.svg/200px-Playing_card_club_6.svg.png"
    }
    if(card.valor=="7" && card.palo=="C"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Playing_card_club_7.svg/200px-Playing_card_club_7.svg.png"
    }
    if(card.valor=="8" && card.palo=="C"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Playing_card_club_8.svg/200px-Playing_card_club_8.svg.png"
    }
    if(card.valor=="9" && card.palo=="C"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Playing_card_club_9.svg/200px-Playing_card_club_9.svg.png"
    }
    if(card.valor=="10" && card.palo=="C"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Playing_card_club_10.svg/200px-Playing_card_club_10.svg.png"
    }
    if(card.valor=="J" && card.palo=="C"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Playing_card_club_J.svg/200px-Playing_card_club_J.svg.png"
    }
    if(card.valor=="Q" && card.palo=="C"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Playing_card_club_Q.svg/200px-Playing_card_club_Q.svg.png"
    }
    if(card.valor=="K" && card.palo=="C"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Playing_card_club_K.svg/200px-Playing_card_club_K.svg.png"
    }

    //DIAMONDS
    if(card.valor=="A" && card.palo=="D"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Playing_card_diamond_A.svg/200px-Playing_card_diamond_A.svg.png"
    }
    if(card.valor=="2" && card.palo=="D"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Playing_card_diamond_2.svg/200px-Playing_card_diamond_2.svg.png"
    }
    if(card.valor=="3" && card.palo=="D"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Playing_card_diamond_3.svg/200px-Playing_card_diamond_3.svg.png"
    }
    if(card.valor=="4" && card.palo=="D"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Playing_card_diamond_4.svg/200px-Playing_card_diamond_4.svg.png"
    }
    if(card.valor=="5" && card.palo=="D"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Playing_card_diamond_5.svg/200px-Playing_card_diamond_5.svg.png"
    }
    if(card.valor=="6" && card.palo=="D"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Playing_card_diamond_6.svg/200px-Playing_card_diamond_6.svg.png"
    }
    if(card.valor=="7" && card.palo=="D"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Playing_card_diamond_7.svg/200px-Playing_card_diamond_7.svg.png"
    }
    if(card.valor=="8" && card.palo=="D"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Playing_card_diamond_8.svg/200px-Playing_card_diamond_8.svg.png"
    }
    if(card.valor=="9" && card.palo=="D"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Playing_card_diamond_9.svg/200px-Playing_card_diamond_9.svg.png"
    }
    if(card.valor=="10" && card.palo=="D"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Playing_card_diamond_10.svg/200px-Playing_card_diamond_10.svg.png"
    }
    if(card.valor=="J" && card.palo=="D"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Playing_card_diamond_J.svg/200px-Playing_card_diamond_J.svg.png"
    }
    if(card.valor=="K" && card.palo=="D"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Playing_card_diamond_K.svg/200px-Playing_card_diamond_K.svg.png"
    }
    if(card.valor=="Q" && card.palo=="D"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Playing_card_diamond_Q.svg/200px-Playing_card_diamond_Q.svg.png"
    }

    //HEARTS

    if(card.valor=="A" && card.palo=="H"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Playing_card_heart_A.svg/200px-Playing_card_heart_A.svg.png"
    }
    if(card.valor=="2" && card.palo=="H"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Playing_card_heart_2.svg/200px-Playing_card_heart_2.svg.png"
    }
    if(card.valor=="3" && card.palo=="H"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Playing_card_heart_3.svg/200px-Playing_card_heart_3.svg.png"
    }
    if(card.valor=="4" && card.palo=="H"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Playing_card_heart_4.svg/200px-Playing_card_heart_4.svg.png"
    }
    if(card.valor=="5" && card.palo=="H"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Playing_card_heart_5.svg/200px-Playing_card_heart_5.svg.png"
    }
    if(card.valor=="6" && card.palo=="H"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Playing_card_heart_6.svg/200px-Playing_card_heart_6.svg.png"
    }
    if(card.valor=="7" && card.palo=="H"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Playing_card_heart_7.svg/200px-Playing_card_heart_7.svg.png"
    }
    if(card.valor=="8" && card.palo=="H"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Playing_card_heart_8.svg/200px-Playing_card_heart_8.svg.png"
    }
    if(card.valor=="9" && card.palo=="H"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Playing_card_heart_9.svg/200px-Playing_card_heart_9.svg.png"
    }
    if(card.valor=="10" && card.palo=="H"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Playing_card_heart_10.svg/200px-Playing_card_heart_10.svg.png"
    }
    if(card.valor=="J" && card.palo=="H"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Playing_card_heart_J.svg/200px-Playing_card_heart_J.svg.png"
    }
    if(card.valor=="K" && card.palo=="H"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Playing_card_heart_K.svg/200px-Playing_card_heart_K.svg.png"
    }
    if(card.valor=="Q" && card.palo=="H"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Playing_card_heart_Q.svg/200px-Playing_card_heart_Q.svg.png"
    }

     //SPADES

     if(card.valor=="A" && card.palo=="S"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Playing_card_spade_A.svg/200px-Playing_card_spade_A.svg.png"
    }
    if(card.valor=="2" && card.palo=="S"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Playing_card_spade_2.svg/200px-Playing_card_spade_2.svg.png"
    }
    if(card.valor=="3" && card.palo=="S"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Playing_card_spade_3.svg/200px-Playing_card_spade_3.svg.png"
    }
    if(card.valor=="4" && card.palo=="S"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Playing_card_spade_4.svg/200px-Playing_card_spade_4.svg.png"
    }
    if(card.valor=="5" && card.palo=="S"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Playing_card_spade_5.svg/200px-Playing_card_spade_5.svg.png"
    }
    if(card.valor=="6" && card.palo=="S"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Playing_card_spade_6.svg/200px-Playing_card_spade_6.svg.png"
    }
    if(card.valor=="7" && card.palo=="S"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Playing_card_spade_7.svg/200px-Playing_card_spade_7.svg.png"
    }
    if(card.valor=="8" && card.palo=="S"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Playing_card_spade_8.svg/200px-Playing_card_spade_8.svg.png"
    }
    if(card.valor=="9" && card.palo=="S"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Playing_card_spade_9.svg/200px-Playing_card_spade_9.svg.png"
    }
    if(card.valor=="10" && card.palo=="S"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Playing_card_spade_10.svg/200px-Playing_card_spade_10.svg.png"
    }
    if(card.valor=="J" && card.palo=="S"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Playing_card_spade_J.svg/200px-Playing_card_spade_J.svg.png"
    }
    if(card.valor=="K" && card.palo=="S"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Playing_card_spade_K.svg/200px-Playing_card_spade_K.svg.png"
    }
    if(card.valor=="Q" && card.palo=="S"){
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Playing_card_spade_Q.svg/200px-Playing_card_spade_Q.svg.png"
    }


  }
}
