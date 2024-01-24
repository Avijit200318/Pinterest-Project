const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
// mongodb://127.0.0.1:27017/printestProject
mongoose.connect("mongodb+srv://avijithira14:yySggpqUSzziOZD9@cluster0.wv0tfyh.mongodb.net");

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  profileImage: {
    data: Buffer,
    contentType: String,
  },
  contact: Number,
  boards: {
    type: Array,
    default: [],
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    }
  ],
});

userSchema.plugin(plm);

module.exports = mongoose.model("User", userSchema);