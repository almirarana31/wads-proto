import React, { useState, useEffect } from 'react';
import { authService } from '../api/authService';
import SecondaryButton from '../components/buttons/SecondaryButton';
import { PageTitle, Label } from '../components/text';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

function AuditLogPage() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    action: '',
    user: ''
  });
  // Fetch audit logs
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        const data = await authService.showAudit({
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          action: filters.action || undefined,
          search: filters.user || undefined
        });
        setAuditLogs(data);
        setError(null);
      } catch (err) {
        setError('⚠️ Failed to load audit logs. Please: \n' + 
          '1. Check your network connection\n' +
          '2. Disable ad blocker for this site\n' + 
          '3. Refresh the page');
        console.error('Error fetching audit logs:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call to prevent too many requests
    const timeoutId = setTimeout(fetchAuditLogs, 300);
    return () => clearTimeout(timeoutId);
  }, [filters]); // Re-fetch when filters change
  const handleFilterChange = (e, field) => {
    setFilters(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };
  const exportToPDF = () => {
    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Add title
    doc.setFontSize(16);
    doc.text('System Audit Log', 14, 20);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30);

    // Add filters info if any are active
    const activeFilters = [];
    if (filters.startDate) activeFilters.push(`Start Date: ${filters.startDate}`);
    if (filters.endDate) activeFilters.push(`End Date: ${filters.endDate}`);
    if (filters.action) activeFilters.push(`Action: ${filters.action}`);
    if (filters.user) activeFilters.push(`User: ${filters.user}`);
    
    if (activeFilters.length > 0) {
      doc.text(`Filters Applied: ${activeFilters.join(', ')}`, 14, 35);
    }

    // Prepare table data
    const tableColumns = ['ID', 'Timestamp', 'Action', 'User Email', 'Detail'];
    const tableRows = auditLogs.map(log => [
      log.id?.toString() || '',
      new Date(log.timestamp).toLocaleString(),
      log.action || '',
      log["User.email"] || '',
      log.detail || ''
    ]);    // Add table using autoTable
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: activeFilters.length > 0 ? 40 : 35,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [71, 85, 105], // Gray-700
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // Gray-50
      },
      columnStyles: {
        0: { cellWidth: 15 }, // ID
        1: { cellWidth: 45 }, // Timestamp
        2: { cellWidth: 25 }, // Action
        3: { cellWidth: 50 }, // User Email
        4: { cellWidth: 'auto' } // Detail
      },
      margin: { top: 40, right: 14, bottom: 20, left: 14 },
      didDrawPage: function (data) {
        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
        doc.setFontSize(8);
        doc.text(`Page ${pageNumber} of ${pageCount}`, 
          data.settings.margin.left, 
          doc.internal.pageSize.height - 10
        );
      }
    });
    // Save the PDF
    const filename = `audit-log-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = auditLogs.map(log => ({
      'ID': log.id || '',
      'Timestamp': new Date(log.timestamp).toLocaleString(),
      'Action': log.action || '',
      'User Email': log["User.email"] || '',
      'Detail': log.detail || ''
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 8 },   // ID
      { wch: 20 },  // Timestamp
      { wch: 15 },  // Action
      { wch: 25 },  // User Email
      { wch: 30 }   // Detail
    ];
    worksheet['!cols'] = columnWidths;

    // Add title and metadata as header rows
    const headerData = [
      ['System Audit Log'],
      [`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
      []
    ];

    // Add filters info if any are active
    const activeFilters = [];
    if (filters.startDate) activeFilters.push(`Start Date: ${filters.startDate}`);
    if (filters.endDate) activeFilters.push(`End Date: ${filters.endDate}`);
    if (filters.action) activeFilters.push(`Action: ${filters.action}`);
    if (filters.user) activeFilters.push(`User: ${filters.user}`);
    
    if (activeFilters.length > 0) {
      headerData.push([`Filters Applied: ${activeFilters.join(', ')}`]);
      headerData.push([]);
    }

    // Create new worksheet with headers
    const headerSheet = XLSX.utils.aoa_to_sheet(headerData);
    
    // Append the data
    XLSX.utils.sheet_add_json(headerSheet, excelData, {
      origin: `A${headerData.length + 1}`,
      skipHeader: false
    });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, headerSheet, 'Audit Log');

    // Save the Excel file
    XLSX.writeFile(workbook, `audit-log-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen py-6 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <PageTitle 
            title="System Audit Log"
            subtitle="Track and monitor system activities"
          />
          {/*Action Buttons*/}
          <div className="flex justify-end gap-3 mb-6">
            <SecondaryButton onClick={exportToPDF}>
              Export as PDF
            </SecondaryButton>
            <SecondaryButton onClick={exportToExcel}>
              Export as Excel
            </SecondaryButton>
          </div>

          {/*Filters*/}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label>Start Date</Label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange(e, 'startDate')}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <Label>End Date</Label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange(e, 'endDate')}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <Label>Action Type</Label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange(e, 'action')}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">All Actions</option>
                <option>Create</option>
                <option>Update</option>
                <option>Delete</option>
              </select>
            </div>
            <div>
              <Label>User</Label>
              <input
                type="text"
                placeholder="Search by user email"
                value={filters.user}
                onChange={(e) => handleFilterChange(e, 'user')}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

          {/*Loading and Error States*/}
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading audit logs...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}          {/* Audit Log Table */}          {!loading && !error && (
            <div id="audit-log-table" className="overflow-x-auto">
              <div className="mb-4 text-center">
                <h2 className="text-xl font-bold text-gray-800">System Audit Log</h2>
                <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detail
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {log.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {log["User.email"]}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {log.detail}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/*No Results Message*/}
          {!loading && !error && auditLogs.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No audit logs found matching the current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuditLogPage;
