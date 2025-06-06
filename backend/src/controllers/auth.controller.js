import  User from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * @desc    Register admin user (First-time setup)
 * @route   POST /api/v1/auth/register
 * @access  Public (Only for initial setup)
 */
const registerAdmin = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      throw new ApiError(403, "Admin registration is disabled after initial setup");
    }

    // Create admin user
    const admin = await User.create({
      username,
      email,
      password,
      role: 'admin'
    });

    // Remove sensitive fields
    const createdAdmin = admin.toObject();
    delete createdAdmin.password;
    delete createdAdmin.refreshToken;

    res.status(201).json(
      new ApiResponse(201, createdAdmin, "Admin registered successfully")
    );
  } catch (error) {
    next(new ApiError(
      error.statusCode || 500, 
      error.message || "Admin registration failed"
    ));
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Update refresh token in DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    res
      .status(200)
      .cookie('accessToken', accessToken, cookieOptions)
      .cookie('refreshToken', refreshToken, cookieOptions)
      .json(new ApiResponse(200, {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      }, "Login successful"));
  } catch (error) {
    next(new ApiError(401, error.message || "Authentication failed"));
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logoutUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );

    res
      .status(200)
      .clearCookie('accessToken')
      .clearCookie('refreshToken')
      .json(new ApiResponse(200, {}, "Logout successful"));
  } catch (error) {
    next(new ApiError(500, "Logout failed"));
  }
};

export { registerAdmin, loginUser, logoutUser };