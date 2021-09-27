const express = require("express");
const router = express.Router();

const rooms = [
  {
    id: 1,
    name: "GENERAL",
  },
  {
    id: 2,
    name: "OFFICE",
  },
  {
    id: 3,
    name: "EXPERIMENTAL",
  },
];

router.get("/", (_, res) => {
  res.send(rooms);
});

module.exports = router;
