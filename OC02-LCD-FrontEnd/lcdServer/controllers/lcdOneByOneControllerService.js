'use strict'

module.exports.funclcdOneByOneGET = function funclcdOneByOneGET(req, res, next) {

  var t = req.t.value
  var n = req.n.value


/**
 * 
 * @param {Integer} t - Nubmer of lines
 * @param {Integer} n - The numbers to convert in to LCD format
 * 
 */

function lcdNumberOneByOne(t, n){

  var number = n.toString();

  var whiteSpace = "&nbsp;";


  var res = [];



  for (let index = 0; index < number.length; index++) {
      var currentNumber = number[index];

      var acum = "";
      var sections = 5
      while (sections>0) {
      if(sections%2==1){
          if(currentNumber==2 || currentNumber==3 || currentNumber==5 || currentNumber==6  || currentNumber==8
              || currentNumber==9 || currentNumber==0){
                  if(currentNumber==0 && sections ==3){

                  }else { 
                      acum += whiteSpace+ whiteSpace
                      acum += "-".repeat(t)
                      acum += whiteSpace+whiteSpace
                  }
              }  

          if(sections==5){
              if(currentNumber==7){
                  acum += whiteSpace+whiteSpace
                  acum += "-".repeat(t)
                  acum += whiteSpace+whiteSpace
              }
          }
          if(sections==3){
              if(currentNumber==4){

                  acum += whiteSpace+whiteSpace
                  acum += "-".repeat(t)
                  acum += whiteSpace+whiteSpace
              }
          }

          if((sections==5 || sections==1) && currentNumber==4){
              acum += whiteSpace+whiteSpace
              acum+=whiteSpace.repeat(t)
              acum += whiteSpace+whiteSpace
          }
          
          if((sections==1 || sections==3) && currentNumber==7){
              acum += whiteSpace+whiteSpace
              acum+=whiteSpace.repeat(t)
              acum += whiteSpace+whiteSpace
          }
          
          

          if(currentNumber == 1){
              acum += whiteSpace.repeat(t-1)
              acum+=whiteSpace.repeat(t)
              acum += whiteSpace
          }
              
          acum+= "\n"

      }

          //Pair Sections
          if(sections%2==0){
              var vert = ""

              if(currentNumber==1){
                  vert+= whiteSpace.repeat(t)
                  vert+= "|"
                  vert+= whiteSpace.repeat(t)
              }
              //Section 4
              if(sections==4){

              if(currentNumber==2 || currentNumber==3 || currentNumber==7){
                  vert+= whiteSpace.repeat(t)
                  vert += whiteSpace+whiteSpace+"|"+whiteSpace+whiteSpace
              }
              else if(currentNumber==4 || currentNumber==8 || currentNumber==9 || currentNumber==0){
                  vert += "|"
                  vert += whiteSpace.repeat(t)
                  vert += "|"+whiteSpace+whiteSpace

              }else if(currentNumber==5 || currentNumber ==6){
                  vert += whiteSpace+"|"+whiteSpace+whiteSpace
                  vert += whiteSpace.repeat(t+1)
              }
           
          }
              //Section 2
              if(sections==2){
              if(currentNumber==2){
                  vert += whiteSpace+"|"
                  vert+= whiteSpace.repeat(t+1)
              }
              else if(currentNumber==3 || currentNumber ==4 || currentNumber ==5 || currentNumber==7 || currentNumber==9){
                  vert += whiteSpace.repeat(t)
                  vert += whiteSpace+whiteSpace+"|"+whiteSpace
              }else if (currentNumber==6 || currentNumber==8 || currentNumber==0)  {
                  vert += whiteSpace+"|"
                  vert += whiteSpace.repeat(t)
                  vert += "|"+whiteSpace
              }
          }
 
              vert+="\n"
              acum+=vert.repeat(t)
          }
          sections--;
          if(sections==0){
              res.push(acum);
          }

      }

  }

  res.forEach(element => {
      console.log(element)
  });
  
  return res;

}
  var result = lcdNumberOneByOne(t, n)

  res.send({
    result
  });
};