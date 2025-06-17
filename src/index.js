// import dotenv from "dotenv";
// import connectDB from "./db/index.db.js";
// import { app } from "./app.js";
// import mongoose from "mongoose";

// dotenv.config({
//   path: "./env",
// });

// connectDB()
//   .then(async () => {
//     console.log("✅ DB Connected");

//     // 👇 Ensure partial index on googleId to avoid duplicate null errors
//     try {
//       const collection = mongoose.connection.db.collection("users");

//       const indexes = await collection.indexes();
//       const hasGoogleIdIndex = indexes.some(idx => idx.name === "googleId_1");

//       if (hasGoogleIdIndex) {
//         await collection.dropIndex("googleId_1");
//         console.log("⚠️ Dropped old googleId index");
//       }

//       await collection.createIndex(
//         { googleId: 1 },
//         {
//           unique: true,
//           partialFilterExpression: { googleId: { $exists: true, $ne: null } },
//         }
//       );
//       console.log("✅ Created partial unique index on googleId");
//     } catch (err) {
//       console.error("❌ Failed to update googleId index:", err.message);
//     }

//     app.listen(process.env.PORT || 8000, () =>
//       console.log(`🚀 Server is running on port ${process.env.PORT || 8000}`)
//     );
//   })
//   .catch((error) => console.log(`❌ MongoDB connection failed!`, error));
import dotenv from "dotenv";
import connectDB from "./db/index.db.js";
import { app } from "./app.js";
import mongoose from "mongoose";

dotenv.config({
  path: "./env",
});

let isConnected = false;

const init = async () => {
  if (!isConnected) {
    await connectDB();
    console.log("✅ DB Connected");

    // Partial index setup
    try {
      const collection = mongoose.connection.db.collection("users");

      const indexes = await collection.indexes();
      const hasGoogleIdIndex = indexes.some((idx) => idx.name === "googleId_1");

      if (hasGoogleIdIndex) {
        await collection.dropIndex("googleId_1");
        console.log("⚠️ Dropped old googleId index");
      }

      await collection.createIndex(
        { googleId: 1 },
        {
          unique: true,
          partialFilterExpression: { googleId: { $exists: true, $ne: null } },
        }
      );

      console.log("✅ Created partial unique index on googleId");
      isConnected = true;
    } catch (err) {
      console.error("❌ Failed to update googleId index:", err.message);
    }
  }
};

await init();

// ✅ Export app for Vercel
export default app;
