import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { ApartmentManager } from '../ApartmentManager'
import * as buildingActions from '@/app/actions/building'

// Mock dependencies
vi.mock('@/app/actions/building', () => ({
    createApartment: vi.fn(),
    updateApartment: vi.fn(),
    deleteApartment: vi.fn(() => Promise.resolve({ success: true })),
}))

vi.mock('@/app/actions/resident-management', () => ({
    unclaimApartmentAction: vi.fn(),
}))

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
    }),
}))

vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}))

describe('ApartmentManager Delete Confirmation', () => {
    const mockApartments = [
        {
            id: 1,
            unit: 'A',
            permillage: 100,
            resident: null,
        },
    ]

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        cleanup()
    })

    it('should open the confirm modal when delete button is clicked', () => {
        render(<ApartmentManager apartments={mockApartments as any} buildingId="b1" totalApartments={10} />)

        const deleteBtn = screen.getByTestId('delete-unit-button-1')
        fireEvent.click(deleteBtn)

        expect(screen.getByText('Apagar Fração')).toBeDefined()
    })

    it('should call deleteApartment when confirm is clicked', async () => {
        render(<ApartmentManager apartments={mockApartments as any} buildingId="b1" totalApartments={10} />)

        const deleteBtn = screen.getByTestId('delete-unit-button-1')
        fireEvent.click(deleteBtn)

        const confirmBtn = screen.getByText('Guardar')
        fireEvent.click(confirmBtn)

        expect(buildingActions.deleteApartment).toHaveBeenCalledWith(1)
    })
})
