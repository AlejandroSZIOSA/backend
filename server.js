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
const users = [];
const accounts = [];
const sessions = [];

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

//Login + one password for login
app.post("/sessions", (req, res) => {
  const data = req.body; //data from the client
  sessions.push(data);
  res.send(JSON.stringify(generateOTP())); //A new password
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
