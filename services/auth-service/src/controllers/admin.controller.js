import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const getAllUsersController = asyncHandler(async (req, res) => {
  const users = await User.find().select("-passwordHash");

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: {
      count: users.length,
      users
    }
  });
});