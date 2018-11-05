var request = require("request");
var apiOptions = {
  server: "http://localhost:3000"
};
if (process.env.NODE_ENV === "production") {
  apiOptions.server = "https://loc8r-session.herokuapp.com";
}

/* GET 'about us' page */
module.exports.about = function(req, res) {
  res.render("generic-text", {
    title: "About Loc8r",
    content:
      "Loc8r was created to help people find places to sit down and get a bit of work done.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sed lorem ac nisi dignissim accumsan. Nullam sit amet interdum magna. Morbi quis faucibus nisi. Vestibulum mollis purus quis eros adipiscing tristique. Proin posuere semper tellus, id placerat augue dapibus ornare. Aenean leo metus, tempus in nisl eget, accumsan interdum dui. Pellentesque sollicitudin volutpat ullamcorper.\n\nSuspendisse tincidunt, lectus non suscipit pharetra, purus ipsum vehicula sapien, a volutpat mauris ligula vel dui. Proin varius interdum elit, eu porttitor quam consequat et. Quisque vitae felis sed ante fringilla fermentum in vitae sem. Quisque fermentum metus at neque sagittis imperdiet. Phasellus non laoreet massa, eu laoreet nibh. Pellentesque vel magna vulputate, porta augue vel, dapibus nisl. Phasellus aliquet nibh nec nunc posuere fringilla. Quisque sit amet dignissim erat. Nulla facilisi. Donec in sollicitudin ante. Cras rhoncus accumsan rutrum. Sed aliquet ligula dui, eget laoreet turpis tempor vitae."
  });
};

module.exports.login = function(req, res) {
  res.render("login-page", {
    pageHeader: { title: "Login " }
  });
};

module.exports.logout = function(req, res) {
  if (req.session) {
    console.log("destroying session " + req.session.userId);
    // delete session object
    req.session.destroy();
    res.locals.user = undefined;
    res.redirect("/");
  }
};

module.exports.register = function(req, res) {
  res.render("register-page", {
    pageHeader: { title: "Register " }
  });
};

module.exports.doRegister = function(req, res) {
  var requestOptions, path, postdata;
  path = "/api/users/new";
  postdata = {
    email: req.body.email,
    name: req.body.name,
    password: req.body.pass
  };
  requestOptions = {
    url: apiOptions.server + path,
    method: "POST",
    json: postdata
  };

  request(requestOptions, function(err, response, body) {
    if (response.statusCode === 200) {
      res.redirect("/login");
    }
  });
};

module.exports.doLogin = function(req, res) {
  var requestOptions, path, postdata;
  path = "/api/users/login";
  postdata = {
    email: req.body.email,
    password: req.body.pass
  };
  requestOptions = {
    url: apiOptions.server + path,
    method: "POST",
    json: postdata
  };

  request(requestOptions, function(err, response, body) {
    if (response.statusCode === 200) {
      console.log(body);
      req.session.userId = body._id;
      req.session.userName = body.username;

      console.log("user session id assigned" + req.session.userId);
      res.redirect("/");
    }
  });
};
