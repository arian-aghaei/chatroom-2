var express = require('express');
var router = express.Router();

var database = require('../db_connection')


/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.get('/', (req, res) => {
  res.json({message: "done"})
})

router.get('/api/register', (req, res)=>{
  // var sql = "CREATE TABLE Users (id , name VARCHAR(100), username VARCHAR(50), email)";
  var sql = "select * from users;";
  database.query(sql, function (err, result) {
    if (err) throw err;

    res.header('Content-Type','application/json')
    res.end(JSON.stringify(result))
  });
})

module.exports = router;
