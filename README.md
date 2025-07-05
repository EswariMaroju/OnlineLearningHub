# Learning Hub ✨

Empower your educational journey with a dynamic online learning platform.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

---

## 🚀 Overview

Learning Hub is an online learning platform designed to facilitate course creation, enrollment, and content delivery for students and teachers. It supports role-based access with features tailored for teachers, students, and administrators, providing a seamless educational experience.

---

## 🚀 Key Features

* **Role-Based Access Control**: Secure user registration and login with distinct roles for Teachers, Students, and Administrators.
* **Course Creation & Management**:
    * Teachers can effortlessly create new courses.
    * Courses can include multiple sections, supporting both video and image content.
    * Comprehensive APIs for adding, deleting, and retrieving course information.
* **Student Enrollment & Content Access**: Students can easily enroll in courses and access all associated course materials.
* **User Account Management**: Functionality for users to securely change their passwords.
* **Intuitive Dashboards**: Dedicated home pages and dashboards tailored to each user role for a personalized experience.
* **Secure File Uploads**: Robust handling of multimedia content uploads (videos, images) with secure serving of uploaded files.
* **Responsive User Interface**: A modern, responsive UI built with React components, ensuring a great experience across devices for login, course addition, settings, contact, and dashboards.

---

## 🛠️ Tech Stack

**Frontend:**

* **React 18** with **Vite**: Fast and efficient frontend development.
* **React Router DOM**: Declarative routing for dynamic navigation.
* **Material UI**: A comprehensive set of React components for a polished design.
* **Bootstrap**: Responsive design framework for quick UI development.
* **Axios**: Promise-based HTTP client for making API calls.

**Backend:**

* **Node.js** with **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
* **MongoDB** with **Mongoose ODM**: Flexible NoSQL database with elegant MongoDB object modeling.

**Authentication & Security:**

* **JWT (JSON Web Tokens)**: Secure, token-based user authentication and authorization.
* **Bcryptjs**: Robust password hashing for enhanced security.

**File Management & Other Utilities:**

* **Multer**: Node.js middleware for handling `multipart/form-data`, primarily used for file uploads.
* **CORS**: Middleware for enabling Cross-Origin Resource Sharing.
* **Dotenv**: Zero-dependency module that loads environment variables from a `.env` file.

---



⚙️ Installation Steps
Follow these steps to get your Learning Hub project up and running locally.

1. Clone the Repository
Bash

`git clone https://github.com/EswariMaroju/OnlineLearningHub.git`
cd OnlineLearningHub
2. Backend Setup
Navigate into the backend directory, install dependencies, configure environment variables, and start the server.

Bash

```cd backend
npm install
npm start
```

Create a `.env` file in the backend directory with the following content (replace placeholders with your actual values):

```PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT: The port your backend server will run on (e.g., 8000).
```

Once the .env file is set up, start the backend server:

Bash

```npm start
The backend server should now be running, typically on http://localhost:5173.
```

3. Frontend Setup
Open a new terminal window, navigate into the frontend directory, install dependencies, and start the development server.

Bash

```cd ../frontend # Go back to the root and then into frontend
npm install
npm run dev
The frontend development server should now be running, usually on http://localhost:5173 (Vite's default).
```

**🚀 Usage Instructions**
**Access the Frontend:** Open your web browser and navigate to the frontend development server URL (typically http://localhost:5173).

**Register:** Sign up as a new user. You can choose to register as a Teacher, Student, or Admin.

**Login:** Use your registered credentials to log in. You will be redirected to a dashboard tailored to your user role.

**Teachers:**

Navigate to the "Add Course" page to create new courses.

Upload video or image content for each course section.

**Students:**

Browse available courses.

Enroll in courses of interest and access the course content.

**Explore:** Utilize the various pages like "Settings" for password changes, "Contact" for inquiries, and the respective dashboards to explore the full functionality.

**📄 License**
**Backend:** This part of the project is licensed under the ISC License. See the package.json file in the backend directory for details.

**Frontend:** No explicit license information was found for the frontend.

**📝 Additional Notes**
This project is inspired by modern e-learning platforms, with a strong focus on modular course content and robust role-based access control.

All communication between the frontend and backend is handled via RESTful APIs.

The project ensures secure handling and serving of uploaded multimedia content (videos and images).
