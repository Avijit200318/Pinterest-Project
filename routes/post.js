const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: String,
  description: String,
  profileImage: String,
  image: {
    data: Buffer,
    contentType: String,
  },
});


module.exports = mongoose.model("Post", postSchema);