const mongoose = require("mongoose");

const Subscription = mongoose.Schema({
  user: {
    type: Object,
    required: true,
  },
  subscriptionType: {
    type: String,
    required: true,
  },
  subscriptionExpiration: {
    type: String,
    required: true,
  },
  subscribedDate: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model("subscription",Subscription)