import { Router } from "express";
import {
  addPlan,
  getPlans,
  getPlanDetails,
  createSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middleware/auth.js";
const router = Router();

router.route("/add-plan").post(verifyJWT, addPlan);
router.route("/get-plans").get(verifyJWT, getPlans);
router.route("/get-plan-details").post(verifyJWT, getPlanDetails);
router.route("/create-subscription").post(verifyJWT, createSubscription);

export default router;
