const express = require('express');
const { path } = require('express/lib/application');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
//var router = express.Router();
const app = module.exports = express();
var db = require('../database');
const { json } = require('express/lib/response');
const { hash } = require('bcrypt');
const req = require('express/lib/request');
const cookieParser = require("cookie-parser");

app.use(express.static('public'));

app.use(cookieParser());

app.use("/", (req, res, next) => {
  sessionId = req.cookies.sessionid
  if (sessionId){
    var sql = "SELECT * FROM usersessions WHERE id = '" + req.cookies.sessionid + "';"
    var params = [];
    db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(400).json({ "error": err.message });
        return;
      }
      if (rows.length == 0){
        userid = "0"
      }
      else {
        if (parseInt(rows[0].endTime) < Date.now()){
          console.log(String(sessionId) + " - Session already ended")
          userid = "0"
        }
        else if (parseInt(rows[0].startTime) > Date.now()){
          console.log(String(sessionId) + " - Session hasn't started yet")
          userid = "0"
        }
        else{
          console.log(String(sessionId) + " - Valid Session")
          userid = rows[0].userId
        }
      }
      req.body.sessionUserId = userid
      next()
    });
  }
});

app.post("/new_user", async (req, res) => {
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

app.post("/new_session", async (req, res) => {
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
      let new_end_time = new_start_time + 1200000
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

app.post("/new_question", async (req, res) => {
  console.log(req.body)
  let jsonData = req.body;
  let new_question_id = nanoid();
  let new_date_posted = new Date().toISOString().slice(0, 10);
  let userid = req.body.sessionUserId;
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

app.post("/questions", (req, res) => {
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

app.post("/like", (req, res) => {
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

app.post("/dislike", (req, res) => {
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
