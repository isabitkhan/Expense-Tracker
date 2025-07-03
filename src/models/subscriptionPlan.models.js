import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    stripe_price_id: {
      type: String,
      required: true,
    },
    trial_days: { // fixed spelling: "trail" → "trial"
      type: Number,
      required: true,
    },
    has_trial: { // better name: "have_trail" → "has_trial"
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      // 0 -> Monthly, 1 -> Yearly, 2 -> Lifetime
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionSchema);
