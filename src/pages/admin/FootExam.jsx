"use client"

import { useEffect, useState } from "react"
import AdminLayout from "../../layouts/AdminLayout"
import DataTable from "../../components/DataTable"
import { CircleCheck, Loader } from "lucide-react"
import { apiGet } from "../../services/api-helper"
import { toast } from "react-toastify"

const FootExam = () => {
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                setLoading(true)
                setError(null)

                // Fetch all patients from the API
                const response = await apiGet("patient")

                if (!response || !Array.isArray(response)) {
                    throw new Error("Invalid response format")
                }

                // Format the data similar to the localStorage version
                const formattedRecords = response.map((record, index) => {
                    // Ensure doctor email exists in multiple possible locations
                    const doctorEmail = record.doctorEmail || record.formData?.section1?.doctorEmail || "unknown@doctor.com"

                    return {
                        ...record,
                        sNo: index + 1,
                        doctorEmail, // Ensure it exists at top level
                    }
                })

                setRecords(formattedRecords)
            } catch (error) {
                console.error("Error fetching patient records:", error)
                setError("Failed to load patient records. Please try again later.")
                toast.error("Failed to load patient records")
            } finally {
                setLoading(false)
            }
        }

        fetchPatients()

        // Set up a refresh interval (optional)
        const refreshInterval = setInterval(fetchPatients, 5 * 60 * 1000) // Refresh every 5 minutes

        return () => clearInterval(refreshInterval)
    }, [])

    // Define columns for the DataTable
    const columns = [
        { key: "sNo", header: "S.NO", sortable: true },
        { key: "patientId", header: "Participant ID", sortable: true },
        {
            key: "doctorEmail",
            header: "Doctor Email",
            sortable: true,
            render: (value, record) => {
                // Check multiple possible locations for the email
                return value || record.formData?.section1?.doctorEmail || "N/A"
            },
        },
        {
            key: "patientName",
            header: "Participant Name",
            sortable: true,
        },
        {
            key: "submissionDate",
            header: "Date",
            sortable: true,
            render: (value, record) => {
                // First try to use the pre-formatted date
                if (value && typeof value === "string" && value.includes("/")) {
                    return value
                }

                // Fallback to raw date formatting
                const dateToFormat = value || record.rawSubmissionDate || record.appointmentDate
                try {
                    return new Date(dateToFormat).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    })
                } catch {
                    return "N/A"
                }
            },
        },
        {
            key: "status",
            header: "Status",
            sortable: false,
            render: (value) => (
                <span className={`status-badge ${value?.toLowerCase() || "unknown"}`}>
                    <CircleCheck size={16} />
                </span>
            ),
        },
    ]

    const handleAddNew = () => {
        console.log("Add new participant clicked")
        // You can trigger a modal or redirect to form
    }

    const handleRefresh = async () => {
        try {
            setLoading(true)
            const response = await apiGet("patient")

            if (!response || !Array.isArray(response)) {
                throw new Error("Invalid response format")
            }

            const formattedRecords = response.map((record, index) => ({
                ...record,
                sNo: index + 1,
                doctorEmail: record.doctorEmail || record.formData?.section1?.doctorEmail || "unknown@doctor.com",
            }))

            setRecords(formattedRecords)
            toast.success("Patient records refreshed successfully")
        } catch (error) {
            console.error("Error refreshing records:", error)
            toast.error("Failed to refresh patient records")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AdminLayout>
            <div className="manage-data-page">
                <div className="page-header">
                    <h1>RSSDI Save the Feet 2.0</h1>
                    <p>View, manage, and export participant records in the system.</p>

                    <div className="header-actions">
                        <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader size={16} className="animate-spin" />
                                    <span>Loading...</span>
                                </>
                            ) : (
                                <>
                                    <span>Refresh Data</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {error ? (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={handleRefresh} className="retry-button">Try Again</button>
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
    )
}

export default FootExam
