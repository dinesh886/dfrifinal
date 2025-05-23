// utils/dateUtils.js

// Format date to DD-MM-YYYY
export const formatToDDMMYYYY = (dateString) => {
    if (!dateString) return "N/A";
    
    // Handle Excel date objects (serial numbers)
    if (typeof dateString === 'number' && dateString > 0) {
        const date = new Date((dateString - (25567 + 1)) * 86400 * 1000);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }
    
    // Handle Date objects
    if (dateString instanceof Date) {
        const day = String(dateString.getDate()).padStart(2, '0');
        const month = String(dateString.getMonth() + 1).padStart(2, '0');
        const year = dateString.getFullYear();
        return `${day}-${month}-${year}`;
    }

    // Handle string dates
    if (typeof dateString === 'string') {
        const isoDate = new Date(dateString);
        if (!isNaN(isoDate.getTime())) {
            const day = String(isoDate.getDate()).padStart(2, '0');
            const month = String(isoDate.getMonth() + 1).padStart(2, '0');
            const year = isoDate.getFullYear();
            return `${day}-${month}-${year}`;
        }

        const parts = dateString.split(/[-/ ]/);
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                const [year, month, day] = parts;
                return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
            } else if (parts[2].length === 4) {
                const [day, month, year] = parts;
                const monthNum = parseInt(month, 10);
                if (monthNum >= 1 && monthNum <= 12) {
                    return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
                } else {
                    return `${month.padStart(2, '0')}-${day.padStart(2, '0')}-${year}`;
                }
            }
        }
    }

    return String(dateString);
};

// Check if 6 months passed since a date
export const isSixMonthsPassed = (dateString) => {
    if (!dateString) return false;
    const lastVisit = new Date(dateString);
    const sixMonthsLater = new Date(lastVisit);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    return new Date() >= sixMonthsLater;
};

// Calculate follow-up date 6 months after given date datautils.js
export const calculateFollowUpDate = (dateString) => {
    if (!dateString) return null;
    const lastVisit = new Date(dateString);
    const followUpDate = new Date(lastVisit);
    followUpDate.setMonth(followUpDate.getMonth() + 6);
    return followUpDate.toISOString();
};

// utils/dateUtils.js
//24Hourstimelogic
export const is24HoursPassed = (dateString, currentTime = new Date()) => {
    if (!dateString) return true;
    const submissionDate = new Date(dateString);
    const diffMs = currentTime - submissionDate;
    return diffMs >= 24 * 60 * 60 * 1000;
};
// utils/dateUtils.js
export const calculateRemainingTime = (submissionDate, currentTime) => {
    const submittedAt = new Date(submissionDate).getTime();
    const now = currentTime ? new Date(currentTime).getTime() : Date.now();
  
    const diffMs = 24 * 60 * 60 * 1000 - (now - submittedAt); // 24 hours in ms
    if (diffMs <= 0) return "0h 00m 00s";
  
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
    return `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  };
  
