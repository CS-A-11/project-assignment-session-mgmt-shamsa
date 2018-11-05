var mongoose = require("mongoose");
var User = mongoose.model("User");

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.userCreate = function(req, res) {
  User.create(
    {
      email: req.body.email,
      username: req.body.name,
      password: req.body.password
    },
    function(error, user) {
      if (error) {
        sendJSONresponse(res, 400, err);
      } else {
        req.session.userId = user._id;
        sendJSONresponse(res, 200, { status: "success" });
      }
    }
  );
};

module.exports.userLogin = function(req, res) {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function(error, user) {
      if (error || !user) {
        var err = new Error("Wrong email or password.");
        err.status = 401;
        sendJSONresponse(res, 401, err);
      } else {
        sendJSONresponse(res, 200, user);
      }
    });
  } else {
    var err = new Error("All fields required.");
    err.status = 400;
    sendJSONresponse(res, 400, err);
  }
};
