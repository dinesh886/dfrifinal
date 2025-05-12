"use client";

import { useState, useMemo, useEffect } from "react";
import {
    FaEye, FaEdit, FaTrash, FaFileCsv,
    FaSearch, FaDownload, FaPlus, FaFileUpload,
    FaFileDownload, FaFilter, FaTimes, FaFileExcel
} from "react-icons/fa";
import { Download, Upload, FilePlus, FileText,MousePointerClick   } from "lucide-react";
import { Hand } from 'lucide-react'; // Use the "Hand" icon

import { CiFilter } from "react-icons/ci";
import { BsDownload } from "react-icons/bs";
import { IoFilterOutline } from "react-icons/io5";
import { GoSortAsc } from "react-icons/go";
import { GoSortDesc } from "react-icons/go";
import { DatePicker } from "antd";
import * as XLSX from "xlsx";
import ExportModal from "./ExportModal";
import { toast } from 'react-toastify';

import "./DataTable.css";
import FileUploadConfirmationModal from "./FileUploadConfirmationModal";

const DataTable = ({
    data = [],
    columns = [],
    // Button visibility controls
    showSearch = true,
    showAddNew = true,
    showDownloadSample = true,
    showUploadExcel = true,
    showExport = true,
    showDirectExport = true,
    // Action handlers
    onAddNew,
    onDownloadSample,
    onUploadExcel,
    // Other props
    searchPlaceholder = "Search...",
    exportFileName = "data_export",
    rowsPerPageOptions = [10, 25, 50],
    defaultRowsPerPage = 10
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
    const [loadingStates, setLoadingStates] = useState({
        addNew: false,
        downloadSample: false,
        uploadExcel: false,
        export: false,
        directExport: false
    });
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState("csv");
    const [dateRange, setDateRange] = useState([null, null]);
    const [gender, setGender] = useState("all");
    const [ageRange, setAgeRange] = useState({ min: "", max: "" });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [showUploadConfirmModal, setShowUploadConfirmModal] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success'
    });
    const [uploadedData, setUploadedData] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedData = localStorage.getItem(`${exportFileName}_uploadedData`);
            return savedData ? JSON.parse(savedData) : [];
        }
        return [];
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(`${exportFileName}_uploadedData`, JSON.stringify(uploadedData));
        }
    }, [uploadedData, exportFileName]);



    // Clear all data (both uploaded and original)
    const clearAllData = () => {
        setUploadedData([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(`${exportFileName}_uploadedData`);
        }
        toast.success("All data has been cleared");
    };


    
    // Add serial numbers to data
    const combinedData = useMemo(() => {
        const combined = [...data, ...uploadedData];
        return combined.map((item, index) => ({
            ...item,
            'S.No': index + 1 // Auto-generate serial numbers
        }));
    }, [data, uploadedData]);

    const filteredData = useMemo(() => {
        let result = [...combinedData];

        if (searchTerm) {
            result = result.filter((row) => {
                return columns.some((col) => {
                    if (col.searchable === false) return false;
                    const value = row[col.key];
                    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
                });
            });
        }

        if (sortConfig.key) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [combinedData, columns, searchTerm, sortConfig]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const currentData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // Check if table is completely empty (no data at all)
    const isTableEmpty = combinedData.length === 0;

    const requestSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'asc'
            ? 'desc'
            : 'asc';
        setSortConfig({ key, direction });
    };

    const handleAction = async (actionName, actionFn) => {
        setLoadingStates(prev => ({ ...prev, [actionName]: true }));
        try {
            await actionFn?.();
        } finally {
            setLoadingStates(prev => ({ ...prev, [actionName]: false }));
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoadingStates(prev => ({ ...prev, uploadExcel: true }));

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    raw: false,
                    dateNF: 'dd-mm-yyyy'
                });

                // Get all existing serial numbers
                const existingSerials = uploadedData.map(item =>
                    parseInt(item.sNo || item.serialNo || item['S.No'] || 0)
                ).filter(serial => !isNaN(serial));

                // Find the highest serial number
                const maxSerial = existingSerials.length > 0 ? Math.max(...existingSerials) : 0;

                // Start counting from next available number
                let currentSerial = maxSerial + 1;

                const transformedData = jsonData.map((row, index) => {
                    const transformedRow = {};
                    columns.forEach(col => {
                        const excelKey = Object.keys(row).find(
                            key => key.toLowerCase() === col.header?.toLowerCase() ||
                                key.toLowerCase() === col.key?.toLowerCase()
                        );
                        transformedRow[col.key] = excelKey ? row[excelKey] : '';
                    });

                    // Assign new sequential serial number
                    transformedRow.sNo = currentSerial++;

                    return {
                        ...transformedRow,
                        id: `uploaded-${Date.now()}-${index}`
                    };
                });

                setPreviewData(transformedData);
                setSelectedFile(file);
                setShowUploadConfirmModal(true);
            } catch (error) {
                console.error("Error processing Excel file:", error);
                toast.error("Error processing Excel file. Please check the format.");
            } finally {
                setLoadingStates(prev => ({ ...prev, uploadExcel: false }));
                event.target.value = ''; // reset input
            }
        };
        reader.readAsArrayBuffer(file);
    };
    const handleConfirmUpload = () => {
        setUploadedData(prev => [...prev, ...previewData]); // update table with preview data
        toast.success(`${previewData.length} records uploaded successfully!`);
        clearUploadState();
    };

    const handleCancelUpload = () => {
        clearUploadState();
    };

    const clearUploadState = () => {
        setPreviewData([]);
        setSelectedFile(null);
        setShowUploadConfirmModal(false);
    };


    const clearUploadedData = () => {
        setUploadedData([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(`${exportFileName}_uploadedData`);
        }
    };

    const handleExport = (filters) => {
        handleAction('export', () => {
            let filteredExportData = [...combinedData];

            if (filters.gender !== "all" && combinedData.some(item => item.gender)) {
                filteredExportData = filteredExportData.filter(row =>
                    row.gender === filters.gender
                );
            }

            if (combinedData.some(item => item.age)) {
                if (filters.ageRange.min || filters.ageRange.max) {
                    filteredExportData = filteredExportData.filter(row => {
                        const age = row.age || 0;
                        return (
                            (!filters.ageRange.min || age >= parseInt(filters.ageRange.min)) &&
                            (!filters.ageRange.max || age <= parseInt(filters.ageRange.max))
                        );
                    });
                }
            }

            if (combinedData.some(item => item.date)) {
                if (filters.dateRange[0] && filters.dateRange[1]) {
                    filteredExportData = filteredExportData.filter(row => {
                        const rowDate = new Date(row.date);
                        return rowDate >= filters.dateRange[0] && rowDate <= filters.dateRange[1];
                    });
                }
            }

            const headers = columns.map(col => col.header);
            const keys = columns.map(col => col.key);

            if (filters.format === "csv") {
                const csvContent = [
                    headers.join(","),
                    ...filteredExportData.map(row =>
                        keys.map(key => `"${row[key] || ''}"`).join(","))
                ].join("\n");

                const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `${exportFileName}_${new Date().toISOString().slice(0, 10)}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                const worksheetData = [
                    headers,
                    ...filteredExportData.map(row => keys.map(key => row[key] || ''))
                ];

                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.aoa_to_sheet(worksheetData);
                XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
                XLSX.writeFile(wb, `${exportFileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
            }

            setShowExportModal(false);
        });
    };

    const renderCellContent = (row, column) => {
        if (column.actions) {
            return (
                <div className="action-buttons">
                    {column.actions.map((action, index) => (
                        <button
                            key={index}
                            className={`action-btn ${action.name}-btn`}
                            onClick={() => action.handler(row)}
                            title={action.title}
                            disabled={loadingStates[action.name]}
                        >
                            {loadingStates[action.name] ? (
                                <div className="spinner-small" />
                            ) : (
                                action.icon
                            )}
                        </button>
                    ))}
                </div>
            );
        }

        if (column.render) {
            return column.render(row[column.key], row);
        }

        return row[column.key];
    };

    const handleDownloadSample = () => {
        setLoadingStates(prev => ({ ...prev, downloadSample: true }));

        try {
            // Define all fields from your form structure
            const allFields = [
                // Basic info
                'sNo',
                'patientId',
                'patientName',
                'appointmentDate',
                'submissionDate',
                'status',
                'lastVisit',
                'followUpStatus',
                'followUpDate',

                // Section 1 - Patient Information
                'section1_name',
                'section1_address',
                'section1_locality',
                'section1_age',
                'section1_gender',
                'section1_facilityName',
                'section1_facilityLocation',
                'section1_facilityType',
                'section1_education',
                'section1_occupation',
                'section1_maritalStatus',
                'section1_monthlyIncome',
                'section1_familyMembers',
                'section1_dependents',
                'section1_diabetesType',
                'section1_diabetesDuration',
                'section1_hasUlcer',
                'section1_ulcerDuration',
                'section1_hasAmputation',
                'section1_amputationDuration',
                'section1_hasAngioplasty',
                'section1_angioplastyDuration',

                // Section 2 - Medical Assessment
                'section2_firstAssessment',
                'section2_attendedBefore',
                'section2_facilityVisited',
                'section2_intervalToAssessment',
                'section2_referredBy',
                'section2_treatedDays',
                'section2_referredInDays',
                'section2_visitedInDays',
                'section2_necrosis',
                'section2_gangrene',
                'section2_gangreneType',
                'section2_boneExposure',
                'section2_osteomyelitis',
                'section2_sepsis',
                'section2_arterialIssues',
                'section2_infection',
                'section2_swelling',
                'section2_erythema',
                'section2_tenderness',
                'section2_warmth',
                'section2_discharge',
                'section2_cultureReport',
                'section2_woundSize',
                'section2_woundLocation',
                'section2_woundDuration',
                'section2_woundClassification',
                'section2_socGiven',
                'section2_socDetails',
                'section2_dressingMaterial',
                'section2_offloadingDevice',
                'section2_hospitalization',
                'section2_amputation',
                'section2_amputationType',
                'section2_amputationLevel',
                'section2_debridementWithAmputation',
                'section2_survivalStatus',
                'section2_deathDate',
                'section2_deathReason',

                // Section 3 - Additional Symptoms
                'section3_burningSensation',
                'section3_painWhileWalking',
                'section3_skinChanges',
                'section3_sensationLoss',
                'section3_nailProblems',
                'section3_fungalInfection',
                'section3_skinLesions',
                'section3_openWound',
                'section3_cellulitis',
                'section3_monofilamentLeftA',
                'section3_monofilamentLeftB',
                'section3_monofilamentLeftC',
                'section3_monofilamentRightA',
                'section3_monofilamentRightB',
                'section3_monofilamentRightC',
                'section3_footDeformities',
                'section3_deformityDuration',
                'section3_hairGrowth',
                'section3_pulsesPalpable',
                'section3_skinTemperature'
            ];

            // Create headers row with friendly names
            const headers = allFields.reduce((acc, field) => {
                // Convert field names to friendly headers
                let friendlyName = field
                    .replace('section1_', 'Patient ')
                    .replace('section2_', 'Medical ')
                    .replace('section3_', 'Symptoms ')
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .trim();

                // Special cases
                if (field === 'sNo') friendlyName = 'S.No';
                if (field === 'patientId') friendlyName = 'Patient ID';

                acc[field] = friendlyName;
                return acc;
            }, {});

            // Create example data row
            const exampleRow = allFields.reduce((acc, field) => {
                let exampleValue = '';

                // Set appropriate example values based on field type
                if (field.includes('Date')) {
                    exampleValue = '2023-01-15';
                }
                else if (field.includes('age') || field.includes('Duration') || field.includes('Days')) {
                    exampleValue = '5';
                }
                else if (field.includes('Income') || field.includes('Members')) {
                    exampleValue = '2';
                }
                else if (field === 'status') {
                    exampleValue = 'Completed';
                }
                else if (field === 'followUpStatus') {
                    exampleValue = 'Pending';
                }
                else if (field.includes('has') || field.includes('Given')) {
                    exampleValue = 'Yes/No';
                }
                else if (field.includes('Type') || field.includes('Classification')) {
                    exampleValue = 'Type A';
                }
                else if (field.includes('Location') || field.includes('Level')) {
                    exampleValue = 'Left foot';
                }
                else if (field.includes('Material') || field.includes('Device')) {
                    exampleValue = 'Standard dressing';
                }
                else {
                    exampleValue = `Example ${field.replace(/section[123]_/, '')}`;
                }

                acc[field] = exampleValue;
                return acc;
            }, {});

            // Create worksheet with both rows
            const ws = XLSX.utils.json_to_sheet([headers, exampleRow], { skipHeader: true });

            // Style headers (make them bold)
            if (ws['!ref']) {
                const range = XLSX.utils.decode_range(ws['!ref']);
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
                    if (ws[headerCell]) {
                        ws[headerCell].s = { font: { bold: true } };
                    }
                }
            }

            // Set column widths based on content
            ws['!cols'] = allFields.map(field => ({
                wch: Math.max(
                    15, // minimum width
                    Math.min(
                        30, // maximum width
                        field.length, // field name length
                        headers[field]?.length || 0, // header length
                        exampleRow[field]?.length || 0 // example value length
                    )
                )
            }));

            // Create workbook and download
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sample Data");
            XLSX.writeFile(wb, `${exportFileName}_complete_sample.xlsx`);

            toast.success("Complete sample file downloaded successfully!");
        } catch (error) {
            console.error("Error generating sample file:", error);
            toast.error("Failed to download sample file");
        } finally {
            setLoadingStates(prev => ({ ...prev, downloadSample: false }));
        }
    };
    const handleDirectExport = async () => {
        setLoadingStates(prev => ({ ...prev, directExport: true }));

        try {
            const headers = columns.map(col => col.header || col.key);
            const keys = columns.map(col => col.key);

            const worksheetData = [
                headers,
                ...filteredData.map(row =>
                    keys.map(key => {
                        if (key === 'status') return row[key];
                        if (key === 'image') return row[key] ? 'Image Available' : 'No Image';

                        const columnDef = columns.find(col => col.key === key);
                        if (columnDef?.render) {
                            if (columnDef.actions) return '';
                            const renderedValue = columnDef.render(row[key], row);
                            if (React.isValidElement(renderedValue)) {
                                if (key === 'status') return row[key];
                                return '';
                            }
                            return renderedValue;
                        }
                        return row[key] || '';
                    })
                )
            ];

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(worksheetData);

            const colWidths = headers.map((header, index) => {
                const maxContentLength = Math.max(
                    header.length,
                    ...filteredData.map(row => {
                        const value = worksheetData[filteredData.indexOf(row) + 1][index];
                        return String(value).length;
                    })
                );
                return { wch: Math.min(Math.max(maxContentLength, 10), 50) };
            });
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, "Doctors");
            XLSX.writeFile(
                wb,
                `${exportFileName}_${new Date().toISOString().slice(0, 10)}.xlsx`
            );

            toast.success("Doctors data exported successfully!");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to export doctors data");
        } finally {
            setLoadingStates(prev => ({ ...prev, directExport: false }));
        }
    };

    return (
        <div className="data-table-container">
            {/* Table Controls */}
            <div className="table-controls">
                <div className="controls-group">
                    {showSearch && (
                        <div className="search-container">  
                            <div className="search-input-container">
                                <FaSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder=" "
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                    id="search-input"
                                />
                                <label htmlFor="search-input" className="floating-label">
                                    {searchPlaceholder}
                                </label>
                                {searchTerm && (
                                    <button
                                        className="clear-search-btn"
                                        onClick={() => setSearchTerm("")}
                                        aria-label="Clear search"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="action-buttons-container">
                    {/* {!isTableEmpty && (
                        <button className="action-btn danger" onClick={clearAllData}>
                            Clear All Data
                        </button>
                    )} */}
                    {showAddNew && (
                        <a
                            className="Add-new action-btn"
                            onClick={onAddNew} // Directly use the onAddNew handler
                            disabled={loadingStates.addNew}
                            id="add-data-button"
                        >
                            {loadingStates.addNew ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    <FilePlus className="btn-icon" />
                                    <span className="btn-text">Add Data</span>
                                    {/* Show the bouncing hand only if table is empty */}
                                    {isTableEmpty && (
                                        <MousePointerClick className="mouse-click" size={20} />
                                    )}
                                </>
                            )}
                        </a>
                    )}


                    {showDownloadSample && (
                        <a
                            className="sample-excel-download action-btn"
                            onClick={() => handleAction('downloadSample', handleDownloadSample)}
                            disabled={loadingStates.downloadSample}
                        >
                            {loadingStates.downloadSample ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    <Download className="btn-icon" />
                                    <span className="btn-text">Download Sample</span>
                                </>
                            )}
                        </a>
                    )}

                    {showUploadExcel && (
                        <div className="excel-upload-wrapper">
                            <input
                                type="file"
                                id="excel-upload-input"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                            <label
                                htmlFor="excel-upload-input"
                                className={`excel-upload action-btn ${loadingStates.uploadExcel ? 'loading' : ''}`}
                            >
                                {loadingStates.uploadExcel ? (
                                    <div className="spinner" />
                                ) : (
                                    <>
                                        <FileText className="btn-icon" />
                                        <span className="btn-text">Excel Upload</span>
                                    </>
                                )}
                            </label>
                        </div>
                    )}

                    {showExport && (
                        <a
                            className="download-excel action-btn"
                            onClick={() => setShowExportModal(true)}
                        >
                            <Download className="btn-icon" />
                            <span className="btn-text">Excel Download</span>
                        </a>
                    )}

                    {showDirectExport && (
                        <a
                            className="excel-upload action-btn"
                            onClick={handleDirectExport}
                            disabled={loadingStates.directExport}
                        >
                            {loadingStates.directExport ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    <FaFileExcel className="btn-icon" />
                                    <span className="btn-text">Download Doctor List</span>
                                </>
                            )}
                        </a>
                    )}
                </div>
            </div>

            {/* Empty State */}
            {isTableEmpty ? (
                <div className="empty-state-container">
                    <div className="empty-state-content">
                        <div className="empty-state-icon">
                            <FilePlus size={48} />
                        </div>
                        <h3>No Data Available</h3>
                        <p>Click the button above [Add Data] to add your first data entry</p>
                        <button
                            className="empty-state-button"
                            onClick={() => handleAction('addNew', onAddNew)}
                            disabled={loadingStates.addNew}
                        >
                            {/* {loadingStates.addNew ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    <FilePlus className="btn-icon" />
                                    <span>Add Data</span>
                                </>
                            )} */}
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    {columns.map((column) => (
                                        <th
                                            key={column.key}
                                            onClick={() => column.sortable !== false && requestSort(column.key)}
                                            className={column.sortable !== false ? 'sortable' : ''}
                                            aria-sort={
                                                sortConfig.key === column.key
                                                    ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                                                    : 'none'
                                            }
                                        >
                                            <div className="th-content">
                                                {column.header}
                                                {sortConfig.key === column.key && (
                                                    sortConfig.direction === 'asc' ?
                                                        <GoSortAsc className="sort-icon asc" /> :
                                                        <GoSortDesc className="sort-icon desc" />
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.length > 0 ? (
                                    currentData.map((row, rowIndex) => (
                                        <tr key={row.id || rowIndex}>
                                            {columns.map((column) => (
                                                <td key={`${row.id || rowIndex}-${column.key}`}>
                                                    {renderCellContent(row, column)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="no-data-row">
                                        <td colSpan={columns.length}>
                                            <div className="no-data-message">
                                                No matching records found
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredData.length > rowsPerPage && (
                        <div className="pagination-container">
                            <div className="pagination-info">
                                Showing {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length}
                            </div>

                            <div className="pagination-controls">
                                <button
                                    className="pagination-nav"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    aria-label="Previous page"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                <div className="page-numbers">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let page;
                                        if (totalPages <= 5) {
                                            page = i + 1;
                                        } else if (currentPage <= 3) {
                                            page = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            page = totalPages - 4 + i;
                                        } else {
                                            page = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`page-number ${currentPage === page ? 'active' : ''}`}
                                                aria-label={`Page ${page}`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}

                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                        <span className="page-ellipsis">...</span>
                                    )}

                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                        <button
                                            onClick={() => setCurrentPage(totalPages)}
                                            className="page-number"
                                            aria-label={`Page ${totalPages}`}
                                        >
                                            {totalPages}
                                        </button>
                                    )}
                                </div>

                                <button
                                    className="pagination-nav"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    aria-label="Next page"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Export Modal */}
            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onExport={handleExport}
                isLoading={loadingStates.export}
                exportFileName={exportFileName}
                columns={columns}
                data={combinedData}
            />
            <FileUploadConfirmationModal
                visible={showUploadConfirmModal}
                fileName={selectedFile?.name}
                previewData={previewData}
                onCancel={handleCancelUpload}
                onConfirm={handleConfirmUpload}
                isLoading={loadingStates.uploadExcel}
            />

        </div>
    );
};

export default DataTable;