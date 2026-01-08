"use client"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { formatCurrency } from "@/lib/format"
import type { ApartmentPaymentData } from "@/lib/types"

export function exportExtraPaymentsToPDF(
    projectName: string,
    buildingName: string,
    totalBudget: number,
    data: ApartmentPaymentData[]
) {
    const doc = new jsPDF({ orientation: "landscape" })

    // Title
    doc.setFontSize(18)
    doc.text("GestMais - Mapa de Quotas Extraordinárias", 14, 20)

    doc.setFontSize(14)
    doc.text(`Projeto: ${projectName}`, 14, 30)

    doc.setFontSize(10)
    doc.text(`Edifício: ${buildingName}`, 14, 36)
    doc.text(`Orçamento Total: ${formatCurrency(totalBudget)}`, 14, 42)

    // Calculate dynamic columns based on the max number of installments in data
    const maxInstallments = Math.max(...data.map(d => d.installments.length), 0)
    const installmentCols = Array.from({ length: maxInstallments }, (_, i) => ({
        header: `P${i + 1}`,
        dataKey: `inst_${i}`
    }))

    const columns = [
        { header: "Fração", dataKey: "unit" },
        { header: "Residente", dataKey: "resident" },
        { header: "Permilagem", dataKey: "permillage" },
        { header: "Quota Total", dataKey: "totalShare" },
        ...installmentCols,
        { header: "Pago", dataKey: "totalPaid" },
        { header: "Em Dívida", dataKey: "balance" },
        { header: "Estado", dataKey: "status" },
    ]

    // Prepare table data
    const tableData = data.map(apt => {
        const row: any = {
            unit: apt.unit,
            resident: apt.residentName || "-",
            permillage: `${apt.permillage} %`,
            totalShare: formatCurrency(apt.totalShare),
            totalPaid: formatCurrency(apt.totalPaid),
            balance: formatCurrency(apt.totalShare - apt.totalPaid),
            status: apt.status === "complete" ? "Completo" : apt.status === "partial" ? "Parcial" : "Pendente"
        }

        apt.installments.forEach((inst, i) => {
            row[`inst_${i}`] = inst.status === "paid" ? "Pago" : inst.status === "late" ? "Atraso" : ""
        })

        return row
    })

    // Calculate totals for footer
    const totalPermillage = data.reduce((sum, d) => sum + d.permillage, 0)
    const totalCollected = data.reduce((sum, d) => sum + d.totalPaid, 0)
    const totalDue = totalBudget - totalCollected

    const footerRow: any = {
        unit: "TOTAL",
        resident: `${data.length} Frações`,
        permillage: `${totalPermillage.toFixed(2)} %`,
        totalShare: formatCurrency(totalBudget),
        totalPaid: formatCurrency(totalCollected),
        balance: formatCurrency(totalDue),
        status: `${projectProgress(totalBudget, totalCollected)}%`
    }

    // Fill installment columns in footer (count paid)
    for (let i = 0; i < maxInstallments; i++) {
        const paidCount = data.filter(d => d.installments[i]?.status === "paid").length
        footerRow[`inst_${i}`] = `${paidCount}/${data.length}`
    }

    autoTable(doc, {
        startY: 50,
        head: [columns.map(c => c.header)],
        body: tableData.map(row => columns.map(c => row[c.dataKey])),
        foot: [columns.map(c => footerRow[c.dataKey])],
        headStyles: {
            fillColor: [241, 245, 249],
            textColor: [15, 23, 42],
            fontStyle: 'bold',
            halign: 'center'
        },
        footStyles: {
            fillColor: [241, 245, 249],
            textColor: [15, 23, 42],
            fontStyle: 'bold',
            halign: 'center'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
            halign: 'center',
            valign: 'middle',
            lineWidth: 0.1,
            lineColor: [226, 232, 240]
        },
        columnStyles: {
            resident: { halign: 'left', cellWidth: 40 }, // Give resident name more space and align left
            unit: { halign: 'center', cellWidth: 15 },
        },
        theme: 'grid',
        tableWidth: 'auto',
        margin: { top: 50 }
    })

    doc.save(`extra-${projectName.toLowerCase().replace(/\s+/g, "-")}.pdf`)
}

function projectProgress(total: number, collected: number) {
    if (total === 0) return 0
    return Math.round((collected / total) * 100)
}


/**
 * Basic Excel export using CSV format
 */
export async function exportToExcel<T extends Record<string, unknown>>({
    filename,
    title,
    columns,
    data,
}: {
    filename: string;
    title: string;
    columns: Array<{ header: string; key: keyof T & string; format?: "currency" }>;
    data: T[];
}) {

    /** generate csv content */
    const headers = columns.map(col => `"${col.header}"`).join(",");
    const rows = data.map(item => {
        return columns.map(col => {
            const value = item[col.key];

            if (value === null || value === undefined) return '""';

            if (col.format === "currency") {
                // Simplified currency formatting for CSV (value is in cents)
                const numValue = typeof value === 'number' ? value : Number(value);
                return (isNaN(numValue) ? "0.00" : (numValue / 100).toFixed(2));
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

