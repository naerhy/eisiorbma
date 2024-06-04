import express from "express";

const server = express();

server.get("/", (_, res) => {
  res.json({ message: "this is a test..." });
});

server.listen(3000);
