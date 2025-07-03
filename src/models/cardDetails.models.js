import mongoose, { Schema } from "mongoose";

const cardDetailSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    customer_id: {
      type: String,
      required: true,
    },
    card_id: {
      type: String,
      required: false,
    },
    card_name: {
      type: String,
      required: false,
    },
    card_no: {
      type: String,
      required: false,
    },
    brand: {
      type: String,
      required: false,
    },
    month: {
      type: String,
      required: false,
    },
    year: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);
export const SubscriptionDetail = mongoose.model(
  "CardDetail",
  cardDetailSchema
);
