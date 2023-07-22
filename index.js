const express = require("express");
const app = express();
const port = 3001;
const sqlite3 = require("sqlite3").verbose();
const userRoutes = require("./routes/user");
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);
app.set("view engine", "ejs");

var logged = false; // or true

//items in the global namespace are accessible throught out the node application
global.db = new sqlite3.Database("./database.db", function (err) {
  if (err) {
    console.error(err);
    process.exit(1);
  } else {
    console.log("Database connected");
    global.db.run("PRAGMA foreign_keys=ON");
  }
});

global.db.run("DROP TABLE IF EXISTS users", (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  } else {
    global.db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        email TEXT,
        password TEXT
      )
    `);
    console.log("users table created.");
  }
});

global.db.run("DROP TABLE IF EXISTS articles", (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  } else {
    global.db.run(`
      CREATE TABLE articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        published BOOLEAN
      )
    `);
    console.log("artiles table created.");
  }
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Perform database query to check if the username and password are correct
  global.db.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error occurred during login");
      } else {
        if (row) {
          // Correct username and password, redirect to mypage
          logged=true;
          res.redirect("/mypage");               
        } else {
          // Incorrect username or password, redirect to createaccount
          res.redirect("/createaccount");
        }
      }
    }
  );
});

app.post("/create-article", (req, res) => {
  const title = req.body.title;
  const description = req.body.description;

  // Perform database query
  global.db.run(
    "INSERT INTO articles (title, description) VALUES (?, ?)",
    [title, description],
    (err) => {
      if (err) {
        console.error(err);
        // Handle the error case here
      } else {
        // No errors, so redirect to the main page
        res.redirect("/mypage");
      }
    }
  );
});

app.get("/", (req, res) => {
  // Perform a database query to fetch all articles
  global.db.all("SELECT * FROM articles", (err, rows) => {
    if (err) {
      console.error(err);
      // Handle the error case here
    } else {
      // Render the "main" view and pass the articles as a variable
      res.render("main", { articles: rows });
    }
  });
});

app.get("/mypage", (req, res) => {
  // Perform a database query to fetch all articles
  global.db.all("SELECT * FROM articles", (err, rows) => {
    if (err) {
      console.error(err);
      // Handle the error case here
    } else {
      // Render the "mypage" view and pass the articles as a variable
      //res.render("mypage", { articles: rows });
      res.render("mypage", { articles: rows, logged: logged }); //changed
    }
  });
});

app.get("/createaccount", (req, res) => {
  res.render("createaccount");
});

app.post("/user/create-user-record", (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  global.db.run(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, password],
    (err) => {
      if (err) {
        console.error(err);
        // Handle the error case here
      } else {
        // No errors, so redirect to the main page
        res.redirect("/mypage");       
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
