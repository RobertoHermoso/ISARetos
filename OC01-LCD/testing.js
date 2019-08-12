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
                        res += "  "
                        res += "-".repeat(t)
                        res += "  "
                    }
                }  

            if(sections==5){
                if(currentNumber==7){
                    res += "  "
                    res += "-".repeat(t)
                    res += "  "
                }
            }
            if(sections==3){
                if(currentNumber==4){

                    res += "  "
                    res += "-".repeat(t)
                    res += "  "
                }
            }

            if((sections==5 || sections==1) && currentNumber==4){
                res += "  "
                res+=" ".repeat(t)
                res += "  "
            }
            
            if((sections==1 || sections==3) && currentNumber==7){
                res += "  "
                res+=" ".repeat(t)
                res += "  "
            }
            
            if(index+1===max){
                    res+= "\n"
            }



            if(currentNumber == 1){
                res += " ".repeat(t-1)
                res+=" ".repeat(t)
                res += " "
            }
        }
    }
        //Pairs sections
        if(sections%2==0){
            var vert = ""
            for (let index = 0; index < number.length; index++) {
                currentNumber = number[index];
                if(currentNumber==1){
                    vert+= " ".repeat(t)
                    vert+= "|"
                    vert+= " ".repeat(t)
                }
                //Section 4
                if(sections==4){

                if(currentNumber==2 || currentNumber==3 || currentNumber==7){
                    vert+= " ".repeat(t)
                    vert += " |  "
                }
                else if(currentNumber==4 || currentNumber==8 || currentNumber==9 || currentNumber==0){
                    vert += "|"
                    vert += " ".repeat(t)
                    vert += "|  "

                }else if(currentNumber==5 || currentNumber ==6){
                    vert += "|  "
                    vert += " ".repeat(t+1)
                }
             
            }
                //Section 2
                if(sections==2){
                if(currentNumber==2){
                    vert += "| "
                    vert+= " ".repeat(t+1)
                }
                else if(currentNumber==3 || currentNumber ==4 || currentNumber ==5 || currentNumber==7 || currentNumber==9){
                    vert += " ".repeat(t)
                    vert += "  | "
                }else if (currentNumber==6 || currentNumber==8 || currentNumber==0)  {
                    vert += " |"
                    vert += " ".repeat(t)
                    vert += "| "
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

}

/**
 * 
 * @param {Integer} section           - There are 5 sections in LCD format
 * @param {Integer} currentNumber     - The current number that we are going to formatter in LCD
 * @param {Integer} t                 - The number of lines
 * @param {String} res                - The result
 * @param {Integer} index             - The current number position, if it is the last we are going to write \n
 * @param {Integer} max               - The lenght of the numbers
 */
function aux(section, currentNumber, t, res, index, max){
    if((currentNumber==2 || currentNumber===3 || currentNumber===5 || currentNumber===6 || currentNumber===7 || currentNumber===8
        || currentNumber===9 || currentNumber===0) && section%2==1){
            if(section!==3 && currentNumber!==0){
                res+= "-"*t + "     "
                console.log(res)
            }
        }

    if(index+1===max){
        res+= "\n"
    }
        return res;
}

function repeatStringNumTimes(string, times) {
    var repeatedString = "";
    while (times > 0) {
      repeatedString += string;
      times--;
    }
    return repeatedString;
  }

lcdNumber(6,1234567809);