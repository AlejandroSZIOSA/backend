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
const users = [
  { id: 101, username: "gato", password: "123" },
  /* { id: 102, username: "test", password: "test" }, */
];

const accounts = [
  { id: 1, userId: 101, amount: 3 },
  { id: 2, userId: 102, amount: 0 },
];
const sessions = [{ userId: 101, token: "777" }];

// Din kod här. Skriv dina routes:
app.get("/saldo", (req, res) => {
  res.send("Current Saldo" + JSON.stringify(saldo)); //Response to the client
});

//CREATE USER
app.post("/users", (req, res) => {
  const data = req.body; //data from the client

  users.push(data);
  /* console.log(users); */
  res.send("User created" + JSON.stringify(data));
});

//LOGIN USER + return one password for login
app.post("/sessions", (req, res) => {
  const data = req.body; //data from the client

  const { username, password } = data;

  for (let i = 0; i < users.length; i++) {
    if (username == users[i].username && password == users[i].password) {
      const token = generateOTP();
      sessions.push({ userId: users[i].id, token: token });
      /* console.log("sessions = ", sessions); */
      return res.send(token); //Return a token
    }
  }
  res.send(false);
});

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
  res.send(JSON.stringify("Transaction Done"));
});

// Starta servern
app.listen(PORT, () => {
  console.log(`Bankens backend körs på http://localhost:${PORT}`);
});
