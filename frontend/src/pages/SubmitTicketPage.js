import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

function SubmitTicketPage() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    title: '',
    category: 'General',
    description: '',
    contactMethod: {
      email: false,
      phone: false
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      contactMethod: {
        ...formData.contactMethod,
        [name]: checked
      }
    });
  };

  const handleSubmit = () => {
    // This would be where backend integration happens
    console.log('Form submitted:', formData);
    alert('Ticket submitted successfully!');
    // Reset form
    setFormData({
      email: '',
      phone: '',
      title: '',
      category: 'General',
      description: '',
      contactMethod: {
        email: false,
        phone: false
      }
    });
  };

  return (
    <div className="bg-blue-100 py-6 md:py-12 px-4 flex-grow">
      <div className="bg-white p-6 md:p-8 rounded shadow-md max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Submit a Ticket</h1>
        <p className="text-gray-600 mb-6">Submit your question or issue below</p>
        
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label htmlFor="email" className="block text-blue-700 mb-2">Email Address:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-blue-700 mb-2">Phone Number:</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="title" className="block text-blue-700 mb-2">Ticket Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-blue-700 mb-2">Category:</label>
            <div className="relative">
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="appearance-none w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="General">General</option>
                <option value="Technical">Technical</option>
                <option value="Billing">Billing</option>
                <option value="Service">Service</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-blue-700 mb-2">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="6"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            ></textarea>
          </div>
          <div>
            <label className="block text-blue-700 mb-2">Preferred Contact Method:</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email-contact"
                  name="email"
                  checked={formData.contactMethod.email}
                  onChange={handleCheckboxChange}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="email-contact">Email</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="phone-contact"
                  name="phone"
                  checked={formData.contactMethod.phone}
                  onChange={handleCheckboxChange}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="phone-contact">Phone</label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-700 hover:bg-blue-800 text-white py-3 px-6 sm:px-8 rounded-md text-lg font-medium transition-colors w-full sm:w-auto"
            >
              Submit a Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubmitTicketPage;