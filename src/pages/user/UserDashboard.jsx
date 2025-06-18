"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import UserLayout from "../../layouts/UserLayout"
import DataTable from "../../components/DataTable"
import { formatToDDMMYYYY, is24HoursPassed, calculateRemainingTime } from "../../utils/dateUtils"
import "./UserDashboard.css"
import { FilePenLine, CalendarClock, Lock } from "lucide-react"
import { toast } from "react-toastify"
import UploadPopup from "../../components/UploadPopup"
import { apiGet } from "../../services/api-helper"

const UserDashboard = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [doctorData, setDoctorData] = useState([])
    const [showUploadPopup, setShowUploadPopup] = useState(false)
    const [currentPatient, setCurrentPatient] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState(null)
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (location.state?.refresh) {
            loadPatientRecords()
        }
    }, [location.state])

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

    const calculateSixMonthFollowUp = (submissionDate) => {
        const date = new Date(submissionDate)
        if (isNaN(date.getTime())) return new Date()
        date.setMinutes(date.getMinutes() + 5) // For testing
        // date.setMonth(date.getMonth() + 6); // For production
        return date.toISOString()
    }

    const determineFollowUpStatus = (patient) => {
        if (!patient?.submissionDate) return "Pending"

        if (patient.follow_up_status === "Completed" && patient.last_follow_up_date) {
            return "Completed"
        }

        const now = new Date()
        const followUpDate = new Date(patient.followUpDate || calculateSixMonthFollowUp(patient.submissionDate))

        if (now >= followUpDate) return "Due"
        return "Pending"
    }
  
    const handleStepForm = (patient, isUpdate = false) => {
        console.log("Navigating with isUpdate:", isUpdate);

        const formData = {
            section1: {
                ...patient.formData?.section1,
                hasUlcer: convertToYesNo(patient.formData?.section1?.hasUlcer || patient.originalRecord?.hasUlcer),
                hasAmputation: convertToYesNo(patient.formData?.section1?.hasAmputation || patient.originalRecord?.hasAmputation),
                hasAngioplasty: convertToYesNo(patient.formData?.section1?.hasAngioplasty || patient.originalRecord?.hasAngioplasty),
                renal: convertToYesNo(patient.formData?.section1?.renal || patient.originalRecord?.renal),
                retinal: convertToYesNo(patient.formData?.section1?.retinal || patient.originalRecord?.retinal),
                cardiovascular: convertToYesNo(patient.formData?.section1?.cardiovascular || patient.originalRecord?.cardiovascular),
                cerebrovascular: convertToYesNo(patient.formData?.section1?.cerebrovascular || patient.originalRecord?.cerebrovascular),
                // imbIschemia: convertToYesNo(patient.formData?.section1?.imbIschemia || patient.originalRecord?.imbIschemia),
                hypertension: convertToYesNo(patient.formData?.section1?.hypertension || patient.originalRecord?.hypertension),
                consentDownloaded: convertToYesNo(patient.formData?.section1?.consentDownloaded || patient.originalRecord?.consentDownloaded),
                consentUploaded: convertToYesNo(patient.formData?.section1?.consentUploaded || patient.originalRecord?.consentUploaded),
                consentVerified: convertToYesNo(patient.formData?.section1?.consentVerified || patient.originalRecord?.consentVerified),
                limbIschemia: convertToYesNo(patient.formData?.section1?.limbIschemia || patient.originalRecord?.limbIschemia),
            },
            section2: {
                ...patient.formData?.section2,
                necrosis: convertToYesNo(patient.formData?.section2?.necrosis || patient.originalRecord?.necrosis),
                gangrene: convertToYesNo(patient.formData?.section2?.gangrene || patient.originalRecord?.gangrene),
                probetobone: convertToYesNo(patient.formData?.section2?.probetobone || patient.originalRecord?.probetobone),
                osteomyelitis: convertToYesNo(patient.formData?.section2?.osteomyelitis || patient.originalRecord?.osteomyelitis),
                sepsis: convertToYesNo(patient.formData?.section2?.sepsis || patient.originalRecord?.sepsis),
                arterialIssues: convertToYesNo(patient.formData?.section2?.arterialIssues || patient.originalRecord?.arterialIssues),
                infection: convertToYesNo(patient.formData?.section2?.infection || patient.originalRecord?.infection),
                swelling: convertToYesNo(patient.formData?.section2?.swelling || patient.originalRecord?.swelling),
                erythema: convertToYesNo(patient.formData?.section2?.erythema || patient.originalRecord?.erythema),
                tenderness: convertToYesNo(patient.formData?.section2?.tenderness || patient.originalRecord?.tenderness),
                warmth: convertToYesNo(patient.formData?.section2?.warmth || patient.originalRecord?.warmth),
                // discharge: convertToYesNo(patient.formData?.section2?.discharge || patient.originalRecord?.discharge),
                necrosisPhoto: patient.formData?.section2?.necrosisPhoto || patient.originalRecord?.necrosisPhoto,
                
            },
            section3: {
                ...patient.formData?.section3,
                burningSensation: convertToYesNo(patient.formData?.section3?.burningSensation || patient.originalRecord?.burningSensation),
                painWhileWalking: convertToYesNo(patient.formData?.section3?.painWhileWalking || patient.originalRecord?.painWhileWalking),
                skinChanges: convertToYesNo(patient.formData?.section3?.skinChanges || patient.originalRecord?.skinChanges),
                sensationLoss: convertToYesNo(patient.formData?.section3?.sensationLoss || patient.originalRecord?.sensationLoss),
                nailProblems: convertToYesNo(patient.formData?.section3?.nailProblems || patient.originalRecord?.nailProblems),
                fungalInfection: convertToYesNo(patient.formData?.section3?.fungalInfection || patient.originalRecord?.fungalInfection),
                skinLesions: convertToYesNo(patient.formData?.section3?.skinLesions || patient.originalRecord?.skinLesions),
                openWound: convertToYesNo(patient.formData?.section3?.openWound || patient.originalRecord?.openWound),
                cellulitis: convertToYesNo(patient.formData?.section3?.cellulitis || patient.originalRecord?.cellulitis),
                // monofilamentLeftA: convertToYesNo(patient.formData?.section3?.monofilamentLeftA || patient.originalRecord?.monofilamentLeftA),
                // monofilamentLeftB: convertToYesNo(patient.formData?.section3?.monofilamentLeftB || patient.originalRecord?.monofilamentLeftB),
                // monofilamentLeftC: convertToYesNo(patient.formData?.section3?.monofilamentLeftC || patient.originalRecord?.monofilamentLeftC),
                // monofilamentRightA: convertToYesNo(patient.formData?.section3?.monofilamentRightA || patient.originalRecord?.monofilamentRightA),
                // monofilamentRightB: convertToYesNo(patient.formData?.section3?.monofilamentRightB || patient.originalRecord?.monofilamentRightB),
                // monofilamentRightC: convertToYesNo(patient.formData?.section3?.monofilamentRightC || patient.originalRecord?.monofilamentRightC),
                footDeformities: convertToYesNo(patient.formData?.section3?.footDeformities || patient.originalRecord?.footDeformities),
                hairGrowth: convertToYesNo(patient.formData?.section3?.hairGrowth || patient.originalRecord?.hairGrowth),
                pulsesPalpable: convertToYesNo(patient.formData?.section3?.pulsesPalpable || patient.originalRecord?.pulsesPalpable),
                skinTemperature: convertToYesNo(patient.formData?.section3?.skinTemperature || patient.originalRecord?.skinTemperature),
                // ulcerPresence: convertToYesNo(patient.formData?.section3?.ulcerPresence || patient.originalRecord?.ulcerPresence),
            }
        };

        navigate(`/user/survey/${patient.patientId}`, {
            state: {
                initialData: {
                    patientId: patient.patientId,
                    formData: formData,
                },
                isReadOnly: !isUpdate,
                isUpdate,
            },
        });
    };


    const normalizeYesNo = (val) => {
        // Check for null or undefined first
        if (val === null || val === undefined) return ""

        // Convert to string for consistent comparison
        const strVal = String(val).toLowerCase()

        // Check for various "yes" representations
        if (strVal === "yes" || strVal === "1" || strVal === "true" || val === 1 || val === true) {
            return "yes"
        }

        // Check for various "no" representations
        if (strVal === "no" || strVal === "0" || strVal === "false" || val === 0 || val === false) {
            return "no"
        }

        // Return empty string if no match
        return ""
    }
    const convertToYesNo = normalizeYesNo;
    const loadPatientRecords = async () => {
        try {
            const currentUser = JSON.parse(sessionStorage.getItem("userInfo") || "{}")
            const doctorId = currentUser?.id || ""
            const doctorEmail = currentUser?.email || "unknown@doctor.com"

            if (!doctorId) {
                throw new Error("Doctor ID not found in user info")
            }

            console.log("Fetching patient records for:", { doctorId, doctorEmail })

            const records = await apiGet("patient", {
                doctor_id: doctorId,
                doctor_email: doctorEmail,
            })
            console.log("Raw API Response:", records)

            const patientRecords = Array.isArray(records.patients) ? records.patients : Array.isArray(records) ? records : []
            console.log("Extracted Patient Records:", patientRecords)

            if (patientRecords.length === 0) {
                console.warn("No patient records found for doctor ID:", doctorId)
                setDoctorData([])
                localStorage.removeItem("patientRecords")
                return
            }

            const localRecords = JSON.parse(localStorage.getItem("patientRecords") || "[]")

            const filteredRecords = patientRecords.filter(
                (record) => record.doctor_id === doctorId || record.doctor_email === doctorEmail,
            )
            console.log("Filtered Records:", filteredRecords)

            const mappedRecords = filteredRecords.map((record, index) => {
                const submissionDate = record.submission_date || record.created_at || new Date().toISOString()
                const followUpDate = record.follow_up_date || calculateSixMonthFollowUp(submissionDate)

                const localRecord = localRecords.find((lr) => lr.patientId === (record.id || record.patient_id))

                const status = determineFollowUpStatus({
                    ...record,
                    submissionDate,
                    followUpDate,
                })

                // Map all boolean fields consistently
                const booleanFields = [
                    "hasUlcer",
                    "hasAmputation",
                    "hasAngioplasty",
                    "renal",
                    "retinal",
                    "cardiovascular",
                    "cerebrovascular",
                    // "imbIschemia",
                    "hypertension",
                    "limbIschemia",
                    "necrosis",
                    "gangrene",
                    "probetobone",
                    "osteomyelitis",
                    "sepsis",
                    "arterialIssues",
                    "infection",
                    "swelling",
                    "erythema",
                    "tenderness",
                    "warmth",
                 
                    "burningSensation",
                    "painWhileWalking",
                    "skinChanges",
                    "sensationLoss",
                    "nailProblems",
                    "fungalInfection",
                    "skinLesions",
                    "openWound",
                    "cellulitis",
                    "footDeformities",
                    "hairGrowth",
                    "pulsesPalpable",
                    // "ulcerPresence",
                ]

                // Create a normalized record with consistent boolean values
                const normalizedRecord = { ...record }
                booleanFields.forEach((field) => {
                    if (field in record) {
                        normalizedRecord[field] = normalizeYesNo(record[field])
                    }
                })

                return {
                    sNo: index + 1,
                    patientId: record.id || record.patient_id || `PAT-${index + 1}`,
                    patient_name: record.patient_name || record.name || "Unknown",
                    appointmentDate: record.appointment_date || record.created_at || new Date().toISOString(),
                    diagnosis: record.diagnosis || "N/A",
                    status: record.status || "Completed",
                    lastVisit: record.last_visit || record.updated_at || new Date().toISOString(),
                    followUpDate,
                    follow_up_status: record.follow_up_status || status,
                    submissionDate,
                    canEdit: !is24HoursPassed(submissionDate),
                    lastFollowUpDate: record.last_follow_up_date || null,
                    doctor_id: record.doctor_id,
                    doctor_email: record.doctor_email,
                    followUpData: localRecord?.followUpData || null,
                    // Store the original record for reference
                    originalRecord: normalizedRecord,
                    formData: {
                        section1: {
                            patient_name: record.patient_name || "",
                            address: record.address || "",
                            locality: record.locality || "",
                            age: record.age || "",
                            gender: record.gender || "",
                            facilityName: record.facilityName || "",
                            facilityLocation: record.facilityLocation || "",
                            facilityType: record.facilityType || "",
                            education: record.education || "",
                            occupation: record.occupation || "",
                            maritalStatus: record.maritalStatus || "",
                            monthlyIncome: record.monthlyIncome || "",
                            familyMembers: record.familyMembers || "",
                            dependents: record.dependents || "",
                            diabetesType: record.diabetesType || "",
                            diabetesDuration: record.diabetesDuration || "",
                            hasUlcer: normalizeYesNo(record.hasUlcer),
                            ulcerDuration: record.ulcerDuration || "",
                            hasAmputation: normalizeYesNo(record.hasAmputation),
                            amputationDuration: record.amputationDuration || "",
                            hasAngioplasty: normalizeYesNo(record.hasAngioplasty),
                            angioplastyDuration: record.angioplastyDuration || "",
                            smoking: record.smoking || "",
                            alcohol: record.alcohol || "",
                            tobacco: record.tobacco || "",
                            renal: normalizeYesNo(record.renal),
                            retinal: normalizeYesNo(record.retinal),
                            cardiovascular: normalizeYesNo(record.cardiovascular),
                            cerebrovascular: normalizeYesNo(record.cerebrovascular),
                            // imbIschemia: normalizeYesNo(record.imbIschemia),
                            hypertension: normalizeYesNo(record.hypertension),
                            heartFailure: record.heartFailure || "",
                            limbIschemia: normalizeYesNo(record.limbIschemia),
                            wearShoes: record.wearShoes || "",
                            wearSlippers: record.wearSlippers || "",
                            walkOnSand: record.walkOnSand || "",
                            washFeet: record.washFeet || "",
                            fastingGlucose: record.fastingGlucose || "",
                            postPrandialGlucose: record.postPrandialGlucose || "",
                            hba1c: record.hba1c || "",
                            totalCholesterol: record.totalCholesterol || "",
                            triglycerides: record.triglycerides || "",
                            hdl: record.hdl || "",
                            ldl: record.ldl || "",
                            vldl: record.vldl || "",
                            serumCreatinine: record.serumCreatinine || "",
                            consentForm: null,
                            consentFormPreview: null,
                            consentDownloaded: false,
                            consentUploaded: false,
                            consentVerified: false,
                        },
                        section2: {
                            firstAssessment: record.firstAssessment || "",
                            attendedBefore: record.attendedBefore || "",
                            facilityVisited: record.facilityVisited || "",
                            intervalToAssessment: record.intervalToAssessment || "",
                            referredBy: record.referredBy || "",
                            treatedDays: record.treatedDays || "",
                            referredInDays: record.referredInDays || "",
                            visitedInDays: record.visitedInDays || "",
                            purulentDischarge: record.purulentDischarge || "",
                            necrosis: normalizeYesNo(record.necrosis),
                            gangrene: normalizeYesNo(record.gangrene),
                            gangreneType: record.gangreneType || "",
                            probetobone: normalizeYesNo(record.probetobone || record.bone_exposure),
                            osteomyelitis: normalizeYesNo(record.osteomyelitis),
                            sepsis: normalizeYesNo(record.sepsis),
                            arterialIssues: normalizeYesNo(record.arterialIssues),
                            infection: normalizeYesNo(record.infection),
                            swelling: normalizeYesNo(record.swelling),
                            erythema: normalizeYesNo(record.erythema),
                            tenderness: normalizeYesNo(record.tenderness),
                            warmth: normalizeYesNo(record.warmth),
                            // discharge: normalizeYesNo(record.discharge),
                            cultureReport: record.cultureReport || "",
                            cultureReportAvailable: normalizeYesNo(record.cultureReportAvailable),
                            woundSize: record.woundSize || "",
                            woundLocation: record.woundLocation || "",
                            woundDuration: record.woundDuration || "",
                            woundClassification: record.woundClassification || "",
                            socGiven: record.socGiven || "",
                            socDetails: record.socDetails || "",
                            dressingMaterial: record.dressingMaterial || "",
                            offloadingDevice: record.offloadingDevice || "",
                            hospitalization: record.hospitalization || "",
                            amputation: record.amputation || "",
                            amputationType: record.amputationType || "",
                            amputationLevel: record.amputationLevel || "",
                            debridementWithAmputation: record.debridementWithAmputation || "",
                       
                            woundReferenceFile:"",
                            woundReferenceConsent: normalizeYesNo(record.woundReferenceConsent),
                            woundReferenceFilePreview: null,
                        },
                        section3: {
                            burningSensation: normalizeYesNo(record.burning_sensation || record.burningSensation),
                            painWhileWalking: normalizeYesNo(record.pain_while_walking || record.painWhileWalking),
                            skinChanges: normalizeYesNo(record.skin_changes || record.skinChanges),
                            sensationLoss: normalizeYesNo(record.sensation_loss || record.sensationLoss),
                            nailProblems: normalizeYesNo(record.nail_problems || record.nailProblems),
                            fungalInfection: normalizeYesNo(record.fungal_infection || record.fungalInfection),
                            skinLesions: normalizeYesNo(record.skin_lesions || record.skinLesions),
                            openWound: normalizeYesNo(record.open_wound || record.openWound),
                            cellulitis: normalizeYesNo(record.cellulitis),
                            monofilamentLeftA: record.monofilament_left_a || record.monofilamentLeftA || "",
                            monofilamentLeftB: record.monofilament_left_b || record.monofilamentLeftB || "",
                            monofilamentLeftC: record.monofilament_left_c || record.monofilamentLeftC || "",
                            monofilamentRightA: record.monofilament_right_a || record.monofilamentRightA || "",
                            monofilamentRightB: record.monofilament_right_b || record.monofilamentRightB || "",
                            monofilamentRightC: record.monofilament_right_c || record.monofilamentRightC || "",
                            footDeformities: normalizeYesNo(record.foot_deformities || record.footDeformities),
                            deformityDuration: record.deformity_duration || record.deformityDuration || "",
                            hairGrowth: normalizeYesNo(record.hair_growth || record.hairGrowth),
                            pulsesPalpable: normalizeYesNo(record.pulses_palpable || record.pulsesPalpable),
                            skinTemperature: record.skin_temperature || record.skinTemperature || "",
                            // ulcerPresence: normalizeYesNo(record.ulcer_presence || record.ulcerPresence),
                            cultureReportAvailable: normalizeYesNo(record.culture_report_available || record.cultureReportAvailable),
                        },
                    },
                }
            })

            console.log("Mapped Records:", mappedRecords)
            setDoctorData(mappedRecords)
            localStorage.setItem("patientRecords", JSON.stringify(mappedRecords))
        } catch (error) {
            console.error("Error fetching patient records:", error)
            toast.error("Failed to load patient records: " + error.message)
            setDoctorData([])
            localStorage.removeItem("patientRecords")
        }
    }

    const handleClearLocalStorage = () => {
        localStorage.removeItem("patientRecords")
        toast.info("Reloading records...")
        loadPatientRecords()
    }

    useEffect(() => {
        handleClearLocalStorage()
    }, [])

    useEffect(() => {
        loadPatientRecords()
    }, [])

    const handleSubmitFollowUp = (patient) => {
        try {
            setIsSaving(true)
            const currentUser = JSON.parse(sessionStorage.getItem("userInfo") || "{}")

            navigate(`/user/followup/${patient.patientId}`, {
                state: {
                    initialData: {
                        patientId: patient.patientId,
                        patient_name: patient.patient_name,
                        doctor_id: currentUser?.id || "",
                        doctor_email: currentUser?.email || "unknown@doctor.com",
                        lastFollowUpDate: patient.lastFollowUpDate,
                        followUpData: patient.followUpData || null,
                    },
                    isInitialFollowUp: !patient.followUpData,
                    isUpdate: !!patient.followUpData,
                },
            })
        } catch (error) {
            console.error("Error navigating to follow-up form:", error)
            toast.error("Failed to open follow-up form")
        } finally {
            setIsSaving(false)
        }
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
        const updatedData = doctorData.map((patient) =>
            patient.patientId === patientId ? { ...patient, status, ...additionalData } : patient,
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
            key: "patient_name",
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
                const submissionDate = row.submissionDate
                const canEdit = !is24HoursPassed(submissionDate)
                const { currentTime } = externalProps || {}
                const remainingTime = canEdit ? calculateRemainingTime(submissionDate, currentTime) : null

                return (
                    <div className="action-buttons">
                        <div className="main-assessment-actions">
                            {canEdit && remainingTime ? (
                                <>
                                    <a className="action-btn edit-btn" onClick={() => handleStepForm(row, true)} title="Edit assessment">
                                        <FilePenLine size={16} />
                                    </a>
                                    <div className="edit-countdown">
                                        <small>You can edit this for another {remainingTime}</small>
                                    </div>
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
            key: "follow_up_status",
            header: "Follow Up",
            sortable: true,
            render: (_, row) => {
                // Add null check and default value
                const status = row.followUpStatus || row.follow_up_status || "Pending"

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
                                {status === "Pending"
                                    ? "Follow-up Pending"
                                    : status === "Due"
                                        ? "Follow-up Due"
                                        : "Follow-up Completed"}
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
        },
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
                <div className="dashboard-controls"></div>
                <DataTable
                    data={doctorData}
                    columns={columns}
                    onAddNew={handleAddNew}
                    showSearch={true}
                    showAddNew={true}
                    showDownloadSample={true}
                    showUploadExcel={true}
                    showExport={false}
                    showaddsubadmin={false}
                    showDownloadSubadmin={false}
                    showDirectExport={false}
                    searchPlaceholder="Search patients..."
                    exportFileName="doctor_patients"
                    rowsPerPageOptions={[5, 10, 25]}
                    defaultRowsPerPage={10}
                    title="Patient Records"
                    extraProps={{ currentTime }}
                    rawExportData={doctorData}
                    loadPatientRecords={loadPatientRecords} // Add this line
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
                        patientName={currentPatient.patient_name}
                        patientId={currentPatient.patientId}
                    />
                )}
            </div>
        </UserLayout>
    )
}

export default UserDashboard
