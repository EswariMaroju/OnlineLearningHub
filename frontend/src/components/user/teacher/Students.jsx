import React, { useEffect, useState } from 'react';
import axiosInstance from '../../common/AxiosInstance';
import { Table, ProgressBar } from 'react-bootstrap';

const Students = () => {
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const res = await axiosInstance.get('/api/user/studentsWithCourses', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div>
      <h2>Registered Students</h2>
      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Courses Enrolled</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.username}</td>
                <td>{student.email}</td>
                <td>
                  {student.courses && student.courses.length > 0 ? (
                    <ul>
                      {student.courses.map((course, index) => (
                        <li key={index}>{course}</li>
                      ))}
                    </ul>
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default Students;
