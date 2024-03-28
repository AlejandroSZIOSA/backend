import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

const PORT = 4000; //server port

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Generera engångslösenord
function generateOTP() {
  // Generera en sexsiffrig numerisk OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

// Din kod här. Skriv dina arrayer
const users = [{ id: 101, username: "gato", password: "123456" }];
const accounts = [{ id: 1, userId: 101, amount: 3 }];
const sessions = []; //{ userId: 101, token: "nwfcx" }

const saldo = { userId: 1, saldo: "20" };

// Din kod här. Skriv dina routes:
app.get("/saldo", (req, res) => {
  res.send("Current Saldo" + JSON.stringify(saldo)); //Response to the client
});

//Create users
app.post("/users", (req, res) => {
  const data = req.body; //data from the client
  users.push(data);
  res.send("Post data received:" + JSON.stringify(data));
});

//Login + return one password for login
app.post("/sessions", (req, res) => {
  const data = req.body; //data from the client
  sessions.push(data);

  const { username, password } = data;

  if (username == users[0].username && password == users[0].password) {
    return res.send(JSON.stringify(generateOTP())); //Return a token
  }
  res.send(false);
});

//Show saldo
app.post("/me/accounts", (req, res) => {
  const data = req.body; //data from the client
  accounts.push(data);
  res.send("Post data received:" + JSON.stringify(data));
});

//Manage Account
app.post("/me/accounts/transactions", (req, res) => {
  const data = req.body; //data from the client
});

// Starta servern
app.listen(PORT, () => {
  console.log(`Bankens backend körs på http://localhost:${PORT}`);
});
