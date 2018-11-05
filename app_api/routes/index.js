var express = require("express");
var router = express.Router();
var ctrlLocations = require("../controllers/locations");
var ctrlReviews = require("../controllers/reviews");
var ctrlUsers = require("../controllers/users");

router.get("/locations", ctrlLocations.locationsListByDistance);
router.post("/locations", ctrlLocations.locationsCreate);
router.get("/locations/:locationid", ctrlLocations.locationsReadOne);
router.put("/locations/:locationid", ctrlLocations.locationsUpdateOne);
router.delete("/locations/:locationid", ctrlLocations.locationsDeleteOne);

// reviews
router.post("/locations/:locationid/reviews", ctrlReviews.reviewsCreate);
router.get(
  "/locations/:locationid/reviews/:reviewid",
  ctrlReviews.reviewsReadOne
);
router.put(
  "/locations/:locationid/reviews/:reviewid",
  ctrlReviews.reviewsUpdateOne
);
router.delete(
  "/locations/:locationid/reviews/:reviewid",
  ctrlReviews.reviewsDeleteOne
);

//user login/register routes
router.post("/users/new", ctrlUsers.userCreate);
router.post("/users/login", ctrlUsers.userLogin);
module.exports = router;
