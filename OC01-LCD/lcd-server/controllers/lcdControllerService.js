'use strict'

module.exports.searchInventory = function searchInventory(req, res, next) {
  var t = req.t.value
  var n = req.n.value
  console.log(n)
  res.send({
    message: 'This is the mockup controller for patata' + n

  });
};