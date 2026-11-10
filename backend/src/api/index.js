
import "dotenv/config";

import app from "../app.js";
import { connectDB } from "../config/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();

    return app(req, res);

  } catch (error) {
    console.error("Vercel API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
}
