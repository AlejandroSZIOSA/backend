import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
//DB
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

const app = express();

let USER_ID = 102;
let ACCOUNT_ID = 2;

const PORT = 4000; //server port

// Middleware
app.use(cors());

app.use(bodyParser.json());

//DB* 2- CONNECTION TO THE SQL DB
//use login INFO from the DB page

const pool = mysql.createPool({
  host: "localhost", //info from the DB page
  user: "root", //info from the DB page
  password: "root", //info from the DB page
  database: "bank2", //info from the DB page
  port: 8889, //info from the DB page
});

//DB* 3- HELP FUNCTION TO MAKE CODE LOOK NICER / async + await
async function query(sql, params) {
  //get results
  const [results] = await pool.execute(sql, params);
  return results;
}

// Generera engångslösenord
function generateOTP() {
  // Generera en sexsiffrig numerisk OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

// Din kod här. Skriv dina arrayer
const users = [{ id: 101, username: "gato", password: "123" }];

const accounts = [{ id: 1, userId: 101, amount: 3 }];
const sessions = [{ userId: 101, token: "777" }];

// Din kod här. Skriv dina routes:

//DB* 1- CREATE USER API WITH DB / async + await
app.post("/users", async (req, res) => {
  //DB* 4 ACCESS TO DB
  //4.1
  const { username, password } = req.body;

  //DB*5 KRYPTERING PASSWORD
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log(hashedPassword);

  //4.3 try catch
  try {
    //4.2 - Anti-hacker Security DB /await async
    const result = await query(
      //In SQL DB
      "INSERT INTO users(username,password) VALUES (?,?)",
      [username, hashedPassword] //Change password to hashedPassword
    );
    //4.4 Code 201 is something good to React
    res.status(201).send("User created");
  } catch (e) {
    console.error("Error creating user");
    //4.5 Code 500 is something bad
    res.status(500).send("Error creating user");
  }
});

//CREATE USER

/* app.post("/users", (req, res) => {
  const data = req.body; //data from the client
  const { username, password } = data;

  const newUser = { id: USER_ID++, username, password };
  const newUserAccount = { id: ACCOUNT_ID++, userId: newUser.id, amount: 0 };

  users.push(newUser);
  accounts.push(newUserAccount);

  res.send("User created");
}); */

//DB* 6 - LOGIN WITH DB
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  //6.1 search user that matches username
  const result = await query("SELECT * FROM users WHERE username=?", [
    username,
  ]);
  console.log("result", result);
  const user = result[0];

  //6.2 compare password with hashed password / bcrypt

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    //code for wrong password :)
    return res.status(401).send("Invalid password");
  }
  //no status code will be by default 200 Good
  res.send("login success");
});

//LOGIN USER + return one password for login

/* app.post("/sessions", (req, res) => {
  const data = req.body; //data from the client

  const { username, password } = data;

  for (let i = 0; i < users.length; i++) {
    if (username == users[i].username && password == users[i].password) {
      const token = generateOTP();
      sessions.push({ userId: users[i].id, token: token });

      return res.send(token); //Return a token
    }
  }
  res.send(false);
}); */

//SHOW USER ACCOUNT AMOUNT
app.post("/me/accounts", (req, res) => {
  const data = req.body; //data from the client

  const { token } = data;
  /* console.log(token); */
  let userId = "not found";

  let amount = "not found";

  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i].token === token) {
      userId = sessions[i].userId;
      for (let j = 0; j < accounts.length; j++) {
        if (userId === accounts[j].userId) {
          amount = accounts[j].amount;
        }
      }
    }
  }
  res.send(JSON.stringify({ userId, amount }));
});

//MANAGE USER ACCOUNT
app.post("/me/accounts/transactions", (req, res) => {
  const data = req.body; //data from the client
  const { token, newAmount } = data;

  /* console.log(userId); */

  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i].token === token) {
      for (let j = 0; j < accounts.length; j++) {
        if (sessions[i].userId === accounts[j].userId) {
          accounts[j].amount = newAmount;
        }
      }
    }
  }
  console.log("Accounts = ", accounts);
  res.send("Transaction Done");
});

// Starta servern
app.listen(PORT, () => {
  console.log(`Bankens backend körs på http://localhost:${PORT}`);
});
