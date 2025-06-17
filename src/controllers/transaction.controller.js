import { ApiResponse } from "../utils/ApiResponse.js";
import { Transaction } from "../models/Transaction.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//add income or expense
const addTransaction = asyncHandler(async (req, res) => {
  const { type, amount, category, note } = req.body;
  if ([type, amount, category, note].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  if (!["income", "expense"].includes(type)) {
    throw new ApiError(400, "Transaction type must be 'income' or 'expense'.");
  }

  const transaction = await Transaction.create({
    user: req.user?._id,
    type,
    amount,
    category,
    note,
  });

  if (!transaction) {
    throw new ApiError(500, "Transaction could not be created.");
  }
  res
    .status(201)
    .json(new ApiResponse(201, transaction, "Transaction added successfully"));
});

//Dashboard summary (Total Income , Expense , Balance)

const getSummary = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(404, "User does not exist.");
  }

  const transaction = await Transaction.find({ user: userId });

  const income = transaction
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transaction
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  res
    .status(200)
    .json(
      new ApiResponse(200, { income, expense, balance }, "Summary fetched")
    );
});

//get recents transactions

const getRecentTransactions = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(404, "User does not exist.");
  }

  const recent = await Transaction.find({ user: userId })
    .populate("user", "email")
    .sort({ createdAt: -1 })
    .limit(5);

  res
    .status(200)
    .json(new ApiResponse(200, recent, "Recent transactions fetched"));
});

//  All Transactions
const getAllTransactions = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(404, "User does not exist.");
  }

  const transactions = await Transaction.find({ user: userId }).sort({
    createdAt: -1,
  });

  res
    .status(200)
    .json(new ApiResponse(200, transactions, "All transactions fetched"));
});

export {
  addTransaction,
  getSummary,
  getRecentTransactions,
  getAllTransactions,
};
