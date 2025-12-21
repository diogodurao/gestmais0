/**
 * Document Export Utilities
 * Handles PDF and Excel (CSV) exports for the dashboard
 */

/**
 * Basic PDF export using browser's print functionality
 */
export async function exportExtraPaymentsToPDF(
    title: string,
    buildingName: string,
    totalBudget: number,
    data: any[]
) {
    console.log(`Exporting PDF: ${title} for ${buildingName}`);
    
    // In a production environment, we would use libraries like jspdf and jspdf-autotable here.
    // For now, we trigger the browser's print dialog as a fallback.
    if (typeof window !== "undefined") {
        window.print();
    }
}

/**
 * Basic Excel export using CSV format
 */
export async function exportToExcel({
    filename,
    title,
    columns,
    data,
}: {
    filename: string;
    title: string;
    columns: Array<{ header: string; key: string; format?: "currency" }>;
    data: any[];
}) {
    console.log(`Exporting Excel (CSV): ${filename}`);

    if (typeof window === "undefined") return;

    // Generate CSV content
    const headers = columns.map(col => `"${col.header}"`).join(",");
    const rows = data.map(item => {
        return columns.map(col => {
            const value = item[col.key];
            
            if (value === null || value === undefined) return '""';
            
            if (col.format === "currency") {
                // Simplified currency formatting for CSV (value is in cents)
                return (value / 100).toFixed(2);
            }
            
            if (typeof value === "string") {
                return `"${value.replace(/"/g, '""')}"`;
            }
            
            return value;
        }).join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

