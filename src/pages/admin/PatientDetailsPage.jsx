"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { apiGet } from "../../services/api-helper"
import { toast } from "react-toastify"
import AdminLayout from "../../layouts/AdminLayout"
import '../admin/PatientDetailsPage.css'
import { IMAGE_BASE_URL } from "../../config/api";
import { FaDownload } from "react-icons/fa"; // or any download icon
import { User, Activity, Stethoscope,BookCheck  } from 'lucide-react';
const PatientDetailsPage = () => {
    const { patientId } = useParams()
    const navigate = useNavigate()
    const [patient, setPatient] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState("basic")

    // Initial form state structure from StepForm.jsx
    const initialFormState = {
        section1: {
            patient_name: "",
            consentForm: null,
            consentFormPreview: null,
            consentDownloaded: false,
            consentUploaded: false,
            consentVerified: false,
            locality: "",
            age: "",
            gender: "",
            facilityName: "",
            facilityLocation: "",
            facilityType: "",
            education: "",
            occupation: "",
            maritalStatus: "",
            monthlyIncome: "",
            familyMembers: "",
            dependents: "",
            diabetesType: "",
            diabetesDuration: "",
            hasUlcer: "",
            ulcerDuration: "",
            hasAmputation: "",
            amputationDuration: "",
            hasAngioplasty: "",
            angioplastyDuration: "",
            smoking: "",
            alcohol: "",
            tobacco: "",
            renal: "",
            retinal: "",
            cardiovascular: "",
            cerebrovascular: "",
            // imbIschemia: "",
            hypertension: "",
            heartFailure: "",
            limbIschemia: "",
            wearShoes: "",
            wearSlippers: "",
            walkOnSand: "",
            washFeet: "",
            fastingGlucose: "",
            postPrandialGlucose: "",
            hba1c: "",
            totalCholesterol: "",
            triglycerides: "",
            hdl: "",
            ldl: "",
            vldl: "",
            renalDuration: "",
            retinalDuration: "",
            cardiovascularDuration: "",
            heartFailureDuration: "",
            cerebrovascularDuration: "",
            limbIschemiaDuration: "",
            hypertensionDuration: "",
            serumCreatinine: "",
        },
        section2: {
            firstAssessment: "",
            attendedBefore: "",
            facilityVisited: "",
            intervalToAssessment: "",
            referredBy: "",
            treatedDays: "",
            referredInDays: "",
            visitedInDays: "",
            necrosis: "",
            necrosisPhoto: null,
            necrosisPhotoPreview: "",
            gangrene: "",
            gangreneType: "",
            probetobone: "",
            osteomyelitis: "",
            sepsis: "",
            arterialIssues: "",
            infection: "",
            swelling: "",
            erythema: "",
            tenderness: "",
            warmth: "",
         
            cultureReport: "",
            woundSize: "",
            woundLocation: "",
            woundDuration: "",
            woundClassification: "",
            socGiven: "",
            socDetails: "",
            dressingMaterial: "",
            offloadingDevice: "",
            hospitalization: "",
            amputation: "",
            amputationType: "",
            amputationLevel: "",
            debridementWithAmputation: "",
           
            woundReferenceFile: null,
            woundReferenceConsent: "",
            woundReferenceFilePreview: null,
            cultureReportAvailable: "",
            arterialReport: "",
        },
        section3: {
            burningSensation: "",
            painWhileWalking: "",
            skinChanges: "",
            sensationLoss: "",
            nailProblems: "",
            fungalInfection: "",
            skinLesions: "",
            openWound: "",
            cellulitis: "",
            testType: "",
            monofilamentLeftA: "",
            monofilamentLeftB: "",
            monofilamentLeftC: "",
            monofilamentRightA: "",
            monofilamentRightB: "",
            monofilamentRightC: "",
            tuningForkRightMedialMalleolus: "",
            tuningForkRightLateralMalleolus: "",
            tuningForkRightBigToe: "",
            tuningForkLeftMedialMalleolus: "",
            tuningForkLeftLateralMalleolus: "",
            tuningForkLeftBigToe: "",
            footDeformities: "",
            deformityDuration: "",
            hairGrowth: "",
            pulsesPalpable: "",
            skinTemperature: "",
            // ulcerPresence: "",
           
            footImage: "",
        },
    }

    // Function to determine if a field is a radio/boolean field
    const isRadioField = (field) => {
        const radioFields = [
            // Section 1
            "consentDownloaded",
            "consentUploaded",
            "consentVerified",
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
            // Section 2
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
         
            // Section 3
            "burningSensation",
            "painWhileWalking",
            "skinChanges",
            "sensationLoss",
            "nailProblems",
            "fungalInfection",
            "skinLesions",
            "openWound",
            "cellulitis",
            "monofilamentLeftA",
            "monofilamentLeftB",
            "monofilamentLeftC",
            "monofilamentRightA",
            "monofilamentRightB",
            "monofilamentRightC",
            "footDeformities",
            "hairGrowth",
            "pulsesPalpable",
            // "ulcerPresence",
        ]
        return radioFields.includes(field)
    }

    // Convert flat API data to nested structure
    const mapFlatToNested = (flatData) => {
        console.log("Flat API Data:", flatData)
        const nestedData = JSON.parse(JSON.stringify(initialFormState))

        const fieldMappings = {
            section1: {
                patient_name: ["patient_name", "name"],
                hasUlcer: ["hasUlcer", "has_ulcer"],
                hasAmputation: ["hasAmputation", "has_amputation"],
                hasAngioplasty: ["hasAngioplasty", "has_angioplasty"],
                renal: ["renal"],
                retinal: ["retinal"],
                cardiovascular: ["cardiovascular"],
                cerebrovascular: ["cerebrovascular"],
                // imbIschemia: ["imbIschemia", "imb_ischemia"],
                hypertension: ["hypertension"],
                consentDownloaded: ["consentDownloaded", "consent_downloaded"],
                consentUploaded: ["consentUploaded", "consent_uploaded"],
                consentVerified: ["consentVerified", "consent_verified"],
                limbIschemia: ["limbIschemia", "limb_ischemia"],
            },
            section2: {
                necrosis: ["necrosis"],
                gangrene: ["gangrene"],
                probetobone: ["probetobone", "bone_exposure"],
                osteomyelitis: ["osteomyelitis"],
                sepsis: ["sepsis"],
                arterialIssues: ["arterialIssues", "arterial_issues"],
                infection: ["infection"],
                swelling: ["swelling"],
                erythema: ["erythema"],
                tenderness: ["tenderness"],
                warmth: ["warmth"],
               
            },
            section3: {
                burningSensation: ["burningSensation", "burning_sensation"],
                painWhileWalking: ["painWhileWalking", "pain_while_walking"],
                skinChanges: ["skinChanges", "skin_changes"],
                sensationLoss: ["sensationLoss", "sensation_loss"],
                nailProblems: ["nailProblems", "nail_problems"],
                fungalInfection: ["fungalInfection", "fungal_infection"],
                skinLesions: ["skinLesions", "skin_lesions"],
                openWound: ["openWound", "open_wound"],
                cellulitis: ["cellulitis"],
                monofilamentLeftA: ["monofilamentLeftA", "monofilament_left_a"],
                monofilamentLeftB: ["monofilamentLeftB", "monofilament_left_b"],
                monofilamentLeftC: ["monofilamentLeftC", "monofilament_left_c"],
                monofilamentRightA: ["monofilamentRightA", "monofilament_right_a"],
                monofilamentRightB: ["monofilamentRightB", "monofilament_right_b"],
                monofilamentRightC: ["monofilamentRightC", "monofilament_right_c"],
                tuningForkRightMedialMalleolus: ["tuningForkRightMedialMalleolus", "tuning_fork_right_medial_malleolus"],
                tuningForkRightLateralMalleolus: ["tuningForkRightLateralMalleolus", "tuning_fork_right_lateral_malleolus"],
                tuningForkRightBigToe: ["tuningForkRightBigToe", "tuning_fork_right_big_toe"],
                tuningForkLeftMedialMalleolus: ["tuningForkLeftMedialMalleolus", "tuning_fork_left_medial_malleolus"],
                tuningForkLeftLateralMalleolus: ["tuningForkLeftLateralMalleolus", "tuning_fork_left_lateral_malleolus"],
                tuningForkLeftBigToe: ["tuningForkLeftBigToe", "tuning_fork_left_big_toe"],
                footDeformities: ["footDeformities", "foot_deformities"],
                hairGrowth: ["hairGrowth", "hair_growth"],
                pulsesPalpable: ["pulsesPalpable", "pulses_palpable"],
                skinTemperature: ["skinTemperature", "skin_temperature"],
                // ulcerPresence: ["ulcerPresence", "ulcer_presence"],
            },
        }

        Object.keys(nestedData).forEach((section) => {
            Object.keys(nestedData[section]).forEach((field) => {
                if (field.endsWith("Preview")) return

                const isBooleanField = isRadioField(field)
                let value

                if (fieldMappings[section]?.[field]) {
                    for (const variant of fieldMappings[section][field]) {
                        if (flatData[variant] !== undefined) {
                            value = flatData[variant]
                            break
                        }
                    }
                } else {
                    value = flatData[field]
                }

                if (value !== undefined) {
                    if (isBooleanField) {
                        nestedData[section][field] = convertToYesNo(value)
                    } else if (["consentForm", "necrosisPhoto", "woundReferenceFile"].includes(field)) {
                        nestedData[section][field] = null
                    } else {
                        nestedData[section][field] = value !== null ? String(value) : ""
                    }
                }
            })
        })

        console.log("Mapped Nested Data:", nestedData)
        return nestedData
    }

    // Convert boolean-like values to "yes" or "no"
    const convertToYesNo = (value) => {
        if (value === true || value === 1 || value === "1" || value === "yes") return "yes"
        if (value === false || value === 0 || value === "0" || value === "no") return "no"
        return ""
    }

    useEffect(() => {
        const fetchPatientDetails = async () => {
            try {
                setLoading(true)
                setError(null)
                console.log(`Fetching patient details from: /patient/${patientId}`)

                const response = await apiGet(`/patient/${patientId}`)
                console.log("API Response:", response)

                // Handle different response structures
                if (!response) {
                    throw new Error("Empty response from server")
                }

                // Check if response has data or patient property
                const patientData = response.data || response.patient || response
                if (!patientData) {
                    throw new Error("Patient data not found in response")
                }

                // Map flat API data to nested structure
                const nestedData = mapFlatToNested(patientData)
                setPatient(nestedData)
            } catch (err) {
                console.error("Fetch error:", err)
                setError(err.message || "Failed to fetch patient details")
                toast.error(`Error: ${err.message || "Failed to fetch patient details"}`)
            } finally {
                setLoading(false)
            }
        }

        if (patientId) {
            fetchPatientDetails()
        } else {
            setError("Missing patient ID")
            setLoading(false)
            toast.error("Invalid patient ID")
        }
    }, [patientId])

    // Function to render status badge
    const renderStatusBadge = (value) => {
        if (!value || value === "N/A") return null

        if (value === "yes") {
            return <span className="status-badge positive">Yes</span>
        } else if (value === "no") {
            return <span className="status-badge negative">No</span>
        } else {
            return <span className="status-badge neutral">{value}</span>
        }
    }

    // Function to render value with fallback
    const renderValue = (value) => {
        return value || <span className="text-gray-400">Not available</span>
    }

    // Render patient data with all sections
    const renderPatientData = () => {
        if (!patient) return null

        return (
            <div className="patient-details-container">
                {/* Header with patient summary */}
                <div className="patient-header">
                    <div className="patient-avatar">{patient.section1?.patient_name?.charAt(0) || "P"}</div>
                    <div className="patient-header-info">
                        <h1>{patient.section1?.patient_name || "Unnamed Patient"}</h1>
                        <div className="patient-meta">
                            <div className="meta-item">
                                <span className="meta-icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="icon"
                                    >
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </span>
                                <span>
                                    {patient.section1?.age || "N/A"} years, {patient.section1?.gender || "N/A"}
                                </span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="icon"
                                    >
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                </span>
                                <span>{patient.section1?.locality || "N/A"}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="icon"
                                    >
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                </span>
                                <span>ID: {patientId}</span>
                            </div>
                        </div>
                    </div>
                    <div className="patient-quick-stats">
                        <div className="stat-card">
                            <div className="stat-value">{patient.section1?.diabetesType || "N/A"}</div>
                            <div className="stat-label">Diabetes Type</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{patient.section1?.diabetesDuration || "N/A"}</div>
                            <div className="stat-label">Duration</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{patient.section1?.hba1c || "N/A"}</div>
                            <div className="stat-label">HbA1c</div>
                        </div>
                    </div>
                </div>

                {/* Navigation tabs */}
                <div className="tabs-container">
                    <div className="tabs">
                        <button className={`tab ${activeTab === "basic" ? "active" : ""}`} onClick={() => setActiveTab("basic")}>
                           
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="tab-icon"
                            >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            Basic Information
                        </button>
                        <button
                            className={`tab ${activeTab === "medical" ? "active" : ""}`}
                            onClick={() => setActiveTab("medical")}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="tab-icon"
                            >
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                            </svg>
                            Medical History
                        </button>
                        <button className={`tab ${activeTab === "ulcer" ? "active" : ""}`} onClick={() => setActiveTab("ulcer")}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="tab-icon"
                            >
                                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"></path>
                                <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"></path>
                                <circle cx="20" cy="8" r="2"></circle>
                            </svg>
                            Ulcer & Treatment
                        </button>
                        <button className={`tab ${activeTab === "foot" ? "active" : ""}`} onClick={() => setActiveTab("foot")}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="tab-icon"
                            >
                                <path d="M18 20v-8a4 4 0 0 0-4-4H6"></path>
                                <path d="M10 6H6a4 4 0 0 0-4 4v8"></path>
                                <path d="M2 14h20"></path>
                            </svg>
                            Foot Examination
                        </button>
                    </div>
                </div>

                {/* Tab content */}
                <div className="tab-content">
                    {/* Basic Information Tab */}
                    {activeTab === "basic" && (
                        <div className="content-section">
                            <div className="section-grid">
                                <div className="card">
                                    <h3 className="card-title">Personal Information</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Age</div>
                                            <div className="info-value">{renderValue(patient.section1?.age)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Gender</div>
                                            <div className="info-value">{renderValue(patient.section1?.gender)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Locality</div>
                                            <div className="info-value">{renderValue(patient.section1?.locality)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Education</div>
                                            <div className="info-value">{renderValue(patient.section1?.education)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Occupation</div>
                                            <div className="info-value">{renderValue(patient.section1?.occupation)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Marital Status</div>
                                            <div className="info-value">{renderValue(patient.section1?.maritalStatus)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Socio-Demographic Information</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Monthly Income</div>
                                            <div className="info-value">{renderValue(patient.section1?.monthlyIncome)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Family Members</div>
                                            <div className="info-value">{renderValue(patient.section1?.familyMembers)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Dependents</div>
                                            <div className="info-value">{renderValue(patient.section1?.dependents)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Health Facility Information</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Facility Name</div>
                                            <div className="info-value">{renderValue(patient.section1?.facilityName)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Facility Location</div>
                                            <div className="info-value">{renderValue(patient.section1?.facilityLocation)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Facility Type</div>
                                            <div className="info-value">{renderValue(patient.section1?.facilityType)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Consent Information</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Consent Downloaded</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.consentDownloaded)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Consent Uploaded</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.consentUploaded)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Consent Verified</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.consentVerified)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Medical History Tab */}
                    {activeTab === "medical" && (
                        <div className="content-section">
                            <div className="section-grid">
                                <div className="card">
                                    <h3 className="card-title">Diabetes Information</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Diabetes Type</div>
                                            <div className="info-value">{renderValue(patient.section1?.diabetesType)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Diabetes Duration</div>
                                            <div className="info-value">{renderValue(patient.section1?.diabetesDuration)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Has Ulcer</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.hasUlcer)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Ulcer Duration</div>
                                            <div className="info-value">{renderValue(patient.section1?.ulcerDuration)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Has Amputation</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.hasAmputation)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Amputation Duration</div>
                                            <div className="info-value">{renderValue(patient.section1?.amputationDuration)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Has Angioplasty</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.hasAngioplasty)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Angioplasty Duration</div>
                                            <div className="info-value">{renderValue(patient.section1?.angioplastyDuration)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Lifestyle Factors</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Smoking</div>
                                            <div className="info-value">{renderValue(patient.section1?.smoking)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Alcohol</div>
                                            <div className="info-value">{renderValue(patient.section1?.alcohol)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Tobacco</div>
                                            <div className="info-value">{renderValue(patient.section1?.tobacco)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Wear Shoes</div>
                                            <div className="info-value">{renderValue(patient.section1?.wearShoes)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Wear Slippers</div>
                                            <div className="info-value">{renderValue(patient.section1?.wearSlippers)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Walk On Sand</div>
                                            <div className="info-value">{renderValue(patient.section1?.walkOnSand)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Wash Feet</div>
                                            <div className="info-value">{renderValue(patient.section1?.washFeet)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Other Diabetic Complications / Comorbidities</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Renal</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.renal)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Retinal</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.retinal)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Cardiovascular</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.cardiovascular)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Cerebrovascular</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.cerebrovascular)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Limb Ischemia</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.limbIschemia)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Hypertension</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.hypertension)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Heart Failure</div>
                                            <div className="info-value">{renderStatusBadge(patient.section1?.heartFailure)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Biochemical Investigation <br></br>
                                        (Recent Report)</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Fasting Glucose</div>
                                            <div className="info-value">{renderValue(patient.section1?.fastingGlucose)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Post-Prandial Glucose</div>
                                            <div className="info-value">{renderValue(patient.section1?.postPrandialGlucose)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">HbA1c</div>
                                            <div className="info-value">{renderValue(patient.section1?.hba1c)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Total Cholesterol</div>
                                            <div className="info-value">{renderValue(patient.section1?.totalCholesterol)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Triglycerides</div>
                                            <div className="info-value">{renderValue(patient.section1?.triglycerides)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">HDL</div>
                                            <div className="info-value">{renderValue(patient.section1?.hdl)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">LDL</div>
                                            <div className="info-value">{renderValue(patient.section1?.ldl)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">VLDL</div>
                                            <div className="info-value">{renderValue(patient.section1?.vldl)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Serum Creatinine</div>
                                            <div className="info-value">{renderValue(patient.section1?.serumCreatinine)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ulcer & Treatment Tab */}
                    {activeTab === "ulcer" && (
                        <div className="content-section">
                            <div className="section-grid">
                                <div className="card">
                                    <h3 className="card-title">Assessment Information</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">First Assessment</div>
                                            <div className="info-value">{renderValue(patient.section2?.firstAssessment)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Attended Before</div>
                                            <div className="info-value">{renderValue(patient.section2?.attendedBefore)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Facility Visited</div>
                                            <div className="info-value">{renderValue(patient.section2?.facilityVisited)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Interval to Assessment</div>
                                            <div className="info-value">{renderValue(patient.section2?.intervalToAssessment)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Referred By</div>
                                            <div className="info-value">{renderValue(patient.section2?.referredBy)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Treated Days</div>
                                            <div className="info-value">{renderValue(patient.section2?.treatedDays)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Wound Information</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Wound Size</div>
                                            <div className="info-value">{renderValue(patient.section2?.woundSize)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Wound Location</div>
                                            <div className="info-value">{renderValue(patient.section2?.woundLocation)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Wound Duration</div>
                                            <div className="info-value">{renderValue(patient.section2?.woundDuration)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Wound Classification</div>
                                            <div className="info-value">{renderValue(patient.section2?.woundClassification)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Culture Report</div>
                                            <div className="info-value">
                                                {patient.section2?.cultureReport ? (
                                                    <a
                                                        href={`${IMAGE_BASE_URL}${patient.section2.cultureReport}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                        className="download-link"
                                                    >
                                                        Download <FaDownload style={{ marginLeft: '5px' }} />
                                                    </a>
                                                ) : (
                                                    <span>Not available</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Culture Report Available</div>
                                            <div className="info-value">{renderValue(patient.section2?.cultureReportAvailable)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Wound Conditions</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Necrosis</div>
                                            <div className="info-value">{renderStatusBadge(patient.section2?.necrosis)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Gangrene</div>
                                            <div className="info-value">{renderStatusBadge(patient.section2?.gangrene)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Gangrene Type</div>
                                            <div className="info-value">{renderValue(patient.section2?.gangreneType)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Bone Exposure</div>
                                            <div className="info-value">{renderStatusBadge(patient.section2?.probetobone)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Osteomyelitis</div>
                                            <div className="info-value">{renderStatusBadge(patient.section2?.osteomyelitis)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Sepsis</div>
                                            <div className="info-value">{renderStatusBadge(patient.section2?.sepsis)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Treatment Details</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">SOC Given</div>
                                            <div className="info-value">{renderValue(patient.section2?.socGiven)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">SOC Details</div>
                                            <div className="info-value">{renderValue(patient.section2?.socDetails)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Dressing Material</div>
                                            <div className="info-value">{renderValue(patient.section2?.dressingMaterial)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Offloading Device</div>
                                            <div className="info-value">{renderValue(patient.section2?.offloadingDevice)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Hospitalization</div>
                                            <div className="info-value">{renderValue(patient.section2?.hospitalization)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Amputation</div>
                                            <div className="info-value">{renderValue(patient.section2?.amputation)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Amputation Type</div>
                                            <div className="info-value">{renderValue(patient.section2?.amputationType)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Amputation Level</div>
                                            <div className="info-value">{renderValue(patient.section2?.amputationLevel)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Foot Examination Tab */}
                    {activeTab === "foot" && (
                        <div className="content-section">
                            <div className="section-grid">
                                <div className="card">
                                    <h3 className="card-title">Symptoms</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Burning Sensation</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.burningSensation)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Pain While Walking</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.painWhileWalking)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Skin Changes</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.skinChanges)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Sensation Loss</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.sensationLoss)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Nail Problems</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.nailProblems)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Fungal Infection</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.fungalInfection)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Foot Conditions</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Skin Lesions</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.skinLesions)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Open Wound</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.openWound)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Cellulitis</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.cellulitis)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Foot Deformities</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.footDeformities)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Deformity Duration</div>
                                            <div className="info-value">{renderValue(patient.section3?.deformityDuration)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Hair Growth</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.hairGrowth)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Pulses Palpable</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.pulsesPalpable)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Skin Temperature</div>
                                            <div className="info-value">{renderValue(patient.section3?.skinTemperature)}</div>
                                        </div>
                                        {/* <div className="info-row">
                                            <div className="info-label">Ulcer Presence</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.ulcerPresence)}</div>
                                        </div> */}
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Monofilament Test</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Test Type</div>
                                            <div className="info-value">{renderValue(patient.section3?.testType)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Left A</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.monofilamentLeftA)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Left B</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.monofilamentLeftB)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Left C</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.monofilamentLeftC)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Right A</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.monofilamentRightA)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Right B</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.monofilamentRightB)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Right C</div>
                                            <div className="info-value">{renderStatusBadge(patient.section3?.monofilamentRightC)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="card-title">Tuning Fork Test</h3>
                                    <div className="card-content">
                                        <div className="info-row">
                                            <div className="info-label">Right Medial Malleolus</div>
                                            <div className="info-value">{renderValue(patient.section3?.tuningForkRightMedialMalleolus)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Right Lateral Malleolus</div>
                                            <div className="info-value">{renderValue(patient.section3?.tuningForkRightLateralMalleolus)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Right Big Toe</div>
                                            <div className="info-value">{renderValue(patient.section3?.tuningForkRightBigToe)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Left Medial Malleolus</div>
                                            <div className="info-value">{renderValue(patient.section3?.tuningForkLeftMedialMalleolus)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Left Lateral Malleolus</div>
                                            <div className="info-value">{renderValue(patient.section3?.tuningForkLeftLateralMalleolus)}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-label">Left Big Toe</div>
                                            <div className="info-value">{renderValue(patient.section3?.tuningForkLeftBigToe)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <AdminLayout>
            <div className="patient-details-page">
                <button onClick={() => navigate(-1)} className="back-button">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="back-icon"
                    >
                        <path d="M19 12H5"></path>
                        <path d="M12 19l-7-7 7-7"></path>
                    </svg>
                    Back to Patient List
                </button>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading patient data...</p>
                    </div>
                ) : error ? (
                    <div className="error-container">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="error-icon"
                        >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <p className="error-message">{error}</p>
                    </div>
                ) : patient ? (
                    renderPatientData()
                ) : (
                    <div className="no-data-container">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="no-data-icon"
                        >
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                            <polyline points="13 2 13 9 20 9"></polyline>
                        </svg>
                        <p>No patient data available</p>
                    </div>
                )}

                <style jsx>{`
  
        `}</style>
            </div>
        </AdminLayout>
    )
}

export default PatientDetailsPage
