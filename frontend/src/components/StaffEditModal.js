import React, { useState } from 'react';
import PropTypes from 'prop-types';
import PrimaryButton from './buttons/PrimaryButton';
import ConfirmationModal from './ConfirmationModal';

const StaffEditModal = ({ isOpen, onClose, onSave }) => {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    role: 'staff', // default value
    field: 'technical', // default value
    isActive: true
  });

  // Confirmation modal state
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsConfirmationOpen(true);
  };

  // Handle confirmation
  const handleConfirm = () => {
    // TODO: When implementing backend:
    // 1. Create an async function to handle API call
    // 2. Send formData to the endpoint (POST /api/staff)
    // 3. Handle response and errors
    // 4. Show success/error notification
    // Example:
    /*
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Failed to create staff');
      onSave(formData);
    } catch (error) {
      // Handle error
    }
    */

    onSave(formData);
    setIsConfirmationOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add New Staff</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>

          {/* Role Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            >
              <option value="staff">Staff</option>
              <option value="senior">Senior Staff</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>

          {/* Field Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field
            </label>
            <select
              name="field"
              value={formData.field}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            >
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="general">General</option>
              <option value="customer_service">Customer Service</option>
            </select>
          </div>

          {/* Account Activation Checkbox */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded border-gray-300 text-bianca-primary shadow-sm focus:border-bianca-primary focus:ring focus:ring-bianca-primary/20 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Account Active</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <PrimaryButton type="submit">
              Save Staff
            </PrimaryButton>
          </div>
        </form>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={isConfirmationOpen}
          onClose={() => setIsConfirmationOpen(false)}
          onConfirm={handleConfirm}
          title="Confirm Staff Addition"
          message="Are you sure you want to add this staff member with the specified details?"
        />
      </div>
    </div>
  );
};

StaffEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default StaffEditModal;