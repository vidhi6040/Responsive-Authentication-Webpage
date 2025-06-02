const express = require("express");
const session = require("express-session");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT =  4000;

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "vidhireet",
    database: "auth_db"
});
con.connect((err) => {
    if (err) throw err;
    console.log("Connected to Server.");
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: "key",
    resave: false,
    saveUninitialized: true
}));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/register", (req, res) => {
    const {Username, Email, Password} = req.body;
    if(!Username || !Email || !Password)
    {
        return res.send("Please fill all fields.");
    }
    con.query("SELECT * FROM userTable WHERE Name = ?", [Username], (err, results) => {
        if (err) throw err;
        if(results.length > 0)
        {
            return res.send("User already exists.");
        }
        con.query("INSERT INTO userTable (Name, Email, Password) VALUES (?, ?, ?)", [Username, Email, Password], (err) => {
            if (err) throw err;
            res.redirect("/login.html");
        });
    });
});

app.post('/login', (req, res) => {
    const {Username, Password} = req.body;
    if(!Username || !Password)
    {
        return res.send("Please fill all fields");
    }
    con.query("SELECT * FROM userTable WHERE Name = ?", [Username], (err, results) => {
        if (err) throw err;
        if (results.length === 0)
        {
            return res.send("Invalid Username or Password");
        }
        const user = results[0];
        if(Password == user.Password)
        {
            req.session.user = user.Name;
            res.redirect("/welcome.html");
        }
        else
        {
            res.send("Invalid Username or Password");
        }
    });
});

app.get("/welcome", (req, res) => {
    if(req.session.user)
    {
        res.sendFile(path.join(__dirname, "public", "welcome.html"));
    }
    else {
    res.redirect("/login.html");
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login.html");
    });
});

app.listen(PORT, () => {
    console.log("Server running on port http://localhost:4000");
})
