import React, { useState, useEffect } from 'react';
import { authService } from '../api/authService';
import PrimaryButton from './buttons/PrimaryButton';

const StaffEditModal = ({ isOpen, onClose, onSave, staffData, mode }) => {
  const [loading, setLoading] = useState(false);
  const [staffDetail, setStaffDetail] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('1'); // Default to staff role

  // Fetch both staff details and categories when modal opens
  useEffect(() => {
    async function fetchData() {
      if (!isOpen) return;

      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesData = await authService.getCategories();
        console.log('Fetched categories:', categoriesData);
        setCategories(categoriesData);

        // Set default category if in add mode
        if (mode === 'add' && categoriesData.length > 0) {
          console.log('Setting default category:', categoriesData[0].id);
          setSelectedCategoryId(String(categoriesData[0].id));
        }

        // If in edit mode, fetch staff details and activation status
        if (mode === 'edit' && staffData?.staff_id) {
          const [detailsData, activationData] = await Promise.all([
            authService.getAdminStaffDetail(staffData.staff_id),
            authService.getAdminStaffActivationStatus(staffData.staff_id)
          ]);

          console.log('Staff details:', detailsData);
          console.log('Activation status:', activationData);

          // Set staff details
          setStaffDetail(detailsData[0]); // API returns array, get first item

          // Find and set the matching category
          if (detailsData[0]?.field_name) {
            const matchingCategory = categoriesData.find(
              cat => cat.name === detailsData[0].field_name
            );
            if (matchingCategory) {
              setSelectedCategoryId(String(matchingCategory.id));
            }
          }

          // Set activation status
          setIsGuest(activationData.is_guest);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isOpen, mode, staffData?.staff_id]);

  // Update the staff detail effect
  useEffect(() => {
    if (mode === 'edit' && staffData?.staff_id && isOpen) {
      setLoading(true);
      authService.getAdminStaffDetail(staffData.staff_id)
        .then((data) => {
          console.log('Staff detail data:', data);
          setStaffDetail(data[0]); // API returns an array, get first item
          
          // Find the category ID that matches the field_name from the API
          if (data[0]?.field_name && categories.length > 0) {
            const matchingCategory = categories.find(
              cat => cat.name === data[0].field_name
            );
            if (matchingCategory) {
              setSelectedCategoryId(String(matchingCategory.id));
            }
          }
        })
        .catch(error => {
          console.error('Error fetching staff details:', error);
        })
        .finally(() => setLoading(false));
    } else {
      // Reset for add mode
      setStaffDetail(null);
      if (categories.length) {
        setSelectedCategoryId(String(categories[0].id));
      }
    }
  }, [mode, staffData, isOpen, categories]); // Added categories to dependencies

  // Reset email when modal closes or mode changes
  useEffect(() => {
    if (!isOpen || mode === 'edit') {
      setEmail('');
    }
  }, [isOpen, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'edit' && staffData?.staff_id) {
        await authService.editAdminStaff(staffData.staff_id, {
          category_id: Number(selectedCategoryId),
          is_guest: isGuest
        });
        if (onSave) {
          // Pass the updated data to parent
          onSave({
            ...staffData,
            is_guest: isGuest,
            category_id: Number(selectedCategoryId)
          });
        }
        onClose();
      } else if (mode === 'add') {
        // Add validation check
        if (!selectedCategoryId) {
          alert('Please select a field');
          return;
        }

        // Match the structure used in edit mode for field_id
        const submitData = {
          email: email.trim(),
          field_id: Number(selectedCategoryId), // This matches the database field name
          role_id: Number(selectedRole)
        };
        
        console.log('Selected field ID:', selectedCategoryId);
        console.log('Submitting staff data:', submitData);
        
        await authService.createAdminStaff(submitData);

        if (onSave) onSave();
        onClose();
      }
    } catch (error) {
      console.error('Failed to submit staff form:', error);
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to submit form. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {mode === 'edit' ? 'Edit Staff' : 'Add New Staff'}
        </h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Add email field only in add mode */}
            {mode === 'add' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                  placeholder="Enter staff email"
                />
              </div>
            )}

            {/* Field Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field
              </label>
              <select
                value={selectedCategoryId}
                onChange={e => setSelectedCategoryId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                required
                disabled={loading}
              >
                <option value="">Select a field</option>
                {categories.map(cat => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Activation Status Buttons */}
            {mode === 'edit' && (
              <div className="mb-6 flex gap-2">
                <button
                  type="button"
                  className={`px-4 py-2 rounded transition-colors ${
                    !isGuest ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setIsGuest(false)}
                  disabled={loading}
                >
                  Activate
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded transition-colors ${
                    isGuest ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setIsGuest(true)}
                  disabled={loading}
                >
                  Deactivate
                </button>
              </div>
            )}

            {/* Role Selection - Only for add mode */}
            {mode === 'add' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                  required
                  disabled={loading}
                >
                  <option value="1">Staff</option>
                  <option value="2">Manager</option>
                  <option value="3">Admin</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <PrimaryButton type="submit">
                Save
              </PrimaryButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StaffEditModal;