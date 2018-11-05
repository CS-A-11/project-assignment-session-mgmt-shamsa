var request = require("request");
var apiOptions = {
  server: "http://localhost:3000"
};
if (process.env.NODE_ENV === "production") {
  apiOptions.server = "https://loc8r-session.herokuapp.com";
}

var mongoose = require("mongoose");
//var locationmodel = require("../models/locations");
var Loc = mongoose.model("Location");

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

var _showError = function(req, res, status) {
  var title, content;
  if (status === 404) {
    title = "404, page not found";
    content = "Oh dear. Looks like we can't find this page. Sorry.";
  } else if (status === 500) {
    title = "500, internal server error";
    content = "How embarrassing. There's a problem with our server.";
  } else {
    title = status + ", something's gone wrong";
    content = "Something, somewhere, has gone just a little bit wrong.";
  }
  res.status(status);
  res.render("generic-text", {
    title: title,
    content: content
  });
};
/* GET 'home' page */
module.exports.homelist = function(req, res) {
  var requestOptions, path;
  path = "/api/locations";
  requestOptions = {
    url: apiOptions.server + path,
    method: "GET",
    json: {}
  };
  request(requestOptions, function(err, response, body) {
    var i, data;
    data = body;
    if (response.statusCode === 200 && data.length) {
      for (i = 0; i < data.length; i++) {
        //data[i].distance = _formatDistance(data[i].distance);
      }
    }
    renderHomepage(req, res, data);
  });
};
var renderHomepage = function(req, res, responseBody) {
  var message;
  if (!(responseBody instanceof Array)) {
    message = "API lookup error";
    responseBody = [];
  } else {
    if (!responseBody.length) {
      message = "No places found nearby";
    }
  }
  res.render("locations-list", {
    title: "Loc8r - find a place to work with wifi",
    pageHeader: {
      title: "Loc8r",
      strapline: "Find places to work with wifi near you!"
    },
    sidebar:
      "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for.",
    locations: responseBody,
    message: message
  });
};

var getLocationInfo = function(req, res, callback) {
  var requestOptions, path;
  path = "/api/locations/" + req.params.locationid;
  requestOptions = {
    url: apiOptions.server + path,
    method: "GET",
    json: {}
  };
  request(requestOptions, function(err, response, body) {
    var data = body;
    if (response.statusCode === 200) {
      data.coords = {
        lng: body.coords[0],
        lat: body.coords[1]
      };
      callback(req, res, data);
    } else {
      _showError(req, res, response.statusCode);
    }
  });
};

var renderDetailPage = function(req, res, locDetail) {
  res.render("location-info", {
    title: locDetail.name,
    pageHeader: { title: locDetail.name },
    sidebar: {
      context:
        "is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.",
      callToAction:
        "If you've been and you like it - or if you don't - please leave a review to help other people just like you."
    },
    location: locDetail
  });
};

/* GET 'Location info' page */
module.exports.locationInfo = function(req, res) {
  getLocationInfo(req, res, function(req, res, responseData) {
    renderDetailPage(req, res, responseData);
  });
};

var renderReviewForm = function(req, res, locDetail) {
  res.render("location-review-form", {
    title: "Review " + locDetail.name + " on Loc8r",
    pageHeader: { title: "Review " + locDetail.name },
    review: {},

    error: req.query.err
  });
};

var renderEditReviewForm = function(req, res, reviewDetail) {
  res.render("location-review-edit-form", {
    title: "Review " + reviewDetail.location.name + " on Loc8r",
    pageHeader: { title: "Review " + reviewDetail.location.name },
    author: reviewDetail.review.author,
    rating: reviewDetail.review.rating,
    reviewText: reviewDetail.review.reviewText,
    error: req.query.err
  });
};
module.exports.checkLogin = function requiresLogin(req, res, next) {
  //
  if (req.session && req.session.userId) {
    console.log("session active");
    next();
  } else {
    console.log("no session active");
    var err = new Error("You must be logged in to view this page.");
    err.status = 401;
    res.redirect("/login");
  }
};

/* GET 'Add review' page */
module.exports.addReview = function(req, res) {
  getLocationInfo(req, res, function(req, res, responseData) {
    renderReviewForm(req, res, responseData);
  });
};

/* POST 'Add review' page */
module.exports.doAddReview = function(req, res) {
  var requestOptions, path, locationid, postdata;
  locationid = req.params.locationid;
  path = "/api/locations/" + locationid + "/reviews";
  postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review,
    userId: req.session.userId
  };
  requestOptions = {
    url: apiOptions.server + path,
    method: "POST",
    json: postdata
  };
  if (!postdata.author || !postdata.rating || !postdata.reviewText) {
    res.redirect("/location/" + locationid + "/reviews/new?err=val");
  } else {
    request(requestOptions, function(err, response, body) {
      if (response.statusCode === 201) {
        res.redirect("/location/" + locationid);
      } else if (
        response.statusCode === 400 &&
        body.name &&
        body.name === "ValidationError"
      ) {
        res.redirect("/location/" + locationid + "/reviews/new?err=val");
      } else {
        console.log(body);
        _showError(req, res, response.statusCode);
      }
    });
  }
};

/* GET 'Edit review' page */
module.exports.editReview = function(req, res) {
  getReviewInfo(req, res, function(req, res, responseData) {
    renderEditReviewForm(req, res, responseData);
  });
};

/* GET 'Delete review' page */
module.exports.deleteReview = function(req, res) {
  var requestOptions, path, locationid, reviewid;
  locationid = req.params.locationid;
  reviewid = req.params.reviewid;
  path = "/api/locations/" + locationid + "/reviews/" + reviewid;

  requestOptions = {
    url: apiOptions.server + path,
    method: "DELETE",
    json: {}
  };

  request(requestOptions, function(err, response) {
    if (response.statusCode === 204) {
      res.redirect("/location/" + locationid);
    } else if (response.statusCode === 400) {
      res.redirect("/location/" + locationid + "/reviews/new?err=val");
    } else {
      //console.log(body);
      _showError(req, res, response.statusCode);
    }
  });
};

var getReviewInfo = function(req, res, callback) {
  var requestOptions, path;
  path =
    "/api/locations/" +
    req.params.locationid +
    "/reviews/" +
    req.params.reviewid;
  requestOptions = {
    url: apiOptions.server + path,
    method: "GET",
    json: {}
  };
  request(requestOptions, function(err, response, body) {
    var data = body;
    if (response.statusCode === 200) {
      callback(req, res, data);
    } else {
      _showError(req, res, response.statusCode);
    }
  });
};

/* PUT 'Edit review' page */
module.exports.doEditReview = function(req, res) {
  var requestOptions, path, locationid, reviewid, postdata;
  locationid = req.params.locationid;
  reviewid = req.params.reviewid;
  path = "/api/locations/" + locationid + "/reviews/" + reviewid;
  postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };
  requestOptions = {
    url: apiOptions.server + path,
    method: "PUT",
    json: postdata
  };
  if (!postdata.author || !postdata.rating || !postdata.reviewText) {
    res.redirect("/location/" + locationid + "/reviews/new?err=val");
  } else {
    request(requestOptions, function(err, response, body) {
      if (response.statusCode === 200) {
        res.redirect("/location/" + locationid);
      } else if (
        response.statusCode === 400 &&
        body.name &&
        body.name === "ValidationError"
      ) {
        res.redirect("/location/" + locationid + "/reviews/new?err=val");
      } else {
        console.log(body);
        _showError(req, res, response.statusCode);
      }
    });
  }
};
