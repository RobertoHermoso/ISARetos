var minValue = 0.0001
var operators = ["==", ">=", "<=", ">", "<"];

//This function return the values that grafana dashboard needs to represent the data
module.exports.graphThresholds = graphThresholds;
function graphThresholds(threshold, operation) {
    var configResult = {}
    threshold = parseInt(threshold.trim())
    if (operation == "==") {
        configResult["threshold"] = [(threshold - minValue) , (threshold + minValue)]
        configResult["colors"] = ["#e24d42", "#508642", "#e24d42"]
        return configResult
    }
    if (operation == ">=") {
        configResult["threshold"] = [threshold]
        configResult["colors"] = ["#e24d42", "#508642"]
        return configResult
    }
    if (operation == "<=") {
        configResult["threshold"] = [(threshold + minValue)]
        configResult["colors"] = ["#508642", "#e24d42"]
        return configResult
    }
    if (operation == ">") {
        configResult["threshold"] = [(threshold + minValue)]
        configResult["colors"] = ["#e24d42", "#508642"]
        return configResult
    }
    if (operation == "<") {
        configResult["threshold"] = [threshold - minValue]
        configResult["colors"] = ["#508642", "#e24d42"]
        return configResult
    }
    return {};
}


// This function returns a object with the value result, the threshold, if is fullfilled or not, and the operation used
module.exports.calculateObjective = calculateObjective;
function calculateObjective(objective, values) {
    var result = {};
    var op = calculateOperator(objective)
    var objectiveLeft = objective.split(op)[0];
    var limit = objective.split(op)[1];
    if (isNaN(limit)) {
        if (op.includes("<")){
            objectiveLeft = limit  + " - " + objectiveLeft;
        }
        else{
            objectiveLeft = objectiveLeft + " - " + limit;
        }
        limit = "0";
    }
    var threshold = parseInt(limit)
    var resultQuery = objectiveLeft;
    for (const [metric, value] of Object.entries(values)) {
        resultQuery = resultQuery.split(metric).join(value).toString();
        
    }
    var value = eval(resultQuery)
    return { value: value, threshold: threshold, fullfilled: eval(value + op + limit), operation: op, }

}

module.exports.calculateOperator = calculateOperator;
function calculateOperator(objective) {
    var result = {};
    for (const op of operators) {
        if (objective.split(op).length > 1) {
            return op
        } 
    }
    return result;
}
