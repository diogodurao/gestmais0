import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { CalendarView } from "../CalendarView"
import { describe, it, expect, vi, afterEach } from "vitest"
import { useCalendar } from "../hooks/useCalendar"

// Mock dependencies
vi.mock("../hooks/useCalendar", () => ({
    useCalendar: vi.fn()
}))

vi.mock("../components/CalendarHeader", () => ({
    CalendarHeader: ({ monthName, year, onNavigate, onAddEvent }: any) => (
        <div data-testid="calendar-header">
            <span>{monthName} {year}</span>
            <button onClick={() => onNavigate(-1)}>Prev</button>
            <button onClick={() => onNavigate(1)}>Next</button>
            <button onClick={onAddEvent}>Add Event</button>
        </div>
    )
}))

vi.mock("../components/CalendarDay", () => ({
    CalendarDay: ({ day, onDayClick }: any) => (
        <div data-testid="calendar-day" onClick={() => day && onDayClick(day)}>
            {day}
        </div>
    )
}))

vi.mock("../EventModal", () => ({
    EventModal: ({ isOpen, onClose }: any) => (
        isOpen ? <div data-testid="event-modal"><button onClick={onClose}>Close</button></div> : null
    )
}))

describe("CalendarView", () => {
    const mockNavigate = vi.fn()
    const mockRefresh = vi.fn()
    const defaultHookValues = {
        year: 2024,
        month: 1, // January
        navigate: mockNavigate,
        eventsByDate: new Map(),
        isPending: false,
        days: [null, null, 1, 2, 3, 4, 5],
        refresh: mockRefresh
    }

    afterEach(() => {
        cleanup()
        vi.clearAllMocks()
    })

    it("renders calendar correctly", () => {
        vi.mocked(useCalendar).mockReturnValue(defaultHookValues as any)

        render(
            <CalendarView
                buildingId="b1"
                initialEvents={[]}
                initialYear={2024}
                initialMonth={1}
            />
        )

        expect(screen.getByTestId("calendar-header")).toBeTruthy()
        expect(screen.getByText("Janeiro 2024")).toBeTruthy()
    })

    it("opens add event modal on header button click", () => {
        vi.mocked(useCalendar).mockReturnValue(defaultHookValues as any)

        render(
            <CalendarView
                buildingId="b1"
                initialEvents={[]}
                initialYear={2024}
                initialMonth={1}
            />
        )

        fireEvent.click(screen.getByText("Add Event"))
        expect(screen.getByTestId("event-modal")).toBeTruthy()
    })

    it("opens add event modal on day click", () => {
        vi.mocked(useCalendar).mockReturnValue(defaultHookValues as any)

        render(
            <CalendarView
                buildingId="b1"
                initialEvents={[]}
                initialYear={2024}
                initialMonth={1}
            />
        )

        fireEvent.click(screen.getByText("1"))
        expect(screen.getByTestId("event-modal")).toBeTruthy()
    })

    it("does not open modal on day click if readonly", () => {
        vi.mocked(useCalendar).mockReturnValue(defaultHookValues as any)

        render(
            <CalendarView
                buildingId="b1"
                initialEvents={[]}
                initialYear={2024}
                initialMonth={1}
                readOnly
            />
        )

        fireEvent.click(screen.getByText("1"))
        expect(screen.queryByTestId("event-modal")).toBeNull()
    })
})
