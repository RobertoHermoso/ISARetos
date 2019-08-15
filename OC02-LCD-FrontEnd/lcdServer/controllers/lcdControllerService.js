'use strict'

module.exports.searchInventory = function searchInventory(req, res, next) {
  var t = req.t.value
  var n = req.n.value


  /**
 * 
 * @param {Integer} t - Nubmer of lines
 * @param {Integer} n - The numbers to convert in to LCD format
 * 
 */

function lcdNumber(t, n){

  var number = n.toString();


  var res = "";

  var sections = 5

  var max = number.length;

  console.log(number)
  while (sections>0) {

  //Odds numbers
  if(sections%2==1){
      for (let index = 0; index < number.length; index++) {
          var currentNumber = number[index];

          if(currentNumber==2 || currentNumber==3 || currentNumber==5 || currentNumber==6  || currentNumber==8
              || currentNumber==9 || currentNumber==0){
                  if(currentNumber==0 && sections ==3){

                  }else { 
                      res += "&nbsp;&nbsp;"
                      res += "-".repeat(t)
                      res += "&nbsp;&nbsp;"
                  }
              }  

          if(sections==5){
              if(currentNumber==7){
                  res += "&nbsp;&nbsp;"
                  res += "-".repeat(t)
                  res += "&nbsp;&nbsp;"
              }
          }
          if(sections==3){
              if(currentNumber==4){

                  res += "&nbsp;&nbsp;"
                  res += "-".repeat(t)
                  res += "&nbsp;&nbsp;"
              }
          }

          if((sections==5 || sections==1) && currentNumber==4){
              res += "&nbsp;&nbsp;"
              res+="&nbsp;".repeat(t)
              res += "&nbsp;&nbsp;"
          }
          
          if((sections==1 || sections==3) && currentNumber==7){
              res += "&nbsp;&nbsp;"
              res+="&nbsp;".repeat(t)
              res += "&nbsp;&nbsp;"
          }
          
          if(index+1===max){
                  res+= "\n"
          }



          if(currentNumber == 1){
              res += "&nbsp;".repeat(t-1)
              res+="&nbsp;".repeat(t)
              res += "&nbsp;"
          }
      }
  }
      //Pairs sections
      if(sections%2==0){
          var vert = ""
          for (let index = 0; index < number.length; index++) {
              currentNumber = number[index];
              if(currentNumber==1){
                  vert+= "&nbsp;".repeat(t)
                  vert+= "|"
                  vert+= "&nbsp;".repeat(t)
              }
              //Section 4
              if(sections==4){

              if(currentNumber==2 || currentNumber==3 || currentNumber==7){
                  vert+= "&nbsp;".repeat(t)
                  vert += "&nbsp;|&nbsp;&nbsp;"
              }
              else if(currentNumber==4 || currentNumber==8 || currentNumber==9 || currentNumber==0){
                  vert += "|"
                  vert += "&nbsp;".repeat(t)
                  vert += "|&nbsp;&nbsp;"

              }else if(currentNumber==5 || currentNumber ==6){
                  vert += "|&nbsp;&nbsp;"
                  vert += "&nbsp;".repeat(t+1)
              }
           
          }
              //Section 2
              if(sections==2){
              if(currentNumber==2){
                  vert += "|&nbsp;"
                  vert+= "&nbsp;".repeat(t+1)
              }
              else if(currentNumber==3 || currentNumber ==4 || currentNumber ==5 || currentNumber==7 || currentNumber==9){
                  vert += "&nbsp;".repeat(t)
                  vert += "&nbsp;&nbsp;|&nbsp;"
              }else if (currentNumber==6 || currentNumber==8 || currentNumber==0)  {
                  vert += "&nbsp;|"
                  vert += "&nbsp;".repeat(t)
                  vert += "|&nbsp;"
              }
          }
          if(index+1 == number.length){
              vert+="\n"
          }
      }
      res+=vert.repeat(t)
  }

  


      sections--
  }
  console.log(res)
  return res;

}

  var result = lcdNumber(t,n)
  res.send({
    result
  });
};