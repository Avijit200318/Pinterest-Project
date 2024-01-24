var express = require('express');
var router = express.Router();

const userModel = require("./users");
const postModel = require("./post");
const passport = require('passport');
const localStrategy = require("passport-local");
const upload = require("./multer");

passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function (req, res, next) {
  res.render("index");
});

router.get("/register", function (req, res) {
  // console.log(req.flash("error"));
  res.render("register", {nav: false, error: req.flash("error")});
})

router.get("/signIn", async function(req, res){
  res.render("signIn", {nav: false, error: req.flash("error")});
})

router.get("/profile", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate("posts");
  res.render("profile", {user, nav: true, activePage: 'profile'});
})

router.get("/show/post", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate("posts");
  res.render("show", {user, nav: true, activePage: 'profile'});
})

router.get("/forgetPassword", function(req, res) {
  res.send("<h1>Just Relax and Remember your password ! ^-^</h1>");
})

router.get("/feed", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  const posts = await postModel.find().populate("user");

  res.render("feed", {user, posts, nav: true, activePage: 'feed'});
})

router.get("/add", isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render("add", {nav: true,activePage: 'profile'});
})

router.get("/show/post/:cardid", isLoggedIn,async function(req, res) {
  const cardid = req.params.cardid;
  // params help to read the cardid.
  const post = await postModel.findOne({_id: cardid}).populate("user");
  const allPosts = await postModel.find();
  // console.log(post);
  res.render("singleImage", {post, allPosts ,nav: true, activePage: 'feed'});
})

router.post("/createPost", isLoggedIn, upload.single("postimage"), async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});

  // Read the image file as binary data
  const imageBuffer = require('fs').readFileSync(req.file.path);

  // Create a new post with image data
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: {
      data: imageBuffer,
      contentType: req.file.mimetype, // Set the appropriate content type
    },
  });

  user.posts.push(post._id);
  await user.save();

  // Remove the uploaded file as it is already stored in the database
  require('fs').unlinkSync(req.file.path);

  res.redirect("/profile");
});

router.post("/fileupload", isLoggedIn, upload.single("image"), async function(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).send('No file was uploaded');
    }

    const user = await userModel.findOne({ username: req.session.passport.user });

    // Read the image file as binary data
    const imageBuffer = require('fs').readFileSync(req.file.path);

    // Update the user's profileImage field in the database
    user.profileImage = {
      data: imageBuffer,
      contentType: req.file.mimetype,
    };

    // Save the updated user object
    await user.save();

    // Remove the uploaded file as it is already stored in the database
    require('fs').unlinkSync(req.file.path);

    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post("/searchText", async function(req, res) {
  console.log(req.body.searchTxt);
  const searchPost = await postModel.find({title:{ $regex: req.body.searchTxt, $options: "i" }}).populate("user");
  // console.log(user);
  res.render("searchRes", {searchPost ,nav: true,activePage: 'feed'});
})

router.post("/register", function(req, res) {
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    contact: req.body.contact,
    name: req.body.fullname,
  })

  userModel.register(data, req.body.password, function(err, user) {
    if (err) {
      // If the username already exists, show a flash message
      req.flash("error", "Username already exists. Please choose a different one.");
      return res.redirect("/register");
    }

    passport.authenticate("local")(req, res, function() {
      res.redirect("/profile");
    });
  });
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/",
  failureFlash: true
}), function (req, res, next) {
});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
