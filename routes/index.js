var express = require('express');
const bodyParser = require('body-parser');
const { generateToken } = require('../jwtUtils');
const { body, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var router = express.Router();

var database = require('../db_connection')

// Middleware
router.use(bodyParser.json());

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.get('/', (req, res) => {
  res.json({message: "done"})
})

router.post('/api/register', [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('username').trim().isLength({min:6}),
    body('password').trim().isStrongPassword()
],async (req, res)=>{
  // console.log(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, username, email, password } = req.body;

    var date = new Date().toISOString().
    replace(/T/, ' ').
        replace(/\..+/, '') ;

    var sql = "INSERT INTO users (name, email, username, password, created_at, last_interaction) " +
        "values ('"+name+"','"+email+"','"+username+"','"+password+"','"+date+"','"+date+"'); ";

    var token = generateToken({username: email, password: password});

    var hashed = await bcrypt.hash(token, saltRounds);

    database.query(sql, function (err, result){

        if(err)
        {
            res.status(400).send(err).end();
            return;
        }

        sql = "select id from users where username = '" + username + "';";

        database.query(sql, function (err, result){
            var id = result[0].id;

            sql = "INSERT INTO tokens (user_id, token, created_at) " +
                "values ('"+ id + "','"+ hashed + "','"+ date +"');";

            database.query(sql, function (err, result){
                if (err) {
                    res.status(400).end(err);
                    return;
                }

                sql = "select id from tokens where token = '" + hashed + "';";
                database.query(sql, function (err, result){
                    id = result[0].id;

                    var token2 = id + '|' + token;
                    res.status(200).json({ message: 'Registration successful', token: token2 });
                })
            })

        })
    })
})

router.post('/api/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').trim()
], (req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    var date = new Date().toISOString().
    replace(/T/, ' ').
    replace(/\..+/, '') ;

    var sql = "select id from users where email = '" + email + "' and password = '"+ password +"';";

    database.query(sql, function (err, result){
        if (err) return res.status(400).json({errors: err});

        if (!result[0].id) return res.status(400).json({errors: "user does not exist or wrong password!"});
        var id = result[0].id;
        var sql = "UPDATE users set last_interaction = '"+ date +"' where email = '"+ email +"';";
        database.query(sql,async function (err, result){
            if (err) return res.status(400).json({errors: err});

            var token = generateToken({username: email, password: password});

            var hashed = await bcrypt.hash(token, saltRounds);

            sql = "INSERT INTO tokens (user_id, token, created_at) " +
                "values ('"+ id + "','"+ hashed + "','"+ date +"');";

            database.query(sql, function (err, result) {
                if (err) {
                    return res.status(400).end(err);
                }

                sql = "select id from tokens where token = '" + hashed + "';";
                database.query(sql, function (err, result){
                    id = result[0].id;

                    var token2 = id + '|' + token;
                    res.status(200).json({ message: 'Login successful', token: token2 });
                })
            })
        })
    })

})

module.exports = router;
