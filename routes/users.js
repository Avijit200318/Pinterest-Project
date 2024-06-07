const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
const dotenv = require("dotenv");
dotenv.config();
// mongodb://127.0.0.1:27017/printestProject
mongoose.connect(process.env.MONGO).then(()=> {
  console.log("mongodb is connected");
}).catch((error)=> {
  console.log("error is: " ,error);
});

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