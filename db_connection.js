var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "arian",
    password: "password",
    database: "node"
});

exports.con;

con.connect(function(err) {
    if (err) throw err;
    console.log('Connected!');

});