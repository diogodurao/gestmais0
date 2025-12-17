export function getFloorLabel(floor: string): string {
    if (floor === "0") return "R/C"
    if (floor === "-1") return "Cave"
    return `${floor}º`
}

export function getApartmentDisplayName(apt: { floor: string; identifier: string }) {
    return `${getFloorLabel(apt.floor)} ${apt.identifier}`
}

