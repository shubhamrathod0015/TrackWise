// import express from "express";
// import {
//   registerAdmin,
//   loginUser,
//   logoutUser
// } from "../../controllers/auth.controller.js";

// const router = express.Router();

// // Initial admin setup (only allowed once)
// router.route("/register")
//   .post(registerAdmin);

// // Authentication routes
// router.route("/login")
//   .post(loginUser);

// router.route("/logout")
//   .post(verifyJWT, logoutUser);

// export default router;


import express from "express";
import {
  registerAdmin,
  loginUser,
  logoutUser
} from "../../controllers/auth.controller.js";

import { verifyJWT } from "../../middlewares/verifyJWT.js"; // <-- import here

const router = express.Router();

// Initial admin setup (only allowed once)
router.route("/register")
  .post(registerAdmin);

// Authentication routes
router.route("/login")
  .post(loginUser);

router.route("/logout")
  .post(verifyJWT, logoutUser);  // <-- use middleware here

export default router;
