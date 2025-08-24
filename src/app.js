// import express from "express";
// import cookieParser from "cookie-parser";
// import { errorHandler } from "./middleware/errorHandler.js";

// const app = express();

// app.use(express.json({ limit: "16kb" }));
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// import userRouter from "./routes/user.routes.js";

// import transactionRouter from "./routes/transactions.routes.js";

// app.use("/api/v1/users", userRouter);
// app.use("/api/v1/transactions", transactionRouter);

// import session from "express-session";
// import passport from "passport";
// import "./db/passport.js"; // Path to your passport file

// app.use(
//   session({
//     secret: "your-session-secret",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());

// app.use(errorHandler);

// export { app };
// File: app.js

import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import { errorHandler } from "./middleware/errorHandler.js";
import cors from "cors";

import "./db/passport.js";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors());

// session must be set before passport
app.use(
  session({
    secret: "hiihihihih",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
import userRouter from "./routes/user.routes.js";
import transactionRouter from "./routes/transactions.routes.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRoute from "./routes/subscription.routes.js";

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is Working",
  });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/auth", authRouter); // ✅ Google Auth routes
app.use("/api/v1/subscription", subscriptionRoute);

app.use(errorHandler);

export {app}
