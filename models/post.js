const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Schema = mongoose.Schema

const PostSchema = new Schema({
    title: { type: String},
    caption: {
      type: String,
      required: true,
    },
    content: { type: String },
    dateCreated: {
      type: Date,
      default: () => new Date(),
      required: true,
  },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", required: true,
  },
    isPrivate: { type: Boolean, required: true },
    likes: { type: Array, required: true },
    files: {
      type: Array,
    },
})

PostSchema.virtual("timestamp_formatted").get(function () {
    return DateTime.fromJSDate(this.dateCreated).toLocaleString(
      DateTime.DATETIME_MED
    );
});

PostSchema.virtual("post_url").get(function () {
  return `/my-account/${this._id}`
})

PostSchema.virtual("post_url_like").get(function () {
  return `/${this._id}`
})

module.exports = mongoose.model("Post", PostSchema);