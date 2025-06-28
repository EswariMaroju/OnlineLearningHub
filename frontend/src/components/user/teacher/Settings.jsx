import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axiosInstance from '../../common/AxiosInstance';

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [variant, setVariant] = useState('success');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('New password and confirm password do not match.');
      setVariant('danger');
      return;
    }

    try {
      const res = await axiosInstance.post('/api/user/change-password', {
        oldPassword: currentPassword,
        newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (res.data.success) {
        setMessage('Password changed successfully.');
        setVariant('success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage(res.data.message || 'Failed to change password.');
        setVariant('danger');
      }
    } catch (error) {
      setMessage('An error occurred while changing password.');
      setVariant('danger');
    }
  };

  return (
    <div>
      <h2>Change Password</h2>
      {message && <Alert variant={variant}>{message}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="currentPassword" className="mb-3">
          <Form.Label>Current Password</Form.Label>
          <Form.Control
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="newPassword" className="mb-3">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="confirmPassword" className="mb-3">
          <Form.Label>Confirm New Password</Form.Label>
          <Form.Control
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Change Password
        </Button>
      </Form>
    </div>
  );
};

export default Settings;
