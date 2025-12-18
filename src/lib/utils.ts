import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getFloorLabel(floor: string): string {
    if (floor === "0") return "R/C"
    if (floor === "-1") return "Cave"
    return `${floor}º`
}

export function getApartmentDisplayName(apt: { floor: string; identifier: string; unitType?: string }) {
    const floorLabel = getFloorLabel(apt.floor)
    
    if (apt.unitType && apt.unitType !== 'apartment') {
        const displayType = apt.unitType.charAt(0).toUpperCase() + apt.unitType.slice(1)
        return `${displayType} ${apt.identifier}`
    }
    
    return `${floorLabel} ${apt.identifier}`
}

