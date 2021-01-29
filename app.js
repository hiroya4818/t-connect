const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

app.use(
    session({
      secret: 'my_secret_key',
      resave: false,
      saveUninitialized: false,
    })
);

const connection = mysql.createConnection({
  host: 'us-cdbr-east-03.cleardb.com',
  user: 'b0219ed2100ba5',
  password: '30fc5781',
  database: 'heroku_fe357482d38a316'
});
connection.connect((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('success');
});

//ログイン状態を保存する
app.use((req, res, next) => {
  res.locals.class = req.session.class;
  res.locals.how = req.session.how;
  res.locals.name = req.session.name;
  res.locals.grade = req.session.grade;
  next();
});
//トップ画面を表示
app.get('/', (req, res) => {
  res.render('top.ejs');
});
//自分自身の所属を保存
app.get('/select/:id', (req, res) => {
  req.session.class = req.params.id;
  res.locals.class = req.session.class;
  res.render("select.ejs");
  console.log(req.session.class);
});
//授業の削除
app.get('/delete/:id',(req,res)=>{
  if(req.params.id === "1"){
    connection.query(
      "SELECT * FROM users WHERE name=?",
      [req.session.name],
      (error,results)=>{
        const lec = results[0].lec1;
//対応する授業をNULLにアップデート
        connection.query(
          "UPDATE users SET lec1=NULL WHERE lec1=?",
          [lec],
          (error,results)=>{}
        );
        connection.query(
          "UPDATE users SET lec2=NULL WHERE lec2=?",
          [lec],
          (error,results)=>{}
        );
        connection.query(
          "UPDATE users SET lec3=NULL WHERE lec3=?",
          [lec],
          (error,results)=>{}
        );
      }
    );
  }
  if(req.params.id === "2"){
    connection.query(
      "SELECT * FROM users WHERE name=?",
      [req.session.name],
      (error,results)=>{
        const lec = results[0].lec2;
        connection.query(
          "UPDATE users SET lec1=NULL WHERE lec1=?",
          [lec],
          (error,results)=>{}
        );
        connection.query(
          "UPDATE users SET lec2=NULL WHERE lec2=?",
          [lec],
          (error,results)=>{}
        );
        connection.query(
          "UPDATE users SET lec3=NULL WHERE lec3=?",
          [lec],
          (error,results)=>{}
        );
      }
    );
  }
  if(req.params.id === "3"){
    connection.query(
      "SELECT * FROM users WHERE name=?",
      [req.session.name],
      (error,results)=>{
        const lec = results[0].lec3;
        connection.query(
          "UPDATE users SET lec1=NULL WHERE lec1=?",
          [lec],
          (error,results)=>{}
        );
        connection.query(
          "UPDATE users SET lec2=NULL WHERE lec2=?",
          [lec],
          (error,results)=>{}
        );
        connection.query(
          "UPDATE users SET lec3=NULL WHERE lec3=?",
          [lec],
          (error,results)=>{}
        );
      }
    );
  }
  res.redirect("/mypage");
});
//自身の所属が保存されていないときlogout
app.use((req,res,next)=>{
  if(res.locals.class === null){
    res.redirect("/logout");
  }
  next();
});
//ログインか新規登録かを保存
app.get('/login/:id', (req, res) => {
  const errors = [];
  req.session.how = req.params.id;
  res.locals.how = req.session.how;
  res.render("login.ejs",{errors:errors});
});

