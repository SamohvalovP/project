const express = require("express");
const app = express();
const port = 3001;
const sqlite3 = require("sqlite3").verbose();
const userRoutes = require("./routes/user");
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);
app.set("view engine", "ejs");

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

    createArticlesTable(); // Call the function to create the "articles" table
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
          res.redirect("/mypage");
        } else {
          // Incorrect username or password, redirect to createaccount
          res.redirect("/createaccount");
        }
      }
    }
  );
});

app.get("/", (req, res) => {
  res.render("main");
});

app.get("/mypage", (req, res) => {
  res.render("mypage");
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
        res.render("main");
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

function createArticlesTable() {
  global.db.run(`
    CREATE TABLE articles (
      title_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      published BOOLEAN,
      article_text TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    } else {
      console.log("articles table created.");
      // Continue with other code or operations
    }
  });
}
