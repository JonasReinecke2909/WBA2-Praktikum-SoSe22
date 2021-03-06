const express = require('express');
const { path } = require('express/lib/application');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
var router = express.Router();
const app = express();
var db = require('../database');
const { json } = require('express/lib/response');
const { hash } = require('bcrypt');
const req = require('express/lib/request');
const cookieParser = require("cookie-parser");
>>>>>>> c940447cb2187b5d0c1888a8e3df71941c7cc876

app.use(express.static('public'));

app.use(cookieParser());

//router.get('/', function(req, res, next) {

//res.render('index', { title: 'Express' });
//res.sendFile(__dirname + '/html/home.html');
//res.sendFile(__dirname + '/html/header.js')
//res.sendFile(__dirname + '/html/lib/style.css');
//});

router.use((req, res, next) => {
  console.log(req.cookies)
  if (req.cookies.sessionid){
    var user = ""
    var sql = "SELECT * FROM usersessions WHERE id = '" + req.cookies.sessionid + "';"
    var params = [];
    db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(400).json({ "error": err.message });
        return;
      }
      if (rows.length == 0){

      }
    });
  }
  next()
});

router.post("/new_user", async (req, res) => {
  let jsonData = req.body;
  let new_id = nanoid();
  let new_join_date = new Date().toISOString().slice(0, 10);
  let profilepicturepath = "/default";

  const salt = await bcrypt.genSalt(2);
  const hashed_password = await bcrypt.hash(jsonData.password, salt);

  var sql = "insert into users (id, firstname, lastname, email, username, passwordhash, joindate, profilepicturepath ) VALUES ('" + new_id + "', '" + jsonData.first_name + "', '" + jsonData.last_name + "','" + jsonData.email + "','" + jsonData.username + "','" + hashed_password + "','" + new_join_date + "','" + profilepicturepath + "');"
  var params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.sendStatus(200);
  });
});

router.post("/new_session", async (req, res) => {
  let jsonData = req.body;
  let user = jsonData.username;
  let password = jsonData.password;

  var sql = "SELECT * FROM users WHERE username = '" + user + "';"
  var params = [];
  db.all(sql, params, async (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    if (rows.length == 0){
      res.status(200).json({"status":"usrwrong"});
      res.send;
      return;
    }
    if (await bcrypt.compare(password, rows[0].passwordhash)) {
      let new_session_id = nanoid();
      let new_user_id = rows[0].id;
      let new_start_time = Date.now()
      let new_end_time = new_start_time + 120000
      var sql = "INSERT INTO usersessions (id, userId, startTime, endTime) VALUES ('" + new_session_id + "', '" + new_user_id + "', '" + new_start_time + "', '" + new_end_time + "');"
      var params = [];
      db.all(sql, params, (err, new_rows) => {
        output = {
          "sessionid": new_session_id,
          "startTime": new_start_time,
          "endTime": new_end_time,
          "status": "correct"
        };
        res.status(200).json(output);
      });
    }
    else{
      res.status(200).json({"status": "pwwrong"});
      res.send;
    }
  });
});

router.post("/new_question", async (req, res) => {
  let jsonData = req.body;
  let new_question_id = nanoid();
  let new_date_posted = new Date().toISOString().slice(0, 10);
  let userid = "default"; //Folgt noch
  let upvotes = 0;
  let downvotes = 0;

  var sql = "insert into questions (id, userid, questiontext, explanation, dateposted, upvotes, downvotes, categorie) VALUES ('" + new_question_id + "', '" + userid + "', '" + jsonData.question + "','" + jsonData.explanation + "','" + new_date_posted + "','" + upvotes + "','" + downvotes + "','" + jsonData.categorie + "');"
  var params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.sendStatus(200);
  });
});

router.post("/questions", (req, res) => {
  let jsonData = req.body;
  var sql = "SELECT * FROM questions WHERE categorie = '" + jsonData.categorie + "';"
  var params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.send(JSON.stringify(rows));
  });
});

router.post("/like", (req, res) => {
  let jsonData = req.body;
  var sql = "UPDATE questions SET upvotes=upvotes+1 WHERE id = '" + jsonData.id + "';"
  var params = [];
  db.all(sql, params, (err, rows) => {
    if(err) {
      res.status(400).json({"error": err.message});
      return;
    }
    res.sendStatus(200);
  });
});

router.post("/dislike", (req, res) => {
  let jsonData = req.body;
  var sql = "UPDATE questions SET downvotes=downvotes+1 WHERE id = '" + jsonData.id + "';"
  var params =[];
  db.all(sql, params, (err, rows) => {
    if(err) {
      res.status(400).json({"error": err.message});
      return;
    }
    res.sendStatus(200);
  });
});

module.exports = router;
