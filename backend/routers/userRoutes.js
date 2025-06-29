const express = require("express");
const multer = require("multer");
const path = require("path");

const authMiddleware = require("../middlewares/authMiddleware");
const {
  registerController,
  loginController,
  postCourseController,
  getAllCoursesUserController,
  deleteCourseController,
  getAllCoursesController,
  enrolledCourseController,
  sendCourseContentController,
  completeSectionController,
  sendAllCoursesUserController,
  getStudentsWithCoursesController,
  changePasswordController,
  editCourseController,
  debugCourseUpdateController,
} = require("../controllers/userControllers");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Add timestamp to prevent filename conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).send({ 
        success: false, 
        message: 'File too large. Maximum size is 100MB.' 
      });
    }
    return res.status(400).send({ 
      success: false, 
      message: 'File upload error: ' + error.message 
    });
  }
  if (error) {
    return res.status(400).send({ 
      success: false, 
      message: error.message 
    });
  }
  next();
};

router.post("/register", registerController);

router.post("/login", loginController);

router.post(
  "/addcourse",
  authMiddleware,
  upload.any(),
  handleMulterError,
  postCourseController
);

router.post("/change-password", authMiddleware, changePasswordController);

router.get('/getallcourses', getAllCoursesController)

router.get('/getallcoursesteacher', authMiddleware, getAllCoursesUserController)

router.delete('/deletecourse/:courseid', authMiddleware, deleteCourseController)

router.post('/enrolledcourse/:courseid', authMiddleware, enrolledCourseController)

router.get('/coursecontent/:courseid', authMiddleware, sendCourseContentController)

router.post('/completemodule', authMiddleware, completeSectionController)

router.get('/getallcoursesuser', authMiddleware, sendAllCoursesUserController)

router.get('/studentsWithCourses', authMiddleware, getStudentsWithCoursesController);

router.post(
  "/editcourse",
  authMiddleware,
  upload.any(),
  handleMulterError,
  editCourseController
);

router.post(
  "/debug-course-update",
  authMiddleware,
  upload.any(),
  handleMulterError,
  debugCourseUpdateController
);

module.exports = router;
