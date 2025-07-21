
"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import DataTable from "../../components/DataTable";
import { CircleCheck, Loader, Eye, ScanEye } from "lucide-react";
import { apiGet } from "../../services/api-helper";
import { toast } from "react-toastify";
import { formatToDDMMYYYY } from "../../utils/dateUtils";
import { FaSpinner, FaSync } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Tooltip } from "antd";
const FootExam = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const response = await apiGet("patient");
      console.log("FootExam Raw API Response:", response);
  
      const patientRecords = Array.isArray(response.patients) ? response.patients : [];
      console.log("FootExam Extracted Patient Records:", patientRecords);
  
      if (patientRecords.length === 0) {
        console.warn("No patient records found in API response");
        toast.warn("No patient records available");
      }
  
      // ✅ 1. Sort records by updated_at (or created_at) descending
      const sorted = [...patientRecords].sort((a, b) => 
        new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
      );
  
      // ✅ 2. Add serial numbers AFTER sorting
      const formattedRecords = sorted.map((record, index) => ({
        sNo: index + 1,
        patientId: String(record.id) || `PAT - ${ index + 1 } `,
        patientName: record.patient_name || "Unknown",
        doctorEmail: record.doctor_email || "N/A",
        submissionDate: record.created_at || new Date().toISOString(),
        created_at: record.created_at || new Date().toISOString(),
        updated_at: record.updated_at || record.created_at || new Date().toISOString(),
        status: record.status || "Completed",
      }));
  
      console.log("FootExam Formatted Records:", formattedRecords);
      setRecords(formattedRecords);
    } catch (error) {
      console.error("Error fetching patient records:", error);
      setError("Failed to load patient records. Please try again later.");
      toast.error("Failed to load patient records");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchPatients();

    // Set up a refresh interval (every 5 minutes)
    const refreshInterval = setInterval(fetchPatients, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  const handleRefresh = async () => {
    await fetchPatients();
    if (!error) {
      toast.success("Patient records refreshed successfully");
    }
  };

  const columns = [
    { key: "sNo", header: "S.NO", sortable: true },
    { key: "patientId", header: "Participant ID", sortable: true },
    {
      key: "doctorEmail",
      header: "Doctor Email",
      sortable: true,
      render: (value) => value || "N/A",
    },
    {
      key: "patientName",
      header: "Participant Name",
      sortable: true,
    },
    // New Created Date column
    {
      key: "created_at",
      header: "Created Date",
      sortable: true,
      render: (value) => {
        try {
          return formatToDDMMYYYY(value);
        } catch {
          return "N/A";
        }
      },
    },
    // New Updated Date column
    {
      key: "updated_at",
      header: "Updated Date",
      sortable: true,
      render: (value, record) => {
        try {
          // If updated_at doesn't exist, show created_at instead
          return formatToDDMMYYYY(value || record.created_at);
        } catch {
          return "N/A";
        }
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: false,
      render: (value) => (
        <Tooltip title="Status Completed">
        <span className={`status-badge ${value?.toLowerCase() || "completed"}`}>
          <CircleCheck size={16} />
        </span>
            </Tooltip >
      ),
    },
    // Add this to your columns array:
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (_, record) => (
        <Tooltip title="View Records">
          <Link
            to={`/admin/patient/${record.patientId || record.id}`}
            className="view-details-link"
          >
            <ScanEye className="view-details" />
          </Link>
        </Tooltip>
      ),
    }

    
  ];

  const handleAddNew = () => {
    console.log("Add new participant clicked");
    // Admin typically doesn't add patients; this can be removed or implemented
  };

  return (
    <AdminLayout>
      <div className="manage-data-page">
        <div className="page-header">
          <h1>RSSDI Save the Feet 2.0</h1>
          <p>View, manage, and export participant records in the system.</p>

          <div className="header-actions footexam-actions">
            {/* <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <span>Refresh Data</span>
              )}
            </button> */}
          </div>
        </div>

        {loading ? (
          <div className="loading-indicator">
            <div className="loader"></div>
            {/* <span className="loader">Loading patient records...</span> */}
          </div>
        ) : error ? (
          <div className="error-message">
            <div className="error-content">
              <p>{error}</p>
              <button onClick={handleRefresh} className="retry-button">
                <FaSync className="retry-icon" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        ) : (
          <DataTable
            data={records}
            columns={columns}
            showSearch={true}
            showAddNew={false}
            showDownloadSample={false}
            showUploadExcel={false}
            showExport={true}
            showDirectExport={false}
            showDownloadSubadmin ={false}
            showaddsubadmin={false}
            onAddNew={handleAddNew}
            searchPlaceholder="Search participants..."
            exportFileName="participants"
            rowsPerPageOptions={[10, 25, 50]}
            defaultRowsPerPage={10}
            loading={loading}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default FootExam;
