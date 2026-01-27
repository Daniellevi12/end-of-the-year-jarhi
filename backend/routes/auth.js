const router = require("express").Router();
const authController = require("../controllers/authController");

// REGISTER
router.post("/register", authController.register);

// LOGIN
router.post("/login", authController.login);

// LOGOUT
router.post("/logout", authController.logout);

// SEARCH USERS BY NAME
router.get("/users/search", authController.searchUsers);

module.exports = router;