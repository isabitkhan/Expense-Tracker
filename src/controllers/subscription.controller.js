import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createCustomer } from "../utils/subscriptionHelper.js";
import { ApiError } from "../utils/ApiError.js";
import { SubscriptionPlan } from "../models/subscriptionPlan.models.js";
import { SubscriptionDetail } from "../models/subscriptionDetails.models.js";
import mongoose from "mongoose";

const addPlan = asyncHandler(async (req, res) => {
  const { name, stripe_price_id, trial_days, has_trial, amount, type } =
    req.body;

  // Validate required string fields
  if (
    [name, stripe_price_id].some(
      (field) => typeof field !== "string" || !field.trim()
    )
  ) {
    throw new ApiError(
      400,
      "Name and Stripe Price ID are required and must be non-empty strings."
    );
  }

  // Validate number fields
  if (
    typeof trial_days !== "number" ||
    typeof amount !== "number" ||
    typeof type !== "number"
  ) {
    throw new ApiError(400, "Trial days, amount, and type must be numbers.");
  }

  // Validate boolean
  if (typeof has_trial !== "boolean") {
    throw new ApiError(400, "Has_trial must be a boolean.");
  }
  const plan = await SubscriptionPlan.create({
    name,
    stripe_price_id,
    trial_days,
    has_trial,
    amount,
    type,
  });

  const createdPlan = await SubscriptionPlan.findById(plan._id);
  if (!createdPlan) {
    throw new ApiError(500, "Something went wrong while Adding a Plan");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        createdPlan,
        "Subscription Plan Created Successfully."
      )
    );
});

const getPlans = asyncHandler(async (req, res) => {
  const plans = await SubscriptionPlan.find();

  if (!plans) {
    throw new ApiError(400, "No plans were found.");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, plans, "Plans Fetched Successfully."));
});

const getPlanDetails = asyncHandler(async (req, res) => {
  const { plan_id } = req.body;

  if (!plan_id) {
    throw new ApiError(400, "Plan id is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(plan_id)) {
    throw new ApiError(400, "Invalid plan ID format.");
  }
  const plan = await SubscriptionPlan.findOne({ _id: plan_id });
  if (!plan) {
    throw new ApiError(404, "No plan found with the given ID.");
  }

  const user_id = req.user._id;
  const haveBuyedAnyPlan = await SubscriptionDetail.countDocuments({ user_id });
  let subs_msg = "";
  if (haveBuyedAnyPlan == 0 && plan.has_trial == true) {
    subs_msg = `You will get ${plan.trial_days} days trial, and after we that
    we will charge $${plan.amount} amount for ${plan.name} Subscription Plan.`;
  } else {
    subs_msg = `we will charge $${plan.amount} amount for ${plan.name} Subscription Plan.`;
  }

  // SubscriptionDetail.countDocuments()
  return res.status(201).json(new ApiResponse(200, plan, subs_msg));
});

const createSubscription = asyncHandler(async (req, res) => {
  const { id } = req.body; // This is the Stripe token ID like "tok_visa"

  // Get the logged-in user
  const userData = req.user;

  // Create Stripe customer and retrieve card info
  const customer = await createCustomer(userData.name, userData.email, id);
  if (!customer) throw new ApiError(400, "Customer not created.");
  
  // Respond with customer info and attached card details
  return res
    .status(201)
    .json(
      new ApiResponse(200, customer, "Customer created and card info retrieved")
    );
});

export { addPlan, getPlans, getPlanDetails, createSubscription };
