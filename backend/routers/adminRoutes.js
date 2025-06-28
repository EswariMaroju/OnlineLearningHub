const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getAllUsersController,
  getAllCoursesController,
  deleteCourseController,
  deleteUserController,
  getCourseStatusStatsController,
  getEnrollmentStatsController,
  getAllEnrollmentsController,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/getallusers", authMiddleware, getAllUsersController);

router.get("/getallcourses", authMiddleware, getAllCoursesController);

router.delete('/deletecourse/:courseid', authMiddleware, deleteCourseController)

router.delete('/deleteuser/:cuserid', authMiddleware, deleteUserController)

router.get("/coursestatusstats", authMiddleware, getCourseStatusStatsController);
router.get("/enrollmentstats", authMiddleware, getEnrollmentStatsController);
router.get("/enrollments", authMiddleware, getAllEnrollmentsController);

module.exports = router;