app.post('/login', 
(req, res,next) => {
//空欄がないか確認
  const username = req.body.yourname;
  const email = req.body.email;
  req.session.email = email;
  const password = req.body.password;
  const grade = req.body.grade;
  const errors = [];
  if(req.session.class　=== "student"){
    if(req.session.how === "new"){
      if(username === ""){
        errors.push("名前が記入されていません")
      }
      if(email === ""){
        errors.push("メールアドレスが記入されていません")
      }
     
    }else{
      if(email === ""){
        errors.push("メールアドレスが記入されていません")
      }
    }
  }else{
    if(req.session.how === "new"){
      if(username === ""){
        errors.push("名前が記入されていません")
      }
      if(email === ""){
        errors.push("メールアドレスが記入されていません")
      }
      if(password !== "teacher"){
        errors.push("パスワードが違います")
      }
    }else{
      if(email === ""){
        errors.push("メールアドレスが記入されていません")
      }
      if(password !== "teacher"){
        errors.push("パスワードが違います")
      }
    }
  }
  if (errors.length > 0) {
    res.render('login.ejs', {errors: errors });
  } else {
    next();
  }
},
(req, res, next) => {
//メールアドレスの重複チェック
  const email = req.body.email;
  const errors = [];
  console.log("重複チェック");
  if(req.session.how === "new"){
    connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
      (error, results) => {
        console.log(results);
        if (results.length > 0) {
          errors.push('ユーザー登録に失敗しました');
          res.render('login.ejs', { errors: errors });
        } else {
          console.log("重複チェック");
          
        }
      }
    );
  }
  next();
},
(req, res) =>{
  const username = req.body.yourname;
  const email = req.body.email;
  const password = req.body.password;
  const grade = req.body.grade;
  const errors = [];
  console.log("新規登録");
  //新規登録
  if (req.session.how === "new") {
    console.log("ok");
    connection.query(
      'INSERT INTO users (class, grade, name,email) VALUES (?, ?, ?,?)',
      [req.session.class, grade, username, email],
      (error, results) => {
        req.session.name = username;
        res.locals.name = req.session.name;
        req.session.grade = grade;
        req.session.email = email;
        res.locals.grade = req.session.grade;
      }
    );
  }
  //ログイン
  connection.query(
    "SELECT * FROM users WHERE email=?",
    [email],
    (error,results)=>{
      if (results.length > 0) {
        console.log(results);
        req.session.name = results[0].name;
        res.locals.name = req.session.name;
        req.session.grade = results[0].grade;
        req.session.email = email;
        res.locals.grade = req.session.grade;
        console.log(results[0]);
        res.render("mypage.ejs",{items:results[0]});
      } else {
        errors.push('ユーザー情報が確認できません');
        res.render('login.ejs', { errors: errors });
      }
    }
  );
});
//ログイン情報に対応するデータを表示
app.get('/mypage', (req, res) => {
  const errors = [];
  res.locals.error = req.session.error;
  console.log(req.session.email);
  connection.query(
    "SELECT * FROM users WHERE email=?",
    [req.session.email],
    (error,results)=>{
      if (results.length > 0) {
        console.log("クリア");
        console.log(results);
        req.session.errror = undefined;
        res.render("mypage.ejs",{items:results[0]});
      } else {
        errors.push('ユーザー情報が確認できません');
        res.render('login.ejs', { errors: errors });
      }
    }
  );
});

//データベースから生徒情報を一覧表示
app.get("/students",(req,res)=>{
  connection.query(
    "SELECT * FROM users WHERE class='student'",
    (error,results)=>{
      res.render("students.ejs",{students:results});
    }
  );
});
//授業申請ページに移動
app.get("/request",(req,res)=>{
  res.render("request.ejs");
});
//申請された授業をユーザーデータベースに登録
app.post("/request",
(req,res,next)=>{
  console.log(req.body.date);
  const errors = [];
  const date = req.body.date.toString();
  const lec = `${req.session.grade}:${req.session.name}さん 教科:${req.body.subject} ${date}:${req.body.time}`;
  connection.query(
    "SELECT * FROM users WHERE email=?",
    [req.session.email],
    (error,results)=>{
      const status = '申請中';
      console.log("A");
      console.log(results);
      if(results[0].lec1 === null){
        connection.query(
          "UPDATE users SET lec1=? ,status1=? WHERE email=?",
          [lec,status,req.session.email],
          (error,results)=>{}
        );
      } else if(results[0].lec2 === null){
        connection.query(
          "UPDATE users SET lec2=? ,status2=? WHERE email=?",
          [lec,status,req.session.email],
          (error,results)=>{}
        );
      } else if(results[0].lec3 === null){
        connection.query(
          "UPDATE users SET lec3=? ,status3=? WHERE email=?",
          [lec,status,req.session.email],
          (error,results)=>{}
        );
      }else{
        errors.push("授業数がオーバーしています");
        req.session.error = errors[0];
        res.locals.error = req.session.error;
      }
      next();
    }
  );
},(req,res)=>{
//申請した内容を掲示板データベースに登録
  const date = req.body.date.toString();
  const lec = `${req.session.grade}:${req.session.name}さん 教科:${req.body.subject} ${date}:${req.body.time}`;
  console.log("B");
  if(req.session.error !== undefined){
    console.log("hずれ");
    res.redirect("/mypage");
  }else{
    console.log("info追加");
    connection.query(
      'INSERT INTO info (grade, name,lec) VALUES (?, ?, ?)',
      [req.session.grade, req.session.name, lec],
      (error,results)=>{
        
        res.redirect("/mypage");
      }
    );
  }
});
//掲示板データベースを一覧表示
app.get("/contents",(req,res)=>{
  connection.query(
    'SELECT * FROM info',
    (error,results)=>{
      res.render("contents.ejs",{contents:results});
    }
  );
});
//掲示板データベースから授業を選択し、自身のユーザーデータベースに追加
app.post("/contents/:id",
(req,res,next)=>{
  connection.query(
    "SELECT * FROM info WHERE id=?",
    [req.params.id],
    (error,results)=>{
      req.session.student = results[0].name;
      const lec = results[0].lec;
      const errors = [];
      connection.query(
        "SELECT * FROM users WHERE name=?",
        [results[0].name],
        (error,results)=>{
          console.log(lec);
          console.log(results[0].lec1);
          if(results[0].lec1 === lec){
            req.session.lec = "status1";
          }else if(results[0].lec2 === lec){
            req.session.lec = "status2";
          }else if(results[0].lec3 === lec){
            req.session.lec = "status3";
          }
        }
      );
      connection.query(
        "SELECT * FROM users WHERE email=?",
        [req.session.email],
        (error,results)=>{
          if(results[0].lec1 === null){
            connection.query(
              "UPDATE users SET lec1=? WHERE email=?",
              [lec,req.session.email],
              (error,results)=>{
              }
            );
          } else if(results[0].lec2 === null){
            connection.query(
              "UPDATE users SET lec2=? WHERE email=?",
              [lec,req.session.email],
              (error,results)=>{}
            );
          } else if(results[0].lec3 === null){
            connection.query(
              "UPDATE users SET lec3=? WHERE email=?",
              [lec,req.session.email],
              (error,results)=>{}
            );
          }else{
            errors.push("授業数がオーバーしています");
            req.session.error = errors[0];
            res.locals.error = req.session.error;
          }
//授業を申請していた生徒の授業状態を'申請'に変更
          if(req.session.error === undefined){
            const ok = '承認';
            console.log(req.session.lec);
            console.log(req.session.student);
            console.log("更新");
            if(req.session.lec === "status1"){
              connection.query(
                "UPDATE users SET status1='承認' WHERE name=?",
                [req.session.student],
                (errror,results)=>{}
              );
            }else if(req.session.lec === "status2"){
              connection.query(
                "UPDATE users SET status2='承認' WHERE name=?",
                [req.session.student],
                (errror,results)=>{}
              );
            }else if(req.session.lec === "status3"){
              connection.query(
                "UPDATE users SET status3='承認' WHERE name=?",
                [req.session.student],
                (errror,results)=>{}
              );
            }
          }
          next();
        }
      );
    }
  );
},(req,res)=>{
//授業の受け取りが終わったデータを掲示板データベースから削除
  if(req.session.error === undefined){
    connection.query(
      "DELETE FROM info WHERE id=?",
      [req.params.id],
      (errror,results)=>{}
    );
    console.log(req.params.id);
    res.redirect("/mypage");
  }else{
//授業の受け取りに失敗するとmypageに移動
    console.log("いっぱいです");
    console.log(req.params.id);
    res.redirect("/mypage");
  }
});
//login情報を削除し、toppageに移動
app.get("/logout",(req,res)=>{
  req.session.destroy((error)=>{
    res.redirect("/");
  });
});

var port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));