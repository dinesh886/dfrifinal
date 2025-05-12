"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import UserLayout from "../../layouts/UserLayout"
import DataTable from "../../components/DataTable"
import { formatToDDMMYYYY, calculateFollowUpDate, is24HoursPassed, calculateRemainingTime } from "../../utils/dateUtils"
import "./UserDashboard.css"
import { FilePenLine, CalendarClock, Lock } from "lucide-react"
import { toast } from "react-toastify"
import UploadPopup from "../../components/UploadPopup"

const UserDashboard = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [doctorData, setDoctorData] = useState([])
    const [showUploadPopup, setShowUploadPopup] = useState(false)
    const [currentPatient, setCurrentPatient] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState(null)
    const [isFormSubmitted, setIsFormSubmitted] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())

    // Update current time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (!location.state?.isUpdate) {
            const saved = localStorage.getItem("stepFormData")
            if (saved) {
                try {
                    const parsedData = JSON.parse(saved)
                    if (parsedData.section1.consentForm) {
                        parsedData.section1.consentForm = null
                        parsedData.section1.consentFormPreview = null
                    }
                    setFormData(parsedData)
                } catch (error) {
                    console.error("Error parsing saved form data:", error)
                }
            }
        }

        if (location.state?.showToast) {
            toast.success(location.state.toastMessage)
            window.history.replaceState({}, document.title)
        }

        window.scrollTo(0, 0)
    }, [location])

    const determineFollowUpStatus = (patient) => {
        if (!patient?.followUpStatus) return "Pending"

        const now = new Date()
        const followUpDate = new Date(patient.followUpDate)

        if (patient.followUpStatus === "Completed") return "Completed"
        if (now >= followUpDate) return "Due"
        return "Pending"
    }

    useEffect(() => {
        const loadPatientRecords = () => {
            const storedData = localStorage.getItem("patientRecords")
            let records = []

            try {
                if (storedData) {
                    records = JSON.parse(storedData).map(record => ({
                        ...record,
                        canEdit: !is24HoursPassed(record.submissionDate || record.appointmentDate)
                    }))
                }
            } catch (error) {
                console.error("Error parsing patient records:", error)
            }

            const updatedRecords = records.map((record, index) => {
                const followUpDate = record.followUpDate || calculateFollowUpDate(record.lastVisit)
                const status = determineFollowUpStatus({
                    ...record,
                    followUpDate,
                })

                return {
                    ...record,
                    sNo: index + 1,
                    followUpDate,
                    followUpStatus: status,
                }
            })

            setDoctorData(updatedRecords)
            localStorage.setItem("patientRecords", JSON.stringify(updatedRecords))
        }

        loadPatientRecords()
    }, [])

    const handleStepForm = (patient, isUpdate = false) => {
        navigate(`/user/survey/${patient.patientId}`, {
            state: {
                initialData: patient,
                isReadOnly: !isUpdate,
                isUpdate,
            },
        })
    }

    const handleSubmitFollowUp = (patient) => {
        navigate(`/user/followup/${patient.patientId}`, {
            state: {
                initialData: patient,
                isInitialFollowUp: true,
            },
        })
    }

    const handleFileUpload = (event) => {
        const newFile = event.target.files[0]
        setUploadedFiles((prevFiles) => [...prevFiles, newFile])
    }

    const handleRemoveFile = (index) => {
        setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
    }

    const handleSaveForLater = async () => {
        setIsSaving(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            toast.success("Saved for later!")
            setShowUploadPopup(false)
        } catch (error) {
            toast.error("Failed to save for later")
        } finally {
            setIsSaving(false)
        }
    }

    const handleUploadComplete = async () => {
        setIsSaving(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            toast.success("Concern form saved successfully!")
            setTimeout(() => setShowUploadPopup(false), 1000)
        } catch (error) {
            toast.error("Upload failed!")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDownloadForm = () => {
        const link = document.createElement("a")
        link.href = "/Consent_form_registry.pdf"
        link.download = "Diabetes_Foot_Ulcer_Consent_Form.pdf"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const updatePatientStatus = (patientId, status, additionalData = {}) => {
        const updatedData = doctorData.map(patient =>
            patient.patientId === patientId ? { ...patient, status, ...additionalData } : patient
        )
        setDoctorData(updatedData)
        localStorage.setItem("patientRecords", JSON.stringify(updatedData))
        toast.success(`Patient ${patientId} status updated to ${status}`)
    }

    const handleEdit = (row) => {
        setCurrentPatient(row)
        setUploadedFiles([])
        setShowUploadPopup(true)
    }

    const handleCloseModal = () => {
        setUploadedFiles([])
        setShowUploadPopup(false)
    }

    const columns = [
        {
            key: "sNo",
            header: "S.NO",
            sortable: true,
        },
        {
            key: "patientId",
            header: "Patient ID",
            sortable: true,
        },
        {
            key: "patientName",
            header: "Patient Name",
            sortable: true,
        },
        {
            key: "appointmentDate",
            header: "Appointment Date",
            sortable: true,
            render: (value) => formatToDDMMYYYY(value),
        },
        {
            key: "diagnosis",
            header: "Diagnosis",
            sortable: true,
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: () => (
                <div className="status-container">
                    <span className="status-badge completed">Completed</span>
                </div>
            ),
        },
        {
            key: "lastVisit",
            header: "Last Visit",
            sortable: true,
            render: (value) => formatToDDMMYYYY(value),
        },
        {
            key: "actions",
            header: "Actions",
            sortable: false,
            render: (_, row, externalProps) => {
                const followUpStatus = determineFollowUpStatus(row)
                const { currentTime } = externalProps || {}
                const submissionDate = row.rawSubmissionDate || row.appointmentDate
                const remainingTime = row.canEdit ? calculateRemainingTime(submissionDate, currentTime) : null
                const isEditTimeExpired = remainingTime === "0h 00m 00s" || !remainingTime

                return (
                    <div className="action-buttons">
                        <div className="main-assessment-actions">
                            {row.canEdit && !isEditTimeExpired ? (
                                <>
                                    <a
                                        className="action-btn edit-btn"
                                        onClick={() => handleStepForm(row, true)}
                                        title="Edit assessment"
                                    >
                                        <FilePenLine size={16} />
                                    </a>
                                    {remainingTime && (
                                        <div className="edit-countdown">
                                            <small>You can edit this for another {remainingTime}</small>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="expired-indicator" title="Edit period expired">
                                    <Lock size={16} />
                                    <span className="expired-text">Edit Expired</span>
                                </div>
                            )}
                        </div>
                    </div>
                )
            },
        },
        {
            key: "followUpStatus",
            header: "Follow Up",
            sortable: true,
            render: (_, row) => {
                const status = determineFollowUpStatus(row)

                const handleClick = () => {
                    if (status === "Due") {
                        handleSubmitFollowUp(row)
                    } else if (status === "Pending") {
                        toast.info(`Follow-up available on ${formatToDDMMYYYY(row.followUpDate)}`)
                    }
                }

                return (
                    <div className="follow-up-cell">
                        <div
                            className={`follow-up-content ${status !== "Completed" ? "clickable" : ""}`}
                            onClick={status !== "Completed" ? handleClick : undefined}
                            title={
                                status === "Due"
                                    ? "Click to submit follow-up"
                                    : status === "Pending"
                                        ? `Follow-up available after ${formatToDDMMYYYY(row.followUpDate)}`
                                        : "Follow-up completed"
                            }
                        >
                            <span className={`follow-up-status ${status.toLowerCase()}`}>
                                {status === "Pending" ? "Follow-up Pending" :
                                    status === "Due" ? "Follow-up Due" :
                                        "Follow-up Completed"}
                            </span>
                        </div>

                        {status === "Pending" && row.followUpDate && (
                            <small>
                                <CalendarClock size={12} />
                                Available: {formatToDDMMYYYY(row.followUpDate)}
                            </small>
                        )}

                        {status === "Completed" && row.lastFollowUpDate && (
                            <small>
                                <CalendarClock size={12} />
                                Completed: {formatToDDMMYYYY(row.lastFollowUpDate)}
                            </small>
                        )}
                    </div>
                )
            },
        }
    ]

    const handleAddNew = () => {
        localStorage.removeItem("stepFormData")
        navigate("/user/survey", {
            state: {
                isUpdate: false,
                initialData: null,
            },
        })
    }

    return (
        <UserLayout>
            <div className="doctor-dashboard">
                <DataTable
                    data={doctorData}
                    columns={columns}
                    onAddNew={handleAddNew}
                    showSearch={true}
                    showAddNew={true}
                    showDownloadSample={true}
                    showUploadExcel={true}
                    showExport={false}
                    showDirectExport={false}
                    searchPlaceholder="Search patients..."
                    exportFileName="doctor_patients"
                    rowsPerPageOptions={[5, 10, 25]}
                    defaultRowsPerPage={10}
                    title="Patient Records"
                    extraProps={{ currentTime }}
                />

                {showUploadPopup && currentPatient && (
                    <UploadPopup
                        onClose={handleCloseModal}
                        handleFileUpload={handleFileUpload}
                        handleDownloadForm={handleDownloadForm}
                        uploadedFiles={uploadedFiles}
                        handleRemoveFile={handleRemoveFile}
                        handleSaveForLater={handleSaveForLater}
                        handleUploadComplete={handleUploadComplete}
                        isSaving={isSaving}
                        consentFormPdf="/Consent_form_registry.pdf"
                        updatePatientStatus={updatePatientStatus}
                        currentPatientId={currentPatient.patientId}
                        patientName={currentPatient.patientName}
                        patientId={currentPatient.patientId}
                    />
                )}
            </div>
        </UserLayout>
    )
}

export default UserDashboard