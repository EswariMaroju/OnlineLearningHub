const userSchema = require("../schemas/userModel");
const courseSchema = require("../schemas/courseModel");
const enrolledCourseSchema = require("../schemas/enrolledCourseModel");
const coursePaymentSchema = require("../schemas/coursePaymentModel");

const getAllUsersController = async (req, res) => {
  try {
    const allUsers = await userSchema.find();
    if (allUsers == null || !allUsers) {
      return res.status(401).send({ message: "No users found" });
    }
    res.status(200).send({ success: true, data: allUsers });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

const getAllCoursesController = async (req, res) => {
  try {
    const allCourses = await courseSchema.find();
    if (allCourses == null || !allCourses) {
      return res.status(401).send({ message: "No courses found" });
    }
    res.status(200).send({ success: true, data: allCourses });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

const deleteCourseController = async (req, res) => {
  const { courseid } = req.params; // Use the correct parameter name
  try {
    // Attempt to delete the course by its ID
    const course = await courseSchema.findByIdAndDelete({ _id: courseid });

    // Check if the course was found and deleted successfully
    if (course) {
      res
        .status(200)
        .send({ success: true, message: "Course deleted successfully" });
    } else {
      res.status(404).send({ success: false, message: "Course not found" });
    }
  } catch (error) {
    console.error("Error in deleting course:", error);
    res
      .status(500)
      .send({ success: false, message: "Failed to delete course" });
  }
};

const deleteUserController = async (req, res) => {
  const { userid } = req.params; // Use the correct parameter name
  try {
    // Attempt to delete the course by its ID
    const user = await userSchema.findByIdAndDelete({ _id: userid });

    // Check if the course was found and deleted successfully
    if (user) {
      res
        .status(200)
        .send({ success: true, message: "User deleted successfully" });
    } else {
      res.status(404).send({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error in deleting user:", error);
    res
      .status(500)
      .send({ success: false, message: "Failed to delete course" });
  }
};

// Get course status statistics
const getCourseStatusStatsController = async (req, res) => {
  try {
    const courses = await courseSchema.find();
    const stats = { published: 0, pending: 0, draft: 0 };
    courses.forEach(course => {
      if (course.status === 'published') stats.published++;
      else if (course.status === 'pending') stats.pending++;
      else if (course.status === 'draft') stats.draft++;
    });
    res.status(200).send({ success: true, data: stats });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

// Get enrollment statistics per day of week for the last 7 days
const getEnrollmentStatsController = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const enrollments = await enrolledCourseSchema.find({
      createdAt: { $gte: sevenDaysAgo }
    });
    // Days: 0=Sun, 1=Mon, ..., 6=Sat
    const stats = [0, 0, 0, 0, 0, 0, 0];
    enrollments.forEach(enroll => {
      const day = new Date(enroll.createdAt).getDay();
      stats[day]++;
    });
    res.status(200).send({ success: true, data: stats });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

const getAllEnrollmentsController = async (req, res) => {
  try {
    const enrollments = await enrolledCourseSchema.find();
    res.status(200).send({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

module.exports = {
  getAllUsersController,
  getAllCoursesController,
  deleteCourseController,
  deleteUserController,
  getCourseStatusStatsController,
  getEnrollmentStatsController,
  getAllEnrollmentsController,
};
