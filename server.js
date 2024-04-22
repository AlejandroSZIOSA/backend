import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
//DB
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

const app = express();
const PORT = 4000; //server port

// Middleware
app.use(cors());
app.use(bodyParser.json());

//ENVIRONMENT VARIABLE
dotenv.config();
const dbPassword = process.env.DB_PASSWORD;

//DB* 2- CONNECTION TO THE SQL DB
//use login INFO from the DB page

const pool = mysql.createPool({
  host: "localhost", //info from the DB page
  user: "root", //info from the DB page
  password: dbPassword, //info from the DB page
  database: "bank2", //info from the DB page
  port: 8891, //info from the DB page - NOTE:Check the port number in MAMP before to connect to Frontend
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
const sessions = []; //CONTAIN THE RANDOM TOKEN FOR THE CURRENT SESSION(LOGIN)

// Din kod här. Skriv dina routes:

//DB* 1- CREATE USER API WITH DB / async + await
app.post("/users", async (req, res) => {
  //4.3 try catch
  try {
    //DB* 4 ACCESS TO DB
    //4.1
    const { username, password } = req.body;
    let createdUserId;
    //DB*5 KRYPTERING PASSWORD
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //4.2 - Anti-hacker Security DB /await async
    const result = await query(
      //In SQL DB
      "INSERT INTO users(username,password) VALUES (?,?)",
      [username, hashedPassword] //Change password to hashedPassword
    );
    createdUserId = result.insertId;

    //CREATE A NEW ACCOUNT
    const dbResults = await query(
      "INSERT INTO accounts(userId, amount)VALUES (?, ?)",
      [createdUserId, 0]
    );

    //4.4 Code 201 is something good to React
    console.log("user Created");
    res.send("New User and Account created");
  } catch (e) {
    res.status(500).send("Error creating user and Account");
  }
});

//DB* 6 - LOGIN WITH DB
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    //6.1 search user that matches username
    const result = await query("SELECT * FROM users WHERE username=?", [
      username,
    ]);
    const user = result[0];

    //6.2 compare password with hashed password / bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.send(false);
    }
    const token = generateOTP();
    sessions.push({ userId: user.id, token: token });
    console.log("User login");
    res.send(token);
  } catch (e) {
    res.send(e.message);
  }

  /* console.log(sessions); */
});

//DB* 8 SHOW USER ACCOUNT AMOUNT WITH DB

app.post("/me/accounts", async (req, res) => {
  const data = req.body; //data from the client
  const { token } = data;

  let userId = false;
  let amount = false;

  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i].token === token) {
      userId = sessions[i].userId;
      try {
        const dbResults = await query(
          "SELECT * FROM accounts WHERE userId =? ",
          [userId]
        );
        const account = dbResults[0];
        amount = account.amount; //fix problem
      } catch (e) {
        res.status(500).send(e.message);
      }
    }
  }
  /* if (!userId || !amount) return res.status(500).send("Error"); */
  res.send(JSON.stringify({ userId, amount }));
});

//DB *7 MANAGE USER ACCOUNT WITH DB
app.post("/me/accounts/transactions", async (req, res) => {
  //Try catch can uses in all queries
  try {
    const { userId, newAmount } = req.body;
    //7.1 Search the row in DB
    const result = await query("SELECT * FROM accounts WHERE userId=?", [
      userId,
    ]);
    //Automatic error if userId does not Match
    const account = result[0];
    //7.2
    await query("UPDATE accounts SET amount = ? WHERE userId = ?", [
      newAmount,
      account.userId,
    ]);
    res.send("Amount updated");
  } catch (e) {
    res.status(500).send(e.message);
  }
});

// Starta servern
app.listen(PORT, () => {
  console.log(`Bankens backend körs på http://localhost:${PORT}`);
});
