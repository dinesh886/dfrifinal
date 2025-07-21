"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom" // Changed to react-router-dom
import FormLayout from "../../../layouts/FormLayout"
import "../StepForm/StepForm.css" // Assuming you have a CSS file for this form
import { Send, ArrowLeftToLine } from "lucide-react"
import { LoadingOutlined } from "@ant-design/icons"
import { toast } from "react-toastify"
import { apiPost, apiGet } from "../../../services/api-helper" // Added apiGet
import { API_BASE_URL } from "../../../config/api"

// This form is specifically for 6-month follow-ups.
export default function SixMonthFollowUpForm() {
    const navigate = useNavigate() // Changed
    const params = useParams()
    const [searchParams] = useSearchParams() // Changed

    const initialDataString = searchParams.get("initialData")
    const isInitialFollowUp = searchParams.get("isInitialFollowUp") === "true"
    const isUpdate = searchParams.get("isUpdate") === "true"

    let initialData = null
    try {
        if (initialDataString) {
            initialData = JSON.parse(decodeURIComponent(initialDataString))
        }
    } catch (e) {
        console.error("Error parsing initialData from URL:", e)
    }

    const [patientId, setPatientId] = useState(params.patientId || initialData?.patientId || "") // Use params.patientId
    const [patientName, setPatientName] = useState(initialData?.patient_name || "")
    const [formData, setFormData] = useState({
        followUpDate: "",
        notes: "",
        woundHealed: "", // "yes" or "no"
        healingTime: "", // number (only if woundHealed === "yes")
        nonHealingReason: "", // string (only if woundHealed === "no")
        surgicalIntervention: "", // string (only if woundHealed === "no")
        amputationPerformed: "", // "No", "Minor", "Major" (only if woundHealed === "no")
        hospitalVisits: "", // number (shown always if woundHealed is selected)
        hospitalized: "", // "yes" or "no"
        hospitalStayLength: "", // number (only if hospitalized === "yes")
        amputationType: "", // "minor" or "major" (only if amputation === "yes")
        amputationLevel: "", // "below_knee" or "above_knee" (only if amputation === "yes")
        survivalStatus: "",
        deathDate: "",
        deathReason: "",
        activeUlcer: "", // 'yes' or 'no'
    })
    const [isSaving, setIsSaving] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (!patientId) {
            // Use patientId from params
            console.error("Missing patientId for SixMonthFollowUpForm.")
            toast.error("Invalid patient data. Please try again.")
            navigate("/user/rssdi-save-the-feet-2.0") // Changed
            return
        }

        setPatientId(patientId) // Ensure patientId is set from params
        setPatientName(initialData?.patient_name || "") // Set patient name from initialData
        if (initialData?.followUpData) {
            setFormData(initialData.followUpData)
        }

        const loadFollowUpData = async () => {
            if (isUpdate && patientId) {
                try {
                    console.log("Fetching 6-month follow-up data for patientId:", patientId)
                    // Assuming a specific endpoint for 6-month follow-up data
                    const response = await apiGet(`follow-up/6month/${patientId}`)
                    console.log("6-month Follow-up API Response:", response)
                    if (response.success && response.data) {
                        const data = response.data
                        setFormData({
                            woundHealed: data.has_wound_healed?.toLowerCase() || "",
                            healingTime: data.time_of_healing_days || "",
                            nonHealingReason: data.non_healing_reason || "",
                            surgicalIntervention: data.surgical_intervention || "",
                            amputationPerformed: data.amputation_performed || "",
                            hospitalVisits: data.hospital_visits || "",
                            hospitalized: data.hospitalized?.toLowerCase() || "",
                            hospitalStayLength: data.hospital_stay_length || "",
                            amputationType: data.amputation_type?.toLowerCase() || "",
                            amputationLevel: data.amputation_level?.toLowerCase().replace(" ", "_") || "",
                            survivalStatus: data.survival_status?.toLowerCase() || "",
                            deathDate: data.date_of_death || "",
                            deathReason: data.reason_for_death || "",
                            activeUlcer: data.active_ulcer?.toLowerCase() || "",
                            followUpDate: data.follow_up_date || "",
                            notes: data.notes || "",
                        })
                    }
                } catch (error) {
                    console.error("Error fetching 6-month follow-up data:", error)
                    toast.error("Failed to load 6-month follow-up data")
                }
            }
        }
        loadFollowUpData()
    }, [isUpdate, patientId, navigate, initialData]) // Added navigate and initialData to dependencies

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }

    const validateForm = () => {
        const newErrors = {}
        if (!formData.followUpDate) newErrors.followUpDate = "Follow-up date is required"
        if (!formData.notes.trim()) newErrors.notes = "Notes are required"
        if (!formData.woundHealed) newErrors.woundHealed = "This field is required"
        if (formData.woundHealed === "yes" && !formData.healingTime) newErrors.healingTime = "Healing Time is required"
        if (formData.woundHealed === "no" && !formData.nonHealingReason) newErrors.nonHealingReason = "Reason is required"
        if (formData.woundHealed === "no" && !formData.surgicalIntervention)
            newErrors.surgicalIntervention = "Surgical intervention is required"
        if (formData.woundHealed === "no" && !formData.amputationPerformed)
            newErrors.amputationPerformed = "Amputation performed is required"
        if (!formData.hospitalVisits) newErrors.hospitalVisits = "No. of hospital visits is required"
        if (!formData.hospitalized) newErrors.hospitalized = "Hospitalization is required"
        if (formData.hospitalized === "yes" && !formData.hospitalStayLength)
            newErrors.hospitalStayLength = "Length of hospital stay is required"
        if (["Minor", "Major"].includes(formData.amputationPerformed) && !formData.amputationType)
            newErrors.amputationType = "Amputation type is required"
        if (["Minor", "Major"].includes(formData.amputationPerformed) && !formData.amputationLevel)
            newErrors.amputationLevel = "Amputation level is required"
        if (!formData.survivalStatus) newErrors.survivalStatus = "Survival status is required"
        if (formData.survivalStatus === "death" && !formData.deathDate) newErrors.deathDate = "Date of death is required"
        if (formData.survivalStatus === "death" && !formData.deathReason)
            newErrors.deathReason = "Reason for death is required"
        if (!formData.activeUlcer) newErrors.activeUlcer = "Is there any new/active ulcer is required"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSaving) return

        if (!validateForm()) {
            toast.error("Please fill all required fields.")
            return
        }

        setIsSaving(true)
        try {
            const payload = {
                patient_id: patientId,
                follow_up_date: formData.followUpDate,
                notes: formData.notes,
                wound_healed: formData.woundHealed === "yes" ? "Yes" : "No",
                healing_time:
                    formData.woundHealed === "yes" && formData.healingTime ? Number.parseInt(formData.healingTime) : null,
                non_healing_reason: formData.woundHealed === "no" ? formData.nonHealingReason : null,
                surgical_intervention: formData.woundHealed === "no" ? formData.surgicalIntervention : null,
                amputation_performed: formData.woundHealed === "no" ? formData.amputationPerformed : "No",
                hospital_visits: formData.hospitalVisits ? Number.parseInt(formData.hospitalVisits) : null,
                hospitalized: formData.hospitalized === "yes" ? "Yes" : "No",
                hospital_stay_length:
                    formData.hospitalized === "yes" && formData.hospitalStayLength
                        ? Number.parseInt(formData.hospitalStayLength)
                        : null,
                amputation_type: ["Minor", "Major"].includes(formData.amputationPerformed)
                    ? formData.amputationType.charAt(0).toUpperCase() + formData.amputationType.slice(1)
                    : null,
                amputation_level: ["Minor", "Major"].includes(formData.amputationPerformed)
                    ? formData.amputationLevel.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
                    : null,
                survival_status: formData.survivalStatus.charAt(0).toUpperCase() + formData.survivalStatus.slice(1),
                date_of_death: formData.survivalStatus === "death" ? formData.deathDate : null,
                reason_for_death: formData.survivalStatus === "death" ? formData.deathReason : null,
                active_ulcer: formData.activeUlcer === "yes" ? "Yes" : "No",
                follow_up_type: "6-month", // Explicitly set for 6-month follow-up
            }

            const url = isUpdate
                ? `${API_BASE_URL}/follow-up/6month/update/${patientId}`
                : `${API_BASE_URL}/follow-up/6month/submit`

            const response = await apiPost(url, payload)

            if (response.success) {
                toast.success(`6-Month Follow-up for ${patientName} submitted successfully!`)

                // Update local storage patient record
                const existingRecords = JSON.parse(localStorage.getItem("patientRecords") || "[]")
                const updatedRecords = existingRecords.map((record) => {
                    if (record.patientId === patientId) {
                        return {
                            ...record,
                            follow_up_status: "Completed",
                            last_follow_up_date: new Date().toISOString(),
                            followUpData: formData, // Store the submitted follow-up data
                        }
                    }
                    return record
                })
                localStorage.setItem("patientRecords", JSON.stringify(updatedRecords))

                navigate(
                    // Changed
                    `/user/rssdi-save-the-feet-2.0?${new URLSearchParams({
                        showToast: true,
                        toastMessage: `6-Month Follow-up for ${patientName} completed!`,
                        refresh: true,
                    }).toString()}`,
                )
            } else {
                throw new Error(response.message || "Failed to submit follow-up.")
            }
        } catch (error) {
            console.error("Error submitting follow-up:", error)
            toast.error(error.message || "Failed to submit follow-up. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleBackToDashboard = () => {
        navigate(-1) // Changed
    }

    return (
        <FormLayout>
            <div className="follow-up-form-container">
                <div className="form-header">
                    <h2 className="form-title">6-Month Follow-up Assessment for {patientName}</h2>
                    <button
                        type="button"
                        onClick={handleBackToDashboard}
                        className="dashboard-btn"
                        aria-label="Go back to dashboard"
                    >
                        <ArrowLeftToLine size={18} />
                        <span>Dashboard</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="form-content">
                    <div className="form-group">
                        <label htmlFor="followUpDate">Follow-up Date:</label>
                        <input
                            type="date"
                            id="followUpDate"
                            name="followUpDate"
                            value={formData.followUpDate}
                            onChange={handleChange}
                            className={errors.followUpDate ? "input-error" : ""}
                            disabled={isSaving}
                        />
                        {errors.followUpDate && <p className="error-message">{errors.followUpDate}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Notes:</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className={errors.notes ? "input-error" : ""}
                            rows="5"
                            disabled={isSaving}
                        ></textarea>
                        {errors.notes && <p className="error-message">{errors.notes}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="woundHealed">Has the wound healed?</label>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    id="woundHealedYes"
                                    name="woundHealed"
                                    value="yes"
                                    checked={formData.woundHealed === "yes"}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                />
                                Yes
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    id="woundHealedNo"
                                    name="woundHealed"
                                    value="no"
                                    checked={formData.woundHealed === "no"}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                />
                                No
                            </label>
                        </div>
                        {errors.woundHealed && <p className="error-message">{errors.woundHealed}</p>}
                    </div>

                    {formData.woundHealed === "yes" && (
                        <div className="form-group">
                            <label htmlFor="healingTime">Healing Time (in days):</label>
                            <input
                                type="number"
                                id="healingTime"
                                name="healingTime"
                                value={formData.healingTime}
                                onChange={handleChange}
                                className={errors.healingTime ? "input-error" : ""}
                                disabled={isSaving}
                            />
                            {errors.healingTime && <p className="error-message">{errors.healingTime}</p>}
                        </div>
                    )}

                    {formData.woundHealed === "no" && (
                        <>
                            <div className="form-group">
                                <label htmlFor="nonHealingReason">Reason:</label>
                                <div className="radio-group">
                                    {["Loss of follow up", "Non compliance", "Healed and reoccurrence"].map((reason) => (
                                        <label key={reason}>
                                            <input
                                                type="radio"
                                                id={`nonHealingReason${reason}`}
                                                name="nonHealingReason"
                                                value={reason}
                                                checked={formData.nonHealingReason === reason}
                                                onChange={handleChange}
                                                disabled={isSaving}
                                            />
                                            {reason}
                                        </label>
                                    ))}
                                </div>
                                {errors.nonHealingReason && <p className="error-message">{errors.nonHealingReason}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="surgicalIntervention">Surgical intervention performed:</label>
                                <div className="radio-group">
                                    {["Callus excision", "Sequestectomy", "Incision and drainage", "Wound debridement", "Others"].map(
                                        (option) => (
                                            <label key={option}>
                                                <input
                                                    type="radio"
                                                    id={`surgicalIntervention${option}`}
                                                    name="surgicalIntervention"
                                                    value={option}
                                                    checked={formData.surgicalIntervention === option}
                                                    onChange={handleChange}
                                                    disabled={isSaving}
                                                />
                                                {option}
                                            </label>
                                        ),
                                    )}
                                </div>
                                {errors.surgicalIntervention && <p className="error-message">{errors.surgicalIntervention}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="amputationPerformed">Amputation performed?</label>
                                <div className="radio-group">
                                    {["No", "Minor", "Major"].map((type) => (
                                        <label key={type}>
                                            <input
                                                type="radio"
                                                id={`amputationPerformed${type}`}
                                                name="amputationPerformed"
                                                value={type}
                                                checked={formData.amputationPerformed === type}
                                                onChange={handleChange}
                                                disabled={isSaving}
                                            />
                                            {type}
                                        </label>
                                    ))}
                                </div>
                                {errors.amputationPerformed && <p className="error-message">{errors.amputationPerformed}</p>}
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label htmlFor="hospitalVisits">No. of hospital visits:</label>
                        <input
                            type="number"
                            id="hospitalVisits"
                            name="hospitalVisits"
                            value={formData.hospitalVisits}
                            onChange={handleChange}
                            className={errors.hospitalVisits ? "input-error" : ""}
                            disabled={isSaving}
                        />
                        {errors.hospitalVisits && <p className="error-message">{errors.hospitalVisits}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="hospitalized">Hospitalization?</label>
                        <div className="radio-group">
                            {["yes", "no"].map((value) => (
                                <label key={value}>
                                    <input
                                        type="radio"
                                        id={`hospitalized${value}`}
                                        name="hospitalized"
                                        value={value}
                                        checked={formData.hospitalized === value}
                                        onChange={handleChange}
                                        disabled={isSaving}
                                    />
                                    {value.charAt(0).toUpperCase() + value.slice(1)}
                                </label>
                            ))}
                        </div>
                        {errors.hospitalized && <p className="error-message">{errors.hospitalized}</p>}
                    </div>

                    {formData.hospitalized === "yes" && (
                        <div className="form-group">
                            <label htmlFor="hospitalStayLength">Length of hospital stay (in days):</label>
                            <input
                                type="number"
                                id="hospitalStayLength"
                                name="hospitalStayLength"
                                value={formData.hospitalStayLength}
                                onChange={handleChange}
                                className={errors.hospitalStayLength ? "input-error" : ""}
                                disabled={isSaving}
                            />
                            {errors.hospitalStayLength && <p className="error-message">{errors.hospitalStayLength}</p>}
                        </div>
                    )}

                    {["Minor", "Major"].includes(formData.amputationPerformed) && (
                        <>
                            <div className="form-group">
                                <label htmlFor="amputationType">Amputation type:</label>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            id="amputationTypeMinor"
                                            name="amputationType"
                                            value="minor"
                                            checked={formData.amputationType === "minor"}
                                            onChange={handleChange}
                                            disabled={isSaving}
                                        />
                                        Minor
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            id="amputationTypeMajor"
                                            name="amputationType"
                                            value="major"
                                            checked={formData.amputationType === "major"}
                                            onChange={handleChange}
                                            disabled={isSaving}
                                        />
                                        Major
                                    </label>
                                </div>
                                {errors.amputationType && <p className="error-message">{errors.amputationType}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="amputationLevel">Amputation level:</label>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            id="amputationLevelBelowKnee"
                                            name="amputationLevel"
                                            value="below_knee"
                                            checked={formData.amputationLevel === "below_knee"}
                                            onChange={handleChange}
                                            disabled={isSaving}
                                        />
                                        Below knee
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            id="amputationLevelAboveKnee"
                                            name="amputationLevel"
                                            value="above_knee"
                                            checked={formData.amputationLevel === "above_knee"}
                                            onChange={handleChange}
                                            disabled={isSaving}
                                        />
                                        Above knee
                                    </label>
                                </div>
                                {errors.amputationLevel && <p className="error-message">{errors.amputationLevel}</p>}
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label htmlFor="survivalStatus">Survival status:</label>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    id="survivalStatusAlive"
                                    name="survivalStatus"
                                    value="alive"
                                    checked={formData.survivalStatus === "alive"}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                />
                                Alive
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    id="survivalStatusDeath"
                                    name="survivalStatus"
                                    value="death"
                                    checked={formData.survivalStatus === "death"}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                />
                                Death
                            </label>
                        </div>
                        {errors.survivalStatus && <p className="error-message">{errors.survivalStatus}</p>}
                    </div>

                    {formData.survivalStatus === "death" && (
                        <>
                            <div className="form-group">
                                <label htmlFor="deathDate">Date of death:</label>
                                <input
                                    type="date"
                                    id="deathDate"
                                    name="deathDate"
                                    value={formData.deathDate}
                                    onChange={handleChange}
                                    className={errors.deathDate ? "input-error" : ""}
                                    disabled={isSaving}
                                />
                                {errors.deathDate && <p className="error-message">{errors.deathDate}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="deathReason">Reason for death:</label>
                                <textarea
                                    id="deathReason"
                                    name="deathReason"
                                    value={formData.deathReason}
                                    onChange={handleChange}
                                    className={errors.deathReason ? "input-error" : ""}
                                    rows="3"
                                    disabled={isSaving}
                                ></textarea>
                                {errors.deathReason && <p className="error-message">{errors.deathReason}</p>}
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label htmlFor="activeUlcer">Is there any new/active ulcer?</label>
                        <div className="radio-group">
                            {["yes", "no"].map((value) => (
                                <label key={value}>
                                    <input
                                        type="radio"
                                        id={`activeUlcer${value}`}
                                        name="activeUlcer"
                                        value={value}
                                        checked={formData.activeUlcer === value}
                                        onChange={handleChange}
                                        disabled={isSaving}
                                    />
                                    {value.charAt(0).toUpperCase() + value.slice(1)}
                                </label>
                            ))}
                        </div>
                        {errors.activeUlcer && <p className="error-message">{errors.activeUlcer}</p>}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <LoadingOutlined style={{ marginRight: 8 }} />
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    <span>Submit 6-Month Follow-up</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </FormLayout>
    )
}
