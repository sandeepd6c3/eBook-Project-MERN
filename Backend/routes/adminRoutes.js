const express = require("express");
const router = express.Router();
const {
    getAdminStats,
    getAllBooks,
    getAdminBookById,
    deleteAdminBook,
    getAllUsers,
    updateUserRole,
    deleteAdminUser,
} = require("../controller/adminController");
const { protect, adminOnly } = require("../middlewares/authMiddlewares");

// Protect all admin routes with authentication and strict admin role verification
router.use(protect);
router.use(adminOnly);

// Stats & metrics
router.get("/stats", getAdminStats);

// Book management across all users
router.get("/books", getAllBooks);
router.get("/books/:id", getAdminBookById);
router.delete("/books/:id", deleteAdminBook);

// User management
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteAdminUser);

module.exports = router;
