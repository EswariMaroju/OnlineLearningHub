const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');

const userSchema = require("../schemas/userModel");
const courseSchema = require("../schemas/courseModel");
const enrolledCourseSchema = require("../schemas/enrolledCourseModel");
const coursePaymentSchema = require("../schemas/coursePaymentModel");
//////////for registering/////////////////////////////
const registerController = async (req, res) => {
  try {
    const existsUser = await userSchema.findOne({ email: req.body.email });
    if (existsUser) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    const newUser = new userSchema(req.body);
    await newUser.save();

    return res.status(201).send({ message: "Register Success", success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

////for the login
const loginController = async (req, res) => {
  try {
    // Hardcoded admin credentials
    const adminEmail = "admin@gmail.com";
    const adminPassword = "admin@123";

    if (req.body.email === adminEmail && req.body.password === adminPassword) {
      // Create a fake admin user object
      const adminUser = {
        _id: "adminid",
        name: "Admin",
        email: adminEmail,
        type: "admin",
      };
      const token = jwt.sign({ id: adminUser._id }, process.env.JWT_KEY, {
        expiresIn: "1d",
      });
      return res.status(200).send({
        message: "Admin login successful",
        success: true,
        token,
        userData: adminUser,
      });
    }

    const user = await userSchema.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid email or password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
      expiresIn: "1d",
    });
    user.password = undefined;
    return res.status(200).send({
      message: "Login success successfully",
      success: true,
      token,
      userData: user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

//get all courses
const getAllCoursesController = async (req, res) => {
  try {
    const allCourses = await courseSchema.find();
    if (!allCourses) {
      return res.status(404).send("No Courses Found");
    }

    return res.status(200).send({
      success: true,
      data: allCourses,
    });
  } catch (error) {
    console.error("Error in deleting course:", error);
    res
      .status(500)
      .send({ success: false, message: "Failed to delete course" });
  }
};

////////posting course////////////
const postCourseController = async (req, res) => {
  try {
    console.log("Received req.body:", req.body);
    console.log("Received req.files:", req.files);

    let price;
    // Extract data from the request body and files
    let {
      userId,
      C_educator,
      C_title,
      C_categories,
      C_price,
      C_description,
      S_title,
      S_description,
    } = req.body;

    // Validate required fields
    if (!userId || !C_educator || !C_title || !C_categories || !C_description) {
      console.log('Missing required fields:', { userId, C_educator, C_title, C_categories, C_description });
      return res.status(400).send({ 
        success: false, 
        message: "Missing required fields: userId, C_educator, C_title, C_categories, C_description" 
      });
    }

    // Normalize S_title and S_description to arrays if they are strings
    if (S_title && !Array.isArray(S_title)) {
      S_title = [S_title];
    }
    if (S_description && !Array.isArray(S_description)) {
      S_description = [S_description];
    }

    console.log('Normalized section data:', { S_title, S_description });

    // Group files by section index (match frontend field names)
    const filesBySection = {};
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        // Expect fieldname like new_S_content_0[]
        const match = file.fieldname.match(/new_S_content_(\d+)\[\]/);
        if (match) {
          const idx = match[1];
          if (!filesBySection[idx]) filesBySection[idx] = [];
          filesBySection[idx].push({ filename: file.filename, path: `/uploads/${file.filename}` });
        }
      });
    }

    console.log('Files by section:', filesBySection);

    const sections = [];
    for (let i = 0; i < S_title.length; i++) {
      sections.push({
        S_title: S_title[i],
        S_description: S_description[i],
        S_content: filesBySection[i] || [],
      });
    }

    console.log('Created sections:', sections);

    if (C_price == 0) {
      price = "free";
    } else {
      price = C_price;
    }

    // Create an instance of the course schema
    const course = new courseSchema({
      userId,
      C_educator,
      C_title,
      C_categories,
      C_price: price,
      C_description,
      sections,
    });

    console.log('Course object to save:', course);

    // Save the course instance to the database
    await course.save();
    console.log('Course saved successfully with ID:', course._id);
    
    res
      .status(201)
      .send({ success: true, message: "Course created successfully" });
  } catch (error) {
    console.error("Error creating course:", error.stack || error);
    
    // Provide more specific error messages based on error type
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).send({ 
        success: false, 
        message: "Validation error: " + validationErrors.join(', ') 
      });
    }
    
    res
      .status(500)
      .send({ success: false, message: `Failed to create course: ${error.message}` });
  }
};

///all courses for the teacher
const getAllCoursesUserController = async (req, res) => {
  try {
    console.log('getAllCoursesUserController: req.user.id =', req.user?.id);
    const allCourses = await courseSchema.find({ userId: req.user.id });
    console.log('getAllCoursesUserController: found courses =', allCourses);
    if (!allCourses) {
      res.send({
        success: false,
        message: "No Courses Found",
      });
    } else {
      res.send({
        success: true,
        message: "All Courses Fetched Successfully",
        data: allCourses,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

///delete courses by the teacher
const deleteCourseController = async (req, res) => {
  const { courseid } = req.params;
  try {
    // First, find the course to get file information
    const course = await courseSchema.findById(courseid);
    
    if (!course) {
      return res.status(404).send({ success: false, message: "Course not found" });
    }

    // Delete all enrollments for this course
    await enrolledCourseSchema.deleteMany({ courseId: courseid });
    console.log(`Deleted enrollments for course: ${courseid}`);

    // Delete all course payments for this course
    await coursePaymentSchema.deleteMany({ courseId: courseid });
    console.log(`Deleted payments for course: ${courseid}`);

    // Delete uploaded files from the server
    if (course.sections && Array.isArray(course.sections)) {
      course.sections.forEach(section => {
        if (section.S_content && Array.isArray(section.S_content)) {
          section.S_content.forEach(file => {
            if (file.filename) {
              const filePath = path.join(__dirname, '../uploads', file.filename);
              try {
                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                  console.log(`Deleted file: ${file.filename}`);
                }
              } catch (fileError) {
                console.error(`Error deleting file ${file.filename}:`, fileError);
              }
            }
          });
        }
      });
    }

    // Finally, delete the course itself
    await courseSchema.findByIdAndDelete(courseid);
    console.log(`Deleted course: ${courseid}`);

    res.status(200).send({ 
      success: true, 
      message: "Course and all related data deleted successfully" 
    });
  } catch (error) {
    console.error("Error in deleting course:", error);
    res.status(500).send({ 
      success: false, 
      message: "Failed to delete course" 
    });
  }
};

////enrolled course by the student

const enrolledCourseController = async (req, res) => {
  const { courseid } = req.params;
  const { userId } = req.body;
  try {
    const course = await courseSchema.findById(courseid);

    if (!course) {
      return res
        .status(404)
        .send({ success: false, message: "Course Not Found!" });
    }

    let course_Length = course.sections.length;

    // Check if the user is already enrolled in the course
    const enrolledCourse = await enrolledCourseSchema.findOne({
      courseId: courseid,
      userId: userId,
      course_Length: course_Length,
    });

    if (!enrolledCourse) {
      const enrolledCourseInstance = new enrolledCourseSchema({
        courseId: courseid,
        userId: userId,
        course_Length: course_Length,
      });

      const coursePayment = new coursePaymentSchema({
        userId: req.body.userId,
        courseId: courseid,
        ...req.body,
      });

      await coursePayment.save();
      await enrolledCourseInstance.save();

      // Increment the 'enrolled' count of the course by +1
      course.enrolled += 1;
      await course.save();

      res.status(200).send({
        success: true,
        message: "Enroll Successfully",
        course: { id: course._id, Title: course.C_title },
      });
    } else {
      res.status(200).send({
        success: false,
        message: "You are already enrolled in this Course!",
        course: { id: course._id, Title: course.C_title },
      });
    }
  } catch (error) {
    console.error("Error in enrolling course:", error);
    res
      .status(500)
      .send({ success: false, message: "Failed to enroll in the course" });
  }
};

/////sending the course content for learning to student
const sendCourseContentController = async (req, res) => {
  const { courseid } = req.params;

  try {
    const course = await courseSchema.findById({ _id: courseid });
    if (!course)
      return res.status(404).send({
        success: false,
        message: "No such course found",
      });

    // Use authenticated user ID from token
    const userId = req.user.id;
    const user = await enrolledCourseSchema.findOne({
      userId: userId,
      courseId: courseid, // Add the condition to match the courseId
    });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    } else {
      return res.status(200).send({
        success: true,
        courseContent: course.sections,
        courseInfo: {
          C_title: course.C_title,
          C_description: course.C_description,
          C_educator: course.C_educator,
          C_categories: course.C_categories,
          C_price: course.C_price,
          status: course.status,
        },
        completeModule: user.progress,
        certficateData: user,
      });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

//////////////completing module////////
const completeSectionController = async (req, res) => {
  const { courseId, sectionId } = req.body; // Assuming you send courseId and sectionId in the request body

  // console.log(courseId, sectionId)
  try {
    // Check if the user is enrolled in the course
    const enrolledCourseContent = await enrolledCourseSchema.findOne({
      courseId: courseId,
      userId: req.body.userId, // Assuming you have user information in req.user
    });

    if (!enrolledCourseContent) {
      return res
        .status(400)
        .send({ message: "User is not enrolled in the course" });
    }

    // Update the progress for the section
    const updatedProgress = enrolledCourseContent.progress || [];
    updatedProgress.push({ sectionId: sectionId });

    // Update the progress in the database
    await enrolledCourseSchema.findOneAndUpdate(
      { _id: enrolledCourseContent._id },
      { progress: updatedProgress },
      { new: true }
    );

    res.status(200).send({ message: "Section completed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

////////////get all courses for paricular user
const sendAllCoursesUserController = async (req, res) => {
  try {
    // Use authenticated user ID from token
    const userId = req.user.id;
    // First, fetch the enrolled courses for the user
    const enrolledCourses = await enrolledCourseSchema.find({ userId });

    // Now, let's retrieve course details for each enrolled course
    const coursesDetails = await Promise.all(
      enrolledCourses.map(async (enrolledCourse) => {
        // Find the corresponding course details using courseId
        const courseDetails = await courseSchema.findOne({
          _id: enrolledCourse.courseId,
        });
        return courseDetails;
      })
    );

    return res.status(200).send({
      success: true,
      data: coursesDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

const getStudentsWithCoursesController = async (req, res) => {
  try {
    // Find all users with type 'student'
    const students = await userSchema.find({ type: 'student' }).select('name email');

    // For each student, find their enrolled courses
    const studentsWithCourses = await Promise.all(
      students.map(async (student) => {
        const enrolledCourses = await enrolledCourseSchema.find({ userId: student._id });
        const courseIds = enrolledCourses.map((enrolled) => enrolled.courseId);
        const courses = await courseSchema.find({ _id: { $in: courseIds } }).select('C_title');
        return {
          _id: student._id,
          username: student.name,
          email: student.email,
          courses: courses.map(course => course.C_title),
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: studentsWithCourses,
    });
  } catch (error) {
    console.error('Error fetching students with courses:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const changePasswordController = async (req, res) => {
  try {
    const userId = req.user.id; // from authMiddleware
    const { oldPassword, newPassword } = req.body;

    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).send({ success: false, message: "Old password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).send({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).send({ success: false, message: "Internal server error" });
  }
};

const editCourseController = async (req, res) => {
  try {
    console.log('Edit course request received:', {
      body: req.body,
      files: req.files ? req.files.length : 0,
      courseId: req.body.courseId
    });
    
    const { courseId, C_title, C_categories, S_title, S_description } = req.body;
    
    // Validate required fields
    if (!courseId) {
      console.log('Missing courseId in request');
      return res.status(400).send({ success: false, message: "Course ID is required" });
    }
    if (!C_title || !C_categories) {
      console.log('Missing required fields:', { C_title, C_categories });
      return res.status(400).send({ success: false, message: "Course title and category are required" });
    }
    
    // Parse existing files for each section
    let existingFiles = [];
    Object.keys(req.body).forEach(key => {
      if (key.startsWith('existing_S_content_')) {
        const match = key.match(/existing_S_content_(\d+)\[\]/);
        if (!match) return; // skip keys that don't match the pattern
        const idx = match[1];
        if (!existingFiles[idx]) existingFiles[idx] = [];
        const val = req.body[key];
        if (Array.isArray(val)) {
          val.forEach(v => {
            try {
              existingFiles[idx].push(JSON.parse(v));
            } catch (parseError) {
              console.error('Error parsing existing file data:', parseError);
            }
          });
        } else {
          try {
            existingFiles[idx].push(JSON.parse(val));
          } catch (parseError) {
            console.error('Error parsing existing file data:', parseError);
          }
        }
      }
    });
    
    console.log('Parsed existing files:', existingFiles);
    
    // Group new files by section index
    const newFilesBySection = {};
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // Expect fieldname like new_S_content_0[]
        const match = file.fieldname.match(/new_S_content_(\d+)\[\]/);
        if (match) {
          const idx = match[1];
          if (!newFilesBySection[idx]) newFilesBySection[idx] = [];
          newFilesBySection[idx].push({
            filename: file.filename,
            path: `/uploads/${file.filename}`,
          });
        }
      });
    }
    
    console.log('New files by section:', newFilesBySection);
    
    // Find the course
    const course = await courseSchema.findById(courseId);
    if (!course) {
      console.log('Course not found with ID:', courseId);
      return res.status(404).send({ success: false, message: "Course not found" });
    }
    
    console.log('Found course:', course.C_title);
    
    // Update course fields
    course.C_title = C_title;
    course.C_categories = C_categories;
    
    // Update sections
    course.sections = course.sections.map((section, idx) => ({
      ...section.toObject(),
      S_title: Array.isArray(S_title) ? S_title[idx] : S_title,
      S_description: Array.isArray(S_description) ? S_description[idx] : S_description,
      S_content: (existingFiles[idx] || []).concat(newFilesBySection[idx] || []),
    }));
    
    console.log('Updated sections:', course.sections);
    
    await course.save();
    console.log('Course saved successfully');
    res.send({ success: true, message: "Course updated successfully" });
  } catch (error) {
    console.error('Error in editCourseController:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages based on error type
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.log('Validation errors:', validationErrors);
      return res.status(400).send({ 
        success: false, 
        message: "Validation error: " + validationErrors.join(', ') 
      });
    }
    
    if (error.name === 'CastError') {
      console.log('Cast error for field:', error.path);
      return res.status(400).send({ 
        success: false, 
        message: "Invalid course ID format" 
      });
    }
    
    res.status(500).send({ 
      success: false, 
      message: "Failed to update course: " + error.message 
    });
  }
};

const debugCourseUpdateController = async (req, res) => {
  try {
    console.log('Debug endpoint called');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('Request headers:', req.headers);
    
    res.status(200).send({ 
      success: true, 
      message: "Debug endpoint working",
      body: req.body,
      filesCount: req.files ? req.files.length : 0
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).send({ success: false, message: error.message });
  }
};

module.exports = {
  registerController,
  loginController,
  getAllCoursesController,
  postCourseController,
  getAllCoursesUserController,
  deleteCourseController,
  enrolledCourseController,
  sendCourseContentController,
  completeSectionController,
  sendAllCoursesUserController,
  getStudentsWithCoursesController,
  changePasswordController,
  editCourseController,
  debugCourseUpdateController
};
