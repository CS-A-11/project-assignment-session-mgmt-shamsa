var express = require("express");
var router = express.Router();
var ctrlLocations = require("../controllers/locations");
var ctrlOthers = require("../controllers/others");
var ctrlMain = require("../controllers/main");

/* Locations pages */
router.get("/", ctrlLocations.homelist);
router.get("/location/:locationid", ctrlLocations.locationInfo);
router.get(
  "/location/:locationid/review/new",
  ctrlLocations.checkLogin,
  ctrlLocations.addReview
);
router.post("/location/:locationid/review/new", ctrlLocations.doAddReview);

router.get(
  "/location/:locationid/review/:reviewid/edit",
  ctrlLocations.editReview
);
router.post(
  "/location/:locationid/review/:reviewid/edit",
  ctrlLocations.doEditReview
);

router.get(
  "/location/:locationid/review/:reviewid/delete",
  ctrlLocations.deleteReview
);

router.get("/main", ctrlMain.index);
/* Other pages*/
router.get("/about", ctrlOthers.about);
router.get("/login", ctrlOthers.login);
router.get("/logout", ctrlOthers.logout);
router.post("/login", ctrlOthers.doLogin);
router.get("/register", ctrlOthers.register);
router.post("/register", ctrlOthers.doRegister);

module.exports = router;
