"use client"

import { useState, useEffect } from "react"
import { FiUser, FiDownloadCloud, FiUploadCloud, FiFile, FiX, FiAlertCircle } from "react-icons/fi"
import "./StepForm.css"

const StepForm1 = ({ formData, handleChange, errors, setErrors }) => {
    const [hasHistory, setHasHistory] = useState({
        ulcer: false,
        amputation: false,
        angioplasty: false,
    })
    // Clean up object URLs when component unmounts
    useEffect(() => {
        return () => {
            if (formData.section1.consentFormPreview) {
                URL.revokeObjectURL(formData.section1.consentFormPreview)
            }
        }
    }, [formData.section1.consentFormPreview])

    const handleDownloadConsentForm = () => {
        try {
            const pdfPath = '/dfrifinal/Consent_form_registry.pdf'

            // Check if file exists (basic check)
            fetch(pdfPath)
                .then((res) => {
                    if (res.status === 404) {
                        throw new Error('PDF file not found')
                    }

                    // Create download link
                    const link = document.createElement('a')
                    link.href = pdfPath
                    link.download = 'Diabetes_Foot_Ulcer_Consent_Form.pdf'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)

                    // Track download
                    handleChange(
                        { target: { name: "consentDownloaded", value: true } },
                        "section1"
                    )
                })
                .catch((err) => {
                    console.error("File not found:", err)
                    setErrors((prev) => ({
                        ...prev,
                        consentForm: 'Consent form template not found',
                    }))
                    toast.error("Failed to download consent form. File not found.")
                })
        } catch (error) {
            console.error("Error downloading consent form:", error)
            toast.error("Something went wrong while downloading the form. Please try again later.")
        }
    }
    const handleRemoveConsent = () => {
        if (formData.section1.consentFormPreview) {
            URL.revokeObjectURL(formData.section1.consentFormPreview)
        }

        handleChange({ target: { name: "consentForm", value: null } }, "section1")
        handleChange({ target: { name: "consentFormPreview", value: null } }, "section1")
        handleChange({ target: { name: "consentUploaded", value: false } }, "section1")
        handleChange({ target: { name: "consentVerified", value: false } }, "section1")
    }

    const handleConsentUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Clear previous errors
        setErrors(prev => ({ ...prev, consentForm: null }))

        // Validate file
        let error = null
        if (file.size > 2 * 1024 * 1024) {
            error = 'File exceeds 2MB limit'
        } else if (file.type !== 'application/pdf') {
            error = 'Only PDF files are allowed'
        }

        if (error) {
            setErrors(prev => ({ ...prev, consentForm: error }))
            return
        }

        // Create preview URL (for PDFs we'll just show a file icon)
        const previewUrl = '/pdf-icon.png' // You should have a PDF icon in your public folder

        // Update form data with file and preview
        handleChange(
            { target: { name: "consentForm", value: file } },
            "section1"
        )
        handleChange(
            { target: { name: "consentFormPreview", value: previewUrl } },
            "section1"
        )
        handleChange(
            { target: { name: "consentUploaded", value: true } },
            "section1"
        )
        handleChange(
            { target: { name: "consentVerified", value: false } },
            "section1"
        )
    }
    console.log("hasUlcer value:", formData.section1.hasUlcer);
    
    console.log("wearShoes value:", formData.section1.wearShoes);

    return (
        <div className="medical-add-container">
            {/* <div className="medical-add-header">
                <h1>Participant Information (baseline)</h1>
                <p className="medical-add-subtitle">Proforma - Patient Information</p>
            </div> */}

            <form  className="medical-add-form">
              
                {/* Section 1: Consent Form - Side by Side Layout */}
                <div className="medical-add-section">
                    <h2 className="medical-add-section-title">Consent Form</h2>
                    <div className="medical-add-row" style={{ display: 'flex', gap: '20px' }}>
                        {/* Download Column */}
                        <div className="medical-add-group" style={{ flex: 1 }}>
                            <div className="consent-download-box">
                                <h3 className="consent-subtitle">Download Consent Form</h3>
                                <div className="download-content">
                                    <FiDownloadCloud className="download-icon" />
                                    <p className="download-description">
                                        Please download, print, sign, and upload the completed form
                                    </p>
                                    <button
                                        type="button"
                                        className="download-btn"
                                        onClick={handleDownloadConsentForm}
                                    >
                                        {formData.section1.consentDownloaded ? 'Downloaded' : 'Download PDF'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Upload Column */}
                        <div className="medical-add-group" style={{ flex: 1 }}>
                            <div className={`consent-upload-box ${errors.consentForm ? 'upload-error' : ''}`} >
                                <h3 className="consent-subtitle">Upload Signed Consent</h3>
                                <div className="upload-content">
                                    <input
                                        type="file"
                                        id="consentUpload"
                                        accept=".pdf"
                                        onChange={handleConsentUpload}
                                        className="upload-input"
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="consentUpload" className="upload-label">
                                        <FiUploadCloud className="upload-icon" />
                                        <p className="upload-instructions">
                                            {formData.section1.consentForm ?
                                                `File uploaded: ${formData.section1.consentForm.name}` :
                                                'Click to upload signed PDF (Max 2MB)'
                                            }
                                        </p>
                                        {formData.section1.consentForm && (
                                            <div className="file-preview">
                                                <FiFile className="file-icon" />
                                                <span>{formData.section1.consentForm.name}</span>
                                                <button
                                                    type="button"
                                                    className="remove-btn"
                                                    onClick={handleRemoveConsent}
                                                    aria-label="Remove consent form"
                                                >
                                                    <FiX />
                                                </button>
                                            </div>
                                        )}
                                    </label>
                                </div>
                                {errors.consentForm && (
                                    <div className="upload-error-message">
                                        <FiAlertCircle className="error-icon" />
                                        <span>{errors.consentForm}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Verification Checkbox */}
                    <div className="medical-add-row">
                        <div className="medical-add-group">
                            <div className="consent-verification">
                                <label className="verification-label">
                                    <input
                                        type="checkbox"
                                        name="consentVerified"
                                        checked={formData.section1.consentVerified || false}
                                        onChange={(e) => handleChange(
                                            { target: { name: "consentVerified", value: e.target.checked } },
                                            "section1"
                                        )}
                                        disabled={!formData.section1.consentUploaded}
                                    />
                                    <span className="checkmark"></span>
                                    I verify that the uploaded document is the complete and signed consent form
                                </label>
                                {errors.consentVerified && (
                                    <span className="medical-add-error-message">{errors.consentVerified}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


                {/* Section 3: Socio-Demographic Information */}
                <div className="medical-add-section">
                    <h2 className="medical-add-section-title"> Socio-Demographic Information</h2>
                    <div className="medical-add-row">
                        <div className="medical-add-group">
                            <label className="medical-add-label required">Full Name</label>
                            <div className="input-with-icon">
                                <FiUser className="input-icon" />
                                <input
                                    type="text"
                                    name="patient_name"
                                    value={formData.section1.patient_name}
                                    onChange={(e) => handleChange(e, "section1")}
                                    placeholder="Patient Name"
                                    required
                                    className={`medical-add-input ${errors.patient_name ? "medical-add-error-field" : ""}`}
                                />
                            </div>
                            {errors.patient_name && <span className="medical-add-error-message">{errors.patient_name}</span>}
                        </div>
                        {/* Age Field */}
                        <div className="medical-add-group">
                            <label className="medical-add-label required">Age</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.section1.age || ""}
                                onChange={(e) => handleChange(e, "section1")}
                                className={`medical-add-input ${errors.age ? "medical-add-error-group" : ""}`}
                                placeholder="Enter patient's age"
                                required
                            />
                            {errors.age && <span className="medical-add-error-message">{errors.age}</span>}
                        </div>

                        {/* Gender Field */}
                        <div className="medical-add-group">
                            <label className="medical-add-label required">Gender</label>
                            <div className={`medical-add-radio-group ${errors.gender ? "medical-add-error-group" : ""}`}>
                                <label className="medical-add-radio-label">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="male"
                                        checked={formData.section1.gender === "male"}
                                        onChange={(e) => handleChange(e, "section1")}
                                        className="medical-add-radio-button"
                                        required
                                    />
                                    <span className="medical-add-radio-button-label">Male</span>
                                </label>
                                <label className="medical-add-radio-label">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="female"
                                        checked={formData.section1.gender === "female"}
                                        onChange={(e) => handleChange(e, "section1")}
                                        className="medical-add-radio-button"
                                    />
                                    <span className="medical-add-radio-button-label">Female</span>
                                </label>
                                <label className="medical-add-radio-label">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="other"
                                        checked={formData.section1.gender === "other"}
                                        onChange={(e) => handleChange(e, "section1")}
                                        className="medical-add-radio-button"
                                    />
                                    <span className="medical-add-radio-button-label">Other</span>
                                </label>
                            </div>
                            {errors.gender && <span className="medical-add-error-message">{errors.gender}</span>}
                        </div>

                        <div className="medical-add-group">
                            <label className="medical-add-label required">Locality</label>
                            <div className={`medical-add-radio-group ${errors.locality ? "medical-add-error-group" : ""}`}>
                                <label className="medical-add-radio-label">
                                    <input
                                        type="radio"
                                        name="locality"
                                        value="urban"
                                        checked={formData.section1.locality === "urban"}
                                        onChange={(e) => handleChange(e, "section1")}
                                        className="medical-add-radio-button"
                                        required
                                    />
                                    <span className="medical-add-radio-button-label">Urban</span>
                                </label>
                                <label className="medical-add-radio-label">
                                    <input
                                        type="radio"
                                        name="locality"
                                        value="rural"
                                        checked={formData.section1.locality === "rural"}
                                        onChange={(e) => handleChange(e, "section1")}
                                        className="medical-add-radio-button"
                                    />
                                    <span className="medical-add-radio-button-label">Rural</span>
                                </label>
                            </div>
                            {errors.locality && <span className="medical-add-error-message">{errors.locality}</span>}
                        </div>
                    </div>
                    <div className="medical-add-row">
                        <div className="medical-add-group">
                            <label className="medical-add-label required">Education</label>
                            <select
                                name="education"
                                value={formData.section1.education}
                                onChange={(e) => handleChange(e, "section1")}
                                className={`medical-add-select ${errors.education ? "medical-add-error-field" : ""}`}
                                required
                            >
                                <option value="">Select education level</option>
                                <option value="illiterate">Illiterate</option>
                                <option value="primary">Primary School</option>
                                <option value="secondary">Secondary School</option>
                                <option value="higher">Higher Secondary</option>
                                <option value="graduate">Graduate</option>
                                <option value="postgraduate">Post Graduate</option>
                            </select>
                            {errors.education && <span className="medical-add-error-message">{errors.education}</span>}
                        </div>
                        <div className="medical-add-group">
                            <label className="medical-add-label required">Occupation</label>
                            <input
                                type="text"
                                name="occupation"
                                value={formData.section1.occupation}
                                onChange={(e) => handleChange(e, "section1")}
                                placeholder="Occupation"
                                className={`medical-add-input ${errors.occupation ? "medical-add-error-field" : ""}`}
                                required
                            />
                            {errors.occupation && <span className="medical-add-error-message">{errors.occupation}</span>}
                        </div>
                        <div className="medical-add-group">
                            <label className="medical-add-label required">Marital Status</label>
                            <select
                                name="maritalStatus"
                                value={formData.section1.maritalStatus}
                                onChange={(e) => handleChange(e, "section1")}
                                className={`medical-add-select ${errors.maritalStatus ? "medical-add-error-field" : ""}`}
                                required
                            >
                                <option value="">Select marital status</option>
                                <option value="single">Single</option>
                                <option value="married">Married</option>
                                <option value="separated">Separated</option>
                                <option value="widow">Widow/Widower</option>
                            </select>
                            {errors.maritalStatus && <span className="medical-add-error-message">{errors.maritalStatus}</span>}
                        </div>
                    </div>

                    <div className="medical-add-row">
                        <div className="medical-add-group">
                            <label className="medical-add-label required">Monthly Family Income (₹)</label>
                            <input
                                type="number"
                                name="monthlyIncome"
                                value={formData.section1.monthlyIncome}
                                onChange={(e) => handleChange(e, "section1")}
                                className={`medical-add-input ${errors.monthlyIncome ? "medical-add-error-field" : ""}`}
                                required
                            />
                            {errors.monthlyIncome && <span className="medical-add-error-message">{errors.monthlyIncome}</span>}
                        </div>
                        <div className="medical-add-group">
                            <label className="medical-add-label required">Total Family Members</label>
                            <input
                                type="number"
                                name="familyMembers"
                                value={formData.section1.familyMembers}
                                onChange={(e) => handleChange(e, "section1")}
                                min="1"
                                className={`medical-add-input ${errors.familyMembers ? "medical-add-error-field" : ""}`}
                                required
                            />
                            {errors.familyMembers && <span className="medical-add-error-message">{errors.familyMembers}</span>}
                        </div>
                        <div className="medical-add-group">
                            <label className="medical-add-label required">No. of dependent family members</label>
                            <input
                                type="number"
                                name="dependents"
                                value={formData.section1.dependents}
                                onChange={(e) => handleChange(e, "section1")}
                                min="0"
                                className={`medical-add-input ${errors.dependents ? "medical-add-error-field" : ""}`}
                                required
                            />
                            {errors.dependents && <span className="medical-add-error-message">{errors.dependents}</span>}
                        </div>
                    </div>
                </div>
                {/* Section 2: Health Facility Information */}
                <div className="medical-add-section">
                    <h2 className="medical-add-section-title">Health Facility Details</h2>

                    <div className="medical-add-row">
                        <div className="medical-add-group">
                            <label className="medical-add-label required">Name of the Facility</label>
                            <input
                                type="text"
                                name="facilityName"  // this is crucial for handleChange to work
                                value={formData.section1.facilityName}
                                onChange={(e) => handleChange(e, "section1")}
                                placeholder="Health Facility Name"
                                className={`medical-add-input ${errors.facilityName ? "medical-add-error-field" : ""}`}
                                required
                            />
                            {errors.facilityName && <span className="medical-add-error-message">{errors.facilityName}</span>}
                        </div>


                        <div className="medical-add-group">
                            <label className="medical-add-label required">Location of Health Facility</label>
                            <input
                                type="text"
                                name="facilityLocation"
                                value={formData.section1.facilityLocation}
                                onChange={(e) => handleChange(e, "section1")}
                                placeholder="Facility Location"
                                className={`medical-add-input ${errors.facilityLocation ? "medical-add-error-field" : ""}`}
                                required
                            />
                            {errors.facilityLocation && <span className="medical-add-error-message">{errors.facilityLocation}</span>}
                        </div>

                        <div className="medical-add-group">
                            <label className="medical-add-label required">Type of Facility</label>
                            <div className={`medical-add-radio-group ${errors.facilityType ? "medical-add-error-group" : ""}`}>
                                <label className="medical-add-radio-label">
                                    <input
                                        type="radio"
                                        name="facilityType"
                                        value="primary"
                                        checked={formData.section1.facilityType === "primary"}
                                        onChange={(e) => handleChange(e, "section1")}
                                        className="medical-add-radio-button"
                                        required
                                    />
                                    <span className="medical-add-radio-button-label">Primary</span>
                                </label>
                                <label className="medical-add-radio-label">
                                    <input
                                        type="radio"
                                        name="facilityType"
                                        value="secondary"
                                        checked={formData.section1.facilityType === "secondary"}
                                        onChange={(e) => handleChange(e, "section1")}
                                        className="medical-add-radio-button"
                                    />
                                    <span className="medical-add-radio-button-label">Secondary</span>
                                </label>
                                <label className="medical-add-radio-label">
                                    <input
                                        type="radio"
                                        name="facilityType"
                                        value="tertiary"
                                        checked={formData.section1.facilityType === "tertiary"}
                                        onChange={(e) => handleChange(e, "section1")}
                                        className="medical-add-radio-button"
                                    />
                                    <span className="medical-add-radio-button-label">Tertiary</span>
                                </label>
                            </div>
                            {errors.facilityType && <span className="medical-add-error-message">{errors.facilityType}</span>}
                        </div>
                    </div>

                  
                </div>



                {/* Section 4: Medical History */}
                <div className="medical-add-section">
                    <h2 className="medical-add-section-title"> Medical History</h2>

                    <div className="medical-add-row">
                        <div className="medical-add-group">
                            <label className="medical-add-label required">Type of Diabetes</label>
                            <div className={`medical-add-radio-group ${errors.diabetesType ? "medical-add-error-group" : ""}`}>
                                {["type1", "type2", "other"].map((type) => (
                                    <label className="medical-add-radio-label" key={type}>
                                        <input
                                            type="radio"
                                            name="diabetesType"
                                            value={type}
                                            checked={formData.section1.diabetesType === type}
                                            onChange={(e) => handleChange(e, "section1")}
                                            className="medical-add-radio-button"
                                            required
                                        />
                                        <span className="medical-add-radio-button-label">
                                            {type === "type1" ? "Type 1" : type === "type2" ? "Type 2" : "Other"}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.diabetesType && <span className="medical-add-error-message">{errors.diabetesType}</span>}
                        </div>

                        <div className="medical-add-group">
                            <label className="medical-add-label required">Duration of Diabetes</label>
                            <input
                                type="number"
                                name="diabetesDuration"
                                value={formData.section1.diabetesDuration}
                                onChange={(e) => handleChange(e, "section1")}
                                min="0"
                                className={`medical-add-input ${errors.diabetesDuration ? "medical-add-error-field" : ""}`}
                                required
                            />
                            {errors.diabetesDuration && <span className="medical-add-error-message">{errors.diabetesDuration}</span>}
                        </div>
                    </div>

                    <div className="medical-add-group">
                        <label className="medical-add-label">History of:</label>
                        <div className="medical-add-row">
                            <div className="medical-add-group">
                                <label className="medical-add-label required">Leg/Foot Ulcer</label>

                                <div className={`medical-add-radio-group ${errors.hasUlcer ? "medical-add-error-group" : ""}`}>
                                    {["yes", "no"].map((val) => (
                                        <label className="medical-add-radio-label" key={`ulcer-${val}`}>
                                            <input
                                                type="radio"
                                                className="medical-add-radio-button"
                                                name="hasUlcer"
                                                value={val}
                                                checked={formData?.section1?.hasUlcer === val}
                                                onChange={() => {
                                                    handleChange(
                                                        { target: { name: "hasUlcer", value: val } },
                                                        "section1"
                                                    );
                                                    setHasHistory((prev) => ({ ...prev, ulcer: val === "yes" }));
                                                }}
                                                required
                                            />
                                            <span className="medical-add-radio-button-label">
                                                {val === "yes" ? "Yes" : "No"}
                                            </span>
                                        </label>
                                    ))}
                                </div>


                                {errors.hasUlcer && (
                                    <span className="medical-add-error-message">{errors.hasUlcer}</span>
                                )}
                            </div>


                            <div className="medical-add-group">
                                <label className="medical-add-label required">Lower Limb Amputation/Surgery</label>
                                <div className={`medical-add-radio-group ${errors.hasAmputation ? "medical-add-error-group" : ""}`}>
                                    {["yes", "no"].map((val) => (
                                        <label className="medical-add-radio-label" key={`hasAmputation-${val}`}>
                                            <input
                                                type="radio"
                                                className="medical-add-radio-button"
                                                name="hasAmputation"
                                                value={val}
                                                checked={formData?.section1?.hasAmputation === val}
                                                onChange={() => {
                                                    handleChange(
                                                        { target: { name: "hasAmputation", value: val } },
                                                        "section1"
                                                    );
                                                    setHasHistory((prev) => ({
                                                        ...prev,
                                                        hasAmputation: val === "yes",
                                                    }));
                                                }}
                                                required
                                            />
                                            <span className="medical-add-radio-button-label">
                                                {val === "yes" ? "Yes" : "No"}
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                {errors.hasAmputation && <span className="medical-add-error-message">{errors.hasAmputation}</span>}
                            </div>

                            <div className="medical-add-group">
                                <label className="medical-add-label required">Lower Limb Angioplasty/Stent/Surgery</label>
                                <div className={`medical-add-radio-group ${errors.hasAngioplasty ? "medical-add-error-group" : ""}`}>
                                    {["yes", "no"].map((val) => (
                                        <label className="medical-add-radio-label" key={`angioplasty-${val}`}>
                                            <input
                                                type="radio"
                                                className="medical-add-radio-button"
                                                name="hasAngioplasty"
                                                value={val}
                                                checked={formData?.section1?.hasAngioplasty === val}
                                                onChange={() => {
                                                    handleChange(
                                                        { target: { name: "hasAngioplasty", value: val } },
                                                        "section1"
                                                    );
                                                    setHasHistory((prev) => ({
                                                        ...prev,
                                                        angioplasty: val === "yes",
                                                    }));
                                                }}
                                                required
                                            />
                                            <span className="medical-add-radio-button-label">
                                                {val === "yes" ? "Yes" : "No"}
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                {errors.hasAngioplasty && <span className="medical-add-error-message">{errors.hasAngioplasty}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 5: Other Complications */}
                <div className="medical-add-section">
                    <h2 className="medical-add-section-title">Other Diabetic Complications / Comorbidities</h2>
                    <div className="medical-add-row">
                        {[
                            {
                                name: "renal",
                                label: "Renal (dialysis/transplant) :",
                                inputLabel: "Duration (years) :",
                                inputType: "number",
                            },
                            {
                                name: "retinal",
                                label: "Retinal (visual impairment) :",
                                inputLabel: "Duration (years) :",
                                inputType: "number",
                            },
                            {
                                name: "cardiovascular",
                                label: "Cardiovascular disease :",
                                inputLabel: "Duration (years) :",
                                inputType: "number",
                            },
                            {
                                name: "heartFailure",
                                label: "Heart Failure :",
                                inputLabel: "Duration (years) :",
                                inputType: "number",
                            },
                            {
                                name: "cerebrovascular",
                                label: "Cerebrovascular disease :",
                                inputLabel: "Duration (years) :",
                                inputType: "number",
                            },
                            {
                                name: "limbIschemia",
                                label: "Lower Limb Ischaemia :",
                                inputLabel: "Duration (years) :",
                                inputType: "number",
                            },
                            {
                                name: "hypertension",
                                label: "Hypertension :",
                                inputLabel: "Duration (years) :",
                                inputType: "number",
                                verticalRadio: true,
                            },
                        ].map((item) => {
                            const field = item.name;
                            const duration = `${item.name}Duration`;

                            return (
                                <div className="medical-add-group" key={field}>
                                    {item.verticalRadio ? (
                                        // Vertical layout for fields like Hypertension
                                        <div className="medical-add-column-layout">
                                            <label className="medical-add-label">{item.label}</label>
                                            <div className={`medical-add-radio-group ${errors[field] ? "medical-add-error-group" : ""}`}>
                                                {["yes", "no"].map((val) => (
                                                    <label className="medical-add-radio-label" key={`${field}-${val}`}>
                                                        <input
                                                            type="radio"
                                                            className="medical-add-radio-button"
                                                            name={field}
                                                            value={val}
                                                            checked={formData?.section1?.[field] === val}
                                                            onChange={() => {
                                                                handleChange(
                                                                    { target: { name: field, value: val } },
                                                                    "section1"
                                                                );
                                                                setHasHistory((prev) => ({
                                                                    ...prev,
                                                                    [field]: val === "yes",
                                                                }));
                                                            }}
                                                            required
                                                        />
                                                        <span className="medical-add-radio-button-label">{val === "yes" ? "Yes" : "No"}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {errors[field] && <span className="medical-add-error-message">{errors[field]}</span>}

                                            {formData?.section1?.[field] === "yes" && (
                                                <div className="medical-add-duration-input">
                                                    <label className="medical-add-radio-label">{item.inputLabel}</label>
                                                    <input
                                                        type={item.inputType}
                                                        name={duration}
                                                        value={formData?.section1?.[duration] || ""}
                                                        onChange={(e) => handleChange(e, "section1")}
                                                        min={item.inputType === "number" ? "0" : undefined}
                                                        className={`medical-add-input ${errors[duration] ? "medical-add-error-field" : ""}`}
                                                        required
                                                    />
                                                    {errors[duration] && <span className="medical-add-error-message">{errors[duration]}</span>}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        // Horizontal layout for all other fields
                                        <div className="medical-add-row">
                                            <div style={{ minWidth: "300px" }}>
                                                <label className="medical-add-label">{item.label}</label>
                                            </div>

                                            <div className={`medical-add-radio-group ${errors[field] ? "medical-add-error-group" : ""}`}>
                                                {["yes", "no"].map((val) => (
                                                    <label className="medical-add-radio-label" key={`${field}-${val}`}>
                                                        <input
                                                            type="radio"
                                                            className="medical-add-radio-button"
                                                            name={field}
                                                            value={val}
                                                            checked={formData?.section1?.[field] === val}
                                                            onChange={() => {
                                                                handleChange(
                                                                    { target: { name: field, value: val } },
                                                                    "section1"
                                                                );
                                                                setHasHistory((prev) => ({
                                                                    ...prev,
                                                                    [field]: val === "yes",
                                                                }));
                                                            }}
                                                            required
                                                        />
                                                        <span className="medical-add-radio-button-label">{val === "yes" ? "Yes" : "No"}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {errors[field] && <span className="medical-add-error-message">{errors[field]}</span>}

                                            <div className="medical-add-radio-group">
                                                {formData?.section1?.[field] === "yes" && (
                                                    <>
                                                        <label className="medical-add-radio-label">{item.inputLabel}</label>
                                                        <input
                                                            type={item.inputType}
                                                            name={duration}
                                                            value={formData?.section1?.[duration] || ""}
                                                            onChange={(e) => handleChange(e, "section1")}
                                                            min={item.inputType === "number" ? "0" : undefined}
                                                            className={`medical-add-input ${errors[duration] ? "medical-add-error-field" : ""}`}
                                                            required
                                                        />
                                                        {errors[duration] && <span className="medical-add-error-message">{errors[duration]}</span>}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Section 6: Lifestyle Factors */}
                <div className="medical-add-section">
                    <h2 className="medical-add-section-title">Lifestyle Factors</h2>

                    <div className="medical-add-row">
                        {/* Smoking Habit */}
                        <div className="medical-add-group">
                            <label className="medical-add-label required">Smoking Habit</label>
                            <div className={`medical-add-radio-group ${errors.smoking ? "medical-add-error-group" : ""}`}>
                                {[
                                    { value: "never", label: "No" },
                                    { value: "current", label: "Yes, Current Smoker" },
                                    { value: "former", label: "Ex-Smoker" },
                                ].map((option) => (
                                    <label className="medical-add-radio-label" key={`smoking - ${option.value}`}>
                                        <input
                                            type="radio"
                                            className="medical-add-radio-button"
                                            name="smoking"
                                            value={option.value}
                                            checked={formData.section1.smoking === option.value}
                                            onChange={(e) => handleChange(e, "section1")}
                                            required
                                        />
                                        <span className="medical-add-radio-button-label">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.smoking && <span className="medical-add-error-message">{errors.smoking}</span>}
                        </div>

                        {/* Alcohol Consumption */}
                        <div className="medical-add-group">
                            <label className="medical-add-label required">Alcohol Consumption</label>
                            <div className={`medical-add-radio-group ${errors.alcohol ? "medical-add-error-group" : ""}`}>
                                {[
                                    { value: "never", label: "No" },
                                    { value: "current", label: "Yes, Current Consumer" },
                                    { value: "former", label: "Ex-Consumer" },
                                ].map((option) => (
                                    <label className="medical-add-radio-label" key={`alcohol - ${option.value}`}>
                                        <input
                                            type="radio"
                                            className="medical-add-radio-button"
                                            name="alcohol"
                                            value={option.value}
                                            checked={formData.section1.alcohol === option.value}
                                            onChange={(e) => handleChange(e, "section1")}
                                            required
                                        />
                                        <span className="medical-add-radio-button-label">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.alcohol && <span className="medical-add-error-message">{errors.alcohol}</span>}
                        </div>
                    </div>

                    {/* Tobacco Chewing */}
                    <div className="medical-add-row">
                        <div className="medical-add-group">
                            <label className="medical-add-label required">Tobacco Chewing</label>
                            <div className={`medical-add-radio-group ${errors.tobacco ? "medical-add-error-group" : ""}`}>
                                {[
                                    { value: "never", label: "No" },
                                    // { value: "yes", label: "Yes" },
                                    { value: "current", label: "Yes, Current Consumer" },
                                    { value: "former", label: "Ex-Consumer" },
                                ].map((option) => (
                                    <label className="medical-add-radio-label" key={`tobacco - ${option.value}`}>
                                        <input
                                            type="radio"
                                            className="medical-add-radio-button"
                                            name="tobacco"
                                            value={option.value}
                                            checked={formData.section1.tobacco === option.value}
                                            onChange={(e) => handleChange(e, "section1")}
                                            required
                                        />
                                        <span className="medical-add-radio-button-label">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.tobacco && <span className="medical-add-error-message">{errors.tobacco}</span>}
                        </div>
                    </div>
                </div>


                {/* Section 7: Foot Care Habits */}
                <div className="medical-add-section">
                    <h2 className="medical-add-section-title">Foot Care Habits</h2>
                    <div className="medical-add-row">
                        {[
                            { name: "wearShoes", label: "Wear shoes and socks when going out?" },
                            { name: "wearSlippers", label: "Wear slippers when going out?" },
                            { name: "walkOnSand", label: "Walk on sand/mud/clay for work?" },
                            { name: "washFeet", label: "Wash feet when coming home?" },
                        ].map((item) => (
                            <div className="medical-add-group" key={item.name}>
                                <div className="medical-add-row">
                                    <label className="medical-add-label " style={{ minWidth: "400px" }}>
                                        {item.label}
                                    </label>

                                    <div className={`medical-add-radio-group ${errors[item.name] ? "medical-add-error-group" : ""}`}>
                                        {["true", "false"].map((val) => (
                                            <label className="medical-add-radio-label" key={`${item.name}-${val}`}>
                                                <input
                                                    type="radio"
                                                    className="medical-add-radio-button"
                                                    name={item.name}
                                                    value={val}
                                                    checked={formData.section1[item.name] === val}
                                                    onChange={(e) => handleChange(e, "section1")}
                                                    required
                                                />
                                                <span className="medical-add-radio-button-label">{val === "true" ? "Yes" : "No"}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors[item.name] && <span className="medical-add-error-message">{errors[item.name]}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 8: Biochemical Investigation */}
                <div className="medical-add-section">
                    <h2 className="medical-add-section-title">Biochemical Investigation (Recent Report)</h2>
                    <div className="medical-add-row">
                        {[
                            { name: "fastingGlucose", label: "Fasting Glucose (mg/dl)" },
                            { name: "postPrandialGlucose", label: "Post Prandial Glucose (mg/dl)" },
                            { name: "hba1c", label: "HbA1c %" },
                            { name: "totalCholesterol", label: "T. Cholesterol (mg/dl)" },
                            { name: "triglycerides", label: "Triglycerides (mg/dl)" },
                            { name: "hdl", label: "HDL (mg/dl)" },
                            { name: "ldl", label: "LDL (mg/dl)" },
                            { name: "vldl", label: "VLDL (mg/dl)" },
                            { name: "serumCreatinine", label: "Serum Creatinine (mg/dl)" },
                        ].map((item) => (
                            <div className="medical-add-group" key={item.name}>
                                <label className="medical-add-label ">{item.label}</label>
                                <input
                                    type="number"
                                    name={item.name}
                                    value={formData.section1[item.name] || ""}
                                    onChange={(e) => handleChange(e, "section1")}
                                    min="0"
                                    className={`medical-add-input ${errors[item.name] ? "medical-add-error-field" : ""}`}
                                    required
                                />
                                {errors[item.name] && <span className="medical-add-error-message">{errors[item.name]}</span>}
                            </div>
                        ))}
                    </div>
                </div>

            </form>
        </div>
    )
}

export default StepForm1
