import Stripe from "stripe";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCustomer = async (name, email, token_id) => {
  try {
    if (!token_id || typeof token_id !== "string") {
      throw new ApiError(400, "Invalid or missing Stripe token.");
    }

    const customer = await stripe.customers.create({
      name,
      email,
      source: token_id,
    });

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
    };
  } catch (error) {
    console.error("Stripe Customer Creation Error:", error.message);
    throw new ApiError(
      500,
      error?.message || "Failed to create Stripe customer."
    );
  }
};

export { createCustomer };
