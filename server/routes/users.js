const express = require("express");
const bp = require("body-parser");

const router = express.Router();

const ops = require("../js/userOperations.js");

const usersModel = require("../models/user.model");

router.use(bp.json());
router.use(bp.urlencoded({ extended: true }));

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Handling GET requests to /users...",
  });
});

router.post("/api/users/register", async (req, res) => {
  let username = req.body.username;
  let password0 = req.body.password0;
  let password1 = req.body.password1;

  let data = await ops.registerUser(username, password0, password1, res);
  res.send({ data: data });
});

router.post("/api/users/login", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  let username = await req.body.username;
  let password = await req.body.password;

  let data = await ops.checkLogin(username, password);
  if (data.status === "done") {
    await ops.addIp(username, ip);
    await res.send(data);
  } else {
    res.send({ status: "tryAgain" });
  }
});

router.post("/api/users/logout", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  let status = await ops.removeIp(ip); // status == "done"
  res.send({ status: status });
});

router.post("/api/users/status", async (req, res) => {
  // do nothing, authentication using ip address doesn't really works
  return;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  const data = await ops.checkIp(ip); //  { status: "0" } or "1"(with other params)
  res.send(data);
});

router.post("/api/users/hashId", async (req, res) => {
  try {
    let name = await usersModel
      .find({
        hashId: req.body.hashId,
      })
      .exec();

    const data = await ops.checkData(req.body.hashId);
    await res.send(data);
    console.log("user hash successfully authenticated:", data, req.body.hash);
  } catch {
    await res.send({ roomName: "IncorrectHash" });
  }
});

module.exports = router;
