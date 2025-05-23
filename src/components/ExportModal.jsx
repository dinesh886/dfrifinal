"use client";

import { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { DatePicker } from "antd";
import { BsDownload } from "react-icons/bs";
import { toast } from "react-toastify";
import "./ExportModal.css";

const ExportModal = ({
    isOpen,
    onClose,
    onExport,
    isLoading,
    exportFileName = "data_export",
    columns = [],
    data = [],
}) => {
    const [dateRange, setDateRange] = useState([null, null]);
    const [gender, setGender] = useState("all");
    const [ageRange, setAgeRange] = useState({ min: "", max: "" });
    const [errors, setErrors] = useState({
        dateRange: "",
        ageRange: "",
    });

    // Validate fields based on available data
    const validateFields = () => {
        const newErrors = {
            dateRange: "",
            ageRange: "",
        };
        let isValid = true;

        // Validate date range if date field exists
        const hasDateField = data.some((item) => item.date);
        if (hasDateField) {
            if (!dateRange[0] || !dateRange[1]) {
                newErrors.dateRange = "Both start and end dates are required";
                isValid = false;
            } else if (dateRange[0] > dateRange[1]) {
                newErrors.dateRange = "End date must be after start date";
                isValid = false;
            }
        }

        // Validate age range if age field exists
        const hasAgeField = data.some((item) => item.age);
        if (hasAgeField) {
            if (!ageRange.min || !ageRange.max) {
                newErrors.ageRange = "Both min and max ages are required";
                isValid = false;
            } else if (parseInt(ageRange.min) > parseInt(ageRange.max)) {
                newErrors.ageRange = "Max age must be greater than min age";
                isValid = false;
            } else if (parseInt(ageRange.min) < 0 || parseInt(ageRange.max) < 0) {
                newErrors.ageRange = "Age cannot be negative";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleExportClick = () => {
        if (!validateFields()) {
            toast.error("Please fix the errors before exporting.");
            return;
        }
        // Hardcode format to xlsx since only Excel is supported
        onExport({ format: "xlsx", gender, ageRange, dateRange });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="export-modal">
                <div className="modal-header">
                    <h3>Export Data</h3>
                    <button
                        className="close-btn"
                        onClick={onClose}
                        aria-label="Close export modal"
                    >
                        <RxCross2 />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="filter-section">
                        <div className="filter-group">
                            <label className="filter-label">Date Range</label>
                            <div className="date-picker-wrapper">
                                <DatePicker.RangePicker
                                    value={dateRange}
                                    onChange={setDateRange}
                                    format="DD-MM-YYYY"
                                    className={`date-range-picker ${errors.dateRange ? "error" : ""}`}
                                    suffixIcon={<FaCalendarAlt className="calendar-icon" />}
                                    disabledDate={(current) => current && current > new Date()} // <-- Add this
                                />

                                {errors.dateRange && (
                                    <div className="error-message">{errors.dateRange}</div>
                                )}
                            </div>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Gender</label>
                            <div className="gender-tabs">
                                <button
                                    type="button"
                                    className={`gender-tab ${gender === "all" ? "active" : ""}`}
                                    onClick={() => setGender("all")}
                                >
                                    All
                                </button>
                                <button
                                    type="button"
                                    className={`gender-tab ${gender === "male" ? "active" : ""}`}
                                    onClick={() => setGender("male")}
                                >
                                    Male
                                </button>
                                <button
                                    type="button"
                                    className={`gender-tab ${gender === "female" ? "active" : ""}`}
                                    onClick={() => setGender("female")}
                                >
                                    Female
                                </button>
                            </div>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Age Range</label>
                            <div className="age-range-inputs">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={ageRange.min}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || /^[0-9\b]+$/.test(value)) {
                                            setAgeRange({ ...ageRange, min: value });
                                        }
                                    }}
                                    className={`age-input ${errors.ageRange ? "error" : ""}`}
                                    min="0"
                                />
                                <span className="range-separator">to</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={ageRange.max}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || /^[0-9\b]+$/.test(value)) {
                                            setAgeRange({ ...ageRange, max: value });
                                        }
                                    }}
                                    className={`age-input ${errors.ageRange ? "error" : ""}`}
                                    min="0"
                                />
                            </div>
                            {errors.ageRange && (
                                <div className="error-message">{errors.ageRange}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <a
                        type="button"
                        className="cancel-btn"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </a>
                    <a
                        type="button"
                        className="action-btn download-excel"
                        onClick={handleExportClick}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="spinner"></div>
                        ) : (
                            <>
                                <BsDownload className="btn-icon" /> Download Excel
                            </>
                        )}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;