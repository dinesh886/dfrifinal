import * as XLSX from "xlsx";
import { apiGet } from "../services/api-helper";
import { toast } from "react-toastify";

export const handleExport = async (filters, exportFileName, setShowExportModal) => {
  try {
    // 1. Fetch all patients
    const response = await apiGet("/download");
    const allPatients = Array.isArray(response.patients) ? response.patients : [];

    console.log("All patients from API:", allPatients);

    if (allPatients.length === 0) {
      toast.warn("No patient data available to export.");
      return;
    }

    // 2. Filter patients on frontend
    let filteredData = [...allPatients];

    if (filters.gender && filters.gender !== "all") {
      filteredData = filteredData.filter(
        (p) => p.gender?.toLowerCase() === filters.gender.toLowerCase()
      );
    }

    if (filters.ageRange?.min || filters.ageRange?.max) {
      filteredData = filteredData.filter((p) => {
        const age = parseInt(p.age || "0", 10);
        return (
          (!filters.ageRange.min || age >= parseInt(filters.ageRange.min, 10)) &&
          (!filters.ageRange.max || age <= parseInt(filters.ageRange.max, 10))
        );
      });
    }

    // Strict date range filtering
    if (filters.dateRange?.[0] && filters.dateRange?.[1]) {
      const [startDate, endDate] = filters.dateRange;
      const start = new Date(startDate);
      const end = new Date(endDate);

      filteredData = filteredData.filter((p) => {
        const dateString = p.submission_date || p.created_at;
        if (!dateString) return false;

        const recordDate = new Date(dateString);
        if (isNaN(recordDate.getTime())) return false;

        return recordDate >= start && recordDate <= end;
      });

      // Sort by date (ascending - oldest first)
      filteredData.sort((a, b) => {
        const dateA = new Date(a.submission_date || a.created_at);
        const dateB = new Date(b.submission_date || b.created_at);
        return dateA - dateB;
      });
    }

    console.log("Filtered patients after applying filters:", filteredData);

    if (filteredData.length === 0) {
      toast.warn("No records match the selected filters.");
      return;
    }

    // 3. Dynamically get all unique keys from the filtered data
    const allFields = Array.from(
      new Set(filteredData.flatMap((patient) => Object.keys(patient)))
    );

    // 4. Prepare header row (column names)
    const headerRow = allFields;

    // 5. Prepare data rows with special handling for dates
    const dataRows = filteredData.map((patient) =>
      allFields.map((field) => {
        let value = patient[field];

        // Handle date fields
        if (field.toLowerCase().includes('date') && value) {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0]; // YYYY-MM-DD format
          }
          return "NaN";
        }

        // Original value handling
        if (value === null || value === undefined) return "NaN";
        if (typeof value === "object") return JSON.stringify(value);

        if (typeof value === 'string') {
          value = value.toLowerCase().trim();
        }

        if (
          value === false ||
          value === 0 ||
          value === 'false' ||
          value === '0' ||
          value === 'no' ||
          value === 'off' ||
          value === 'disabled'
        ) {
          return 'no';
        }

        if (
          value === true ||
          value === 1 ||
          value === 'true' ||
          value === '1' ||
          value === 'yes' ||
          value === 'on' ||
          value === 'enabled'
        ) {
          return 'yes';
        }

        return value;
      })
    );

    // 6. Combine header + data rows for worksheet
    const worksheetData = [headerRow, ...dataRows];

    // 7. Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // 8. Set column widths and date formatting
    ws["!cols"] = allFields.map((field) => {
      if (field.toLowerCase().includes('date')) {
        return {
          wch: 12,
          numFmt: 'dd-mm-yyyy' // Excel date format
         
        };
      }
      return {
        wch: Math.min(50, Math.max(10, field.length))
      };
    });

    // 9. Append worksheet and export file
    XLSX.utils.book_append_sheet(wb, ws, "Patients");
    XLSX.writeFile(
      wb,
      `${exportFileName}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );

    toast.success("Patient data exported successfully!");
    setShowExportModal(false);
  } catch (error) {
    console.error("Export failed:", error);
    toast.error("Export failed. Please try again.");
  }
};