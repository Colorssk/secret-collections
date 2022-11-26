const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/flileUploadController");

let routes = app => {
  router.post("/upload", uploadController.uploadFiles);
  // router.get("/files", uploadController.getListFiles);
  return app.use("/", router);
};
 
module.exports = routes;