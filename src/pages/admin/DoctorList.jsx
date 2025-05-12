"use client"

import { useState, useEffect } from "react"
import AdminLayout from "../../layouts/AdminLayout"
import DataTable from "../../components/DataTable"
import { FaTrash } from "react-icons/fa"
import { IoMdCheckmark, IoMdClose } from "react-icons/io"
import "./ManageData.css"
import { toast } from "react-toastify"
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal"
import { apiRequest } from "../../services/api-helper"
import { FaSync, FaSpinner } from "react-icons/fa"
const DoctorList = () => {
    const [doctors, setDoctors] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [deleteModal, setDeleteModal] = useState({
        visible: false,
        doctor: null,
        isLoading: false,
    })

    // Fetch all doctors from API
    const fetchDoctors = async () => {
        setIsLoading(true)
        try {
            const response = await apiRequest("/doctors")
            console.log("API Response:", response)

            // Make sure we're working with the data property if your API wraps data
            const data = response.data || response
            setDoctors(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Error fetching doctors:", error)
            setError(error.message)
            toast.error(`Error fetching doctors: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }
    useEffect(() => {
        fetchDoctors()
    }, [])

    // Toggle doctor status
    const toggleStatus = async (doctor) => {
        const newStatus = doctor.status === "Enabled" ? "Disabled" : "Enabled"

        try {
            // Optimistic UI update
            setDoctors(prevDoctors =>
                prevDoctors.map(d =>
                    d.id === doctor.id ? { ...d, status: newStatus } : d
                )
            )

            await apiRequest(`/doctors/${doctor.id}/status`, {
                method: "PUT",
                body: JSON.stringify({ status: newStatus }),
            })

            if (newStatus === "Enabled") {
                toast.success(`${doctor.doctors_name} has been enabled`)
            } else {
                toast.info(`${doctor.doctors_name} has been disabled`)
            }

        } catch (error) {
            console.error("Error toggling status:", error)

            // Revert UI if API call fails
            setDoctors(prevDoctors =>
                prevDoctors.map(d =>
                    d.id === doctor.id ? { ...d, status: doctor.status } : d
                )
            )

            toast.error(`Error updating status: ${error.message}`)
        }
    }
    
    

    // Delete doctor
    const handleDeleteConfirm = async () => {
        setDeleteModal((prev) => ({ ...prev, isLoading: true }))
        try {
            await apiRequest(`/doctors/${deleteModal.doctor.id}`, {
                method: "DELETE",
            })

            fetchDoctors()
            toast.success(`${deleteModal.doctor?.doctors_name} has been deleted`)
        } catch (error) {
            console.error("Error deleting doctor:", error)
            toast.error(`Error deleting doctor: ${error.message}`)
        } finally {
            setDeleteModal({
                visible: false,
                doctor: null,
                isLoading: false,
            })
        }
    }
    const showDeleteConfirmation = (doctor) => {
        setDeleteModal({
            visible: true,
            doctor,
            isLoading: false,
        })
    }

    const handleDeleteCancel = () => {
        setDeleteModal({
            visible: false,
            doctor: null,
            isLoading: false,
        })
    }

    const handleAddNew = () => {
        toast.success("Add new doctor form opened")
        // You would typically navigate to an add doctor form here
        // navigate('/admin/doctors/add');
    }

    const columns = [
    
        {
            key: "id",
            header: "ID",
            sortable: true,
        },
        {
            key: "doctors_name",
            header: "Name",
            sortable: true,
        },
        {
            key: "email", // This should match the field in your data object
            header: "Email",
            sortable: true,
            render: (value) => (
                <span>{value || 'No email'}</span> // Display email or a default text
            ),
        },
        
        {
            key: "phone",
            header: "Phone",
            sortable: true,
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (value, row) => (
                <div
                    className={`status-toggle ${value?.toLowerCase?.() || ''}`}
                    onClick={(e) => {
                        e.stopPropagation()
                        toggleStatus(row)
                    }}
                >
                    <div className="status-toggle-track">
                        <div className={`status-toggle-thumb ${value === "Enabled" ? "enabled" : "disabled"}`}>
                            {value === "Enabled" ? (
                                <IoMdCheckmark className="status-icon" />
                            ) : (
                                <IoMdClose className="status-icon" />
                            )}
                        </div>
                    </div>
                    <span className="status-label">{value}</span>
                </div>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            sortable: false,
            render: (_, row) => (
                <div className="action-buttons">
                    <button
                        className="action-btn delete-action"
                        onClick={(e) => {
                            e.stopPropagation()
                            showDeleteConfirmation(row)
                        }}
                        title="Delete doctor"
                    >
                        <FaTrash size={14} />
                    </button>
                </div>
            ),
        },
    ]

    return (
        <AdminLayout>
            <div className="manage-doctors-page">
                <div className="page-header">
                    <h1>Doctors Management</h1>
                    <p>Manage and monitor all registered doctors in the system</p>
                </div>

                {isLoading ? (
                    <div className="loading-indicator">
                        <FaSpinner className="loading-spinner" />
                        <span className="loader">Loading doctors data...</span>
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <div className="error-content">
                            <p>{error}</p>
                            <button onClick={fetchDoctors} className="retry-button">
                                <FaSync className="retry-icon" />
                                <span>Retry</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <DataTable
                        data={doctors}
                        columns={columns}
                        onAddNew={handleAddNew}
                        showSearch={true}
                        showAddNew={false}
                        showDownloadSample={false}
                        showUploadExcel={false}
                        showExport={false}
                        showDirectExport={true}
                        searchPlaceholder="Search doctors..."
                        exportFileName="doctors_list"
                        rowsPerPageOptions={[10, 25, 50]}
                        defaultRowsPerPage={10}
                    />
                )}

                <DeleteConfirmationModal
                    visible={deleteModal.visible}
                    itemName={deleteModal.doctor?.doctors_name || ""}

                    onCancel={handleDeleteCancel}
                    onConfirm={handleDeleteConfirm}
                    isLoading={deleteModal.isLoading}
                />
            </div>
        </AdminLayout>
    )
}

export default DoctorList
