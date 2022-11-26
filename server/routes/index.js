const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/flileUploadController");

let routes = app => {
  router.post("/upload", uploadController.uploadFiles);
  app.get("/", (req, res) => {
    res.send("Express on Vercel");
  });
  return app.use("/", router);
};
 
module.exports = routes;