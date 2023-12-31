const { authJWT } = require("../middleware");
const controller = require("../controllers/job.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/job/schedule",
    [authJWT.verifyToken],
    controller.schedule
  );

  app.get(
    "/api/job/all",
    [authJWT.verifyToken],
    controller.get_all
  )

};