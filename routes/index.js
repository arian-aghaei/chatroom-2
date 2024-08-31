var express = require('express');
var router = express.Router();

var database = require('../db_connection')

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.get('/', (req, res) => {
  res.send('Hello World!')
})

router.get('/api/register', (req, res)=>{
  database.con.connect(function(err) {
    if (err) throw err;
    console.log('Connected!');
  });
})

module.exports = router;
