import mongoose, { Schema } from "mongoose";

const pendingFeeSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    charge_id: {
      type: String,
      required: true,
    },
    customer_id: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);
export const SubscriptionDetail = mongoose.model(
  "PendingFee",
  pendingFeeSchema
);
