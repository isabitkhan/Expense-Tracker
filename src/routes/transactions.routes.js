import { Router } from "express";

import {
  addTransaction,
  getSummary,
  getRecentTransactions,
  getAllTransactions,
} from "../controllers/transaction.controller.js";

import { verifyJWT } from "../middleware/auth.js";
const router = Router();

router.route("/").post(verifyJWT, addTransaction);
router.route("/summary").get(verifyJWT, getSummary);
router.route("/recent").get(verifyJWT, getRecentTransactions);
router.route("/").get(verifyJWT, getAllTransactions);

export default router;
