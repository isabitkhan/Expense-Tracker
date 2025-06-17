import mongoose from "mongoose";
const transactionSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    default: "general",
  },
  note: { type: String, default: "" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Transaction = mongoose.model("Transaction", transactionSchema);
