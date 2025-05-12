"use client";

import { useState, useEffect } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import FormLayout from "../../../layouts/FormLayout"
import "./StepForm.css"
import { ArrowLeftToLine, ArrowRightToLine } from 'lucide-react'
import { LoadingOutlined } from "@ant-design/icons"
import { toast } from "react-toastify"
import { formatToDDMMYYYY } from "../../../utils/dateUtils"

const FollowUpForm = () => {
    const { patientId } = useParams()
    const location = useLocation()
    const { isUpdate, initialData } = location.state || {}

    // Initialize form data with existing data if available
    const [formData, setFormData] = useState({
        section4: {
            woundDebridement: "",
            amputation: "",
            amputationType: "",
            amputationLevel: "",
            woundHealed: "",
            healingTime: "",
            recurrentUlcer: "",
            survivalStatus: "alive",
            deathDate: "",
            deathReason: "",
        },
    })

    const [errors, setErrors] = useState({
        woundDebridement: false,
        amputation: false,
        woundHealed: false,
        amputationType: false,
        amputationLevel: false,
        healingTime: false,
        recurrentUlcer: false,
        survivalStatus: false,
        deathDate: false,
        deathReason: false,
    })

    const [isSaving, setIsSaving] = useState(false)
    const navigate = useNavigate()

    // Load existing data if editing - this useEffect ensures the form is populated with existing data
    useEffect(() => {
        if (initialData?.followUpData) {
            setFormData({
                section4: {
                    woundDebridement: initialData.followUpData.woundDebridement || "",
                    amputation: initialData.followUpData.amputation || "",
                    amputationType: initialData.followUpData.amputationType || "",
                    amputationLevel: initialData.followUpData.amputationLevel || "",
                    woundHealed: initialData.followUpData.woundHealed || "",
                    healingTime: initialData.followUpData.healingTime || "",
                    recurrentUlcer: initialData.followUpData.recurrentUlcer || "",
                    survivalStatus: initialData.followUpData.survivalStatus || "alive",
                    deathDate: initialData.followUpData.deathDate || "",
                    deathReason: initialData.followUpData.deathReason || "",
                },
            })
        }
    }, [initialData])

    const handleChange = (e, section) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: value,
            },
        }))

        // Clear error when field is changed
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: false,
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {
            woundDebridement: !formData.section4.woundDebridement,
            amputation: !formData.section4.amputation,
            woundHealed: !formData.section4.woundHealed,
            amputationType: formData.section4.amputation === "yes" && !formData.section4.amputationType,
            amputationLevel: formData.section4.amputation === "yes" && !formData.section4.amputationLevel,
            healingTime: formData.section4.woundHealed === "yes" && !formData.section4.healingTime,
            recurrentUlcer: !formData.section4.recurrentUlcer,
            survivalStatus: !formData.section4.survivalStatus,
            deathDate: formData.section4.survivalStatus === "death" && !formData.section4.deathDate,
            deathReason: formData.section4.survivalStatus === "death" && !formData.section4.deathReason,
        }

        setErrors(newErrors)
        return !Object.values(newErrors).some((error) => error)
    }

    const scrollToFirstError = () => {
        const firstErrorField = Object.keys(errors).find((key) => errors[key])
        if (firstErrorField) {
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`)
            if (errorElement) {
                errorElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                })
                errorElement.focus()
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            scrollToFirstError();
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSaving(true);

        try {
            const now = new Date();
            const patientRecords = JSON.parse(localStorage.getItem("patientRecords") || []);

            // Calculate next follow-up date (6 months from now)
            const nextFollowUpDate = new Date();
            nextFollowUpDate.setMonth(nextFollowUpDate.getMonth() + 6);

            const updatedRecords = patientRecords.map((record) => {
                if (record.patientId === patientId) {
                    return {
                        ...record,
                        followUpStatus: "Completed",
                        lastFollowUpDate: now.toISOString(),
                        followUpData: {
                            ...formData.section4,
                            followUpDate: now.toISOString()
                        },
                        nextFollowUpDate: nextFollowUpDate.toISOString(),
                        // Mark when initial follow-up was completed
                        ...(location.state?.isInitialFollowUp && {
                            initialFollowUpCompleted: now.toISOString()
                        })
                    };
                }
                return record;
            });

            localStorage.setItem("patientRecords", JSON.stringify(updatedRecords));

            toast.success(
                location.state?.isInitialFollowUp
                    ? "Initial follow-up completed!"
                    : "Follow-up updated successfully!"
            );  

            navigate("/user/dashboard", {
                state: {
                    showToast: true,
                    toastMessage: "Follow-up data saved successfully"
                }
            });
        } catch (error) {
            console.error("Error saving follow-up:", error);
            toast.error("Failed to save follow-up data");
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <FormLayout>
            <div className="medical-add-container">
                <div className="form-header">
                    <h2 className="medical-add-section-title">{isUpdate ? "Update" : "Add"} Follow-up Assessment</h2>
                    <div>
                        {initialData?.lastFollowUpDate && (
                            <small className="last-followup">Last follow-up: {formatToDDMMYYYY(initialData.lastFollowUpDate)}</small>
                        )}
                        <button type="button" onClick={() => navigate(-1)} className="dashboard-btn">
                            <ArrowLeftToLine size={18} />
                            <span>Back</span>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="medical-add-form">
                    <div className="medical-add-section step-form-4">
                        <h2 className="medical-add-section-title">Final Treatment Outcomes (after 6 months)</h2>

                        <div className="medical-add-row">
                            <div className="col-md-4 medical-add-group">
                                <label className="medical-add-label required">Wound debridement performed?</label>
                                <div className={`medical-add-radio-group ${errors.woundDebridement ? "error" : ""}`}>
                                    <label className="medical-add-radio-label">
                                        <input
                                            type="radio"
                                            name="woundDebridement"
                                            value="yes"
                                            checked={formData.section4.woundDebridement === "yes"}
                                            onChange={(e) => handleChange(e, "section4")}
                                            className="medical-add-radio-button"
                                        />
                                        <span className="medical-add-radio-button-label">Yes</span>
                                    </label>
                                    <label className="medical-add-radio-label">
                                        <input
                                            type="radio"
                                            name="woundDebridement"
                                            value="no"
                                            checked={formData.section4.woundDebridement === "no"}
                                            onChange={(e) => handleChange(e, "section4")}
                                            className="medical-add-radio-button"
                                        />
                                        <span className="medical-add-radio-button-label">No</span>
                                    </label>
                                </div>
                                {errors.woundDebridement && <span className="error-message">This field is required</span>}
                            </div>

                            <div className="col-md-4 medical-add-group">
                                <label className="medical-add-label required">Amputation performed?</label>
                                <div className={`medical-add-radio-group ${errors.amputation ? "error" : ""}`}>
                                    <label className="medical-add-radio-label">
                                        <input
                                            type="radio"
                                            name="amputation"
                                            value="yes"
                                            checked={formData.section4.amputation === "yes"}
                                            onChange={(e) => handleChange(e, "section4")}
                                            className="medical-add-radio-button"
                                        />
                                        <span className="medical-add-radio-button-label">Yes</span>
                                    </label>
                                    <label className="medical-add-radio-label">
                                        <input
                                            type="radio"
                                            name="amputation"
                                            value="no"
                                            checked={formData.section4.amputation === "no"}
                                            onChange={(e) => handleChange(e, "section4")}
                                            className="medical-add-radio-button"
                                        />
                                        <span className="medical-add-radio-button-label">No</span>
                                    </label>
                                </div>
                                {errors.amputation && <span className="error-message">This field is required</span>}
                            </div>

                           
                        </div>

                        {formData.section4.amputation === "yes" && (
                            <div className="medical-add-row mt-3">
                                <div className="col-md-6 medical-add-group">
                                    <label className="medical-add-label required">Amputation type</label>
                                    <div className={`medical-add-radio-group ${errors.amputationType ? "error" : ""}`}>
                                        <label className="medical-add-radio-label">
                                            <input
                                                type="radio"
                                                name="amputationType"
                                                value="minor"
                                                checked={formData.section4.amputationType === "minor"}
                                                onChange={(e) => handleChange(e, "section4")}
                                                className="medical-add-radio-button"
                                            />
                                            <span className="medical-add-radio-button-label">Minor</span>
                                        </label>
                                        <label className="medical-add-radio-label">
                                            <input
                                                type="radio"
                                                name="amputationType"
                                                value="major"
                                                checked={formData.section4.amputationType === "major"}
                                                onChange={(e) => handleChange(e, "section4")}
                                                className="medical-add-radio-button"
                                            />
                                            <span className="medical-add-radio-button-label">Major</span>
                                        </label>
                                    </div>
                                    {errors.amputationType && <span className="error-message">This field is required</span>}
                                </div>

                                <div className="col-md-6 medical-add-group">
                                    <label className="medical-add-label required">Amputation level</label>
                                    <div className={`medical-add-radio-group ${errors.amputationLevel ? "error" : ""}`}>
                                        <label className="medical-add-radio-label">
                                            <input
                                                type="radio"
                                                name="amputationLevel"
                                                value="below_knee"
                                                checked={formData.section4.amputationLevel === "below_knee"}
                                                onChange={(e) => handleChange(e, "section4")}
                                                className="medical-add-radio-button"
                                            />
                                            <span className="medical-add-radio-button-label">Below knee</span>
                                        </label>
                                        <label className="medical-add-radio-label">
                                            <input
                                                type="radio"
                                                name="amputationLevel"
                                                value="above_knee"
                                                checked={formData.section4.amputationLevel === "above_knee"}
                                                onChange={(e) => handleChange(e, "section4")}
                                                className="medical-add-radio-button"
                                            />
                                            <span className="medical-add-radio-button-label">Above knee</span>
                                        </label>
                                    </div>
                                    {errors.amputationLevel && <span className="error-message">This field is required</span>}
                                </div>
                            </div>
                        )}
                        <div className="col-md-4 medical-add-group">
                            <label className="medical-add-label required">Has the wound healed?</label>
                            <div className={`medical-add-radio-group ${errors.woundHealed ? "error" : ""}`}>
                                <label className="medical-add-radio-label">
                                    <input
                                        type="radio"
                                        name="woundHealed"
                                        value="yes"
                                        checked={formData.section4.woundHealed === "yes"}
                                        onChange={(e) => handleChange(e, "section4")}
                                        className="medical-add-radio-button"
                                    />
                                    <span className="medical-add-radio-button-label">Yes</span>
                                </label>
                                <label className="medical-add-radio-label">
                                    <input
                                        type="radio"
                                        name="woundHealed"
                                        value="no"
                                        checked={formData.section4.woundHealed === "no"}
                                        onChange={(e) => handleChange(e, "section4")}
                                        className="medical-add-radio-button"
                                    />
                                    <span className="medical-add-radio-button-label">No</span>
                                </label>
                            </div>
                            {errors.woundHealed && <span className="error-message">This field is required</span>}
                        </div>
                        {formData.section4.woundHealed === "yes" && (
                            <div className="medical-add-group">
                                <label className="required" style={{ minWidth: "350px" }}>
                                    Time of Healing (days)
                                </label>
                                <input
                                    type="number"
                                    name="healingTime"
                                    value={formData.section4.healingTime}
                                    onChange={(e) => handleChange(e, "section4")}
                                    min="1"
                                    className={`medical-add-input ${errors.healingTime ? "error" : ""}`}
                                    style={{ maxWidth: "250px" }}
                                />
                                {errors.healingTime && <span className="error-message">This field is required</span>}
                            </div>
                        )}

                        <div className="medical-add-row">
                            <div className="col-md-6 medical-add-group">
                                <label className="required" style={{ minWidth: "350px" }}>
                                    Presence of recurrent ulcer?
                                </label>
                                <div className={`medical-add-radio-group ${errors.recurrentUlcer ? "error" : ""}`}>
                                    <label className="medical-add-radio-label">
                                        <input
                                            type="radio"
                                            name="recurrentUlcer"
                                            value="yes"
                                            checked={formData.section4.recurrentUlcer === "yes"}
                                            onChange={(e) => handleChange(e, "section4")}
                                            className="medical-add-radio-button"
                                        />
                                        <span className="medical-add-radio-button-label">Yes</span>
                                    </label>
                                    <label className="medical-add-radio-label">
                                        <input
                                            type="radio"
                                            name="recurrentUlcer"
                                            value="no"
                                            checked={formData.section4.recurrentUlcer === "no"}
                                            onChange={(e) => handleChange(e, "section4")}
                                            className="medical-add-radio-button"
                                        />
                                        <span className="medical-add-radio-button-label">No</span>
                                    </label>
                                </div>
                                {errors.recurrentUlcer && <span className="error-message">This field is required</span>}
                            </div>

                            <div className="col-md-6 medical-add-group">
                                <label className="required" style={{ minWidth: "350px" }}>
                                    Survival status
                                </label>
                                <div className={`medical-add-radio-group ${errors.survivalStatus ? "error" : ""}`}>
                                    <label className="medical-add-radio-label">
                                        <input
                                            type="radio"
                                            name="survivalStatus"
                                            value="alive"
                                            checked={formData.section4.survivalStatus === "alive"}
                                            onChange={(e) => handleChange(e, "section4")}
                                            className="medical-add-radio-button"
                                        />
                                        <span className="medical-add-radio-button-label">Alive</span>
                                    </label>
                                    <label className="medical-add-radio-label">
                                        <input
                                            type="radio"
                                            name="survivalStatus"
                                            value="death"
                                            checked={formData.section4.survivalStatus === "death"}
                                            onChange={(e) => handleChange(e, "section4")}
                                            className="medical-add-radio-button"
                                        />
                                        <span className="medical-add-radio-button-label">Death</span>
                                    </label>
                                </div>
                                {errors.survivalStatus && <span className="error-message">This field is required</span>}
                            </div>
                        </div>

                        {formData.section4.survivalStatus === "death" && (
                            <div className="medical-add-row">
                                <div className="col-md-6 medical-add-group">
                                    <label className="required" style={{ minWidth: "350px" }}>
                                        Date of death
                                    </label>
                                    <input
                                        type="date"
                                        name="deathDate"
                                        value={formData.section4.deathDate}
                                        onChange={(e) => handleChange(e, "section4")}
                                        className={`medical-add-input ${errors.deathDate ? "error" : ""}`}
                                        onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                                    />
                                    {errors.deathDate && <span className="error-message">This field is required</span>}
                                </div>
                                <div className="col-md-6 medical-add-group">
                                    <label className="required" style={{ minWidth: "350px" }}>
                                        Reason for death
                                    </label>
                                    <textarea
                                        name="deathReason"
                                        value={formData.section4.deathReason}
                                        onChange={(e) => handleChange(e, "section4")}
                                        className={`medical-add-input ${errors.deathReason ? "error" : ""}`}
                                        placeholder="Enter reason for death"
                                    />
                                    {errors.deathReason && <span className="error-message">This field is required</span>}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="step-form-actions followupformaction">
                        <div className="action-buttons">
                            <button type="submit" className="submit-btn" disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <LoadingOutlined style={{ marginRight: 8 }} />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <ArrowRightToLine size={18} />
                                        <span>Submit Follow-up</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </FormLayout>
    )
}

export default FollowUpForm
