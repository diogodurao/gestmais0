import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ApartmentManager } from '@/features/dashboard/ApartmentManager'
import * as buildingActions from '@/app/actions/building'

// Mock the server actions
vi.mock('@/app/actions/building', () => ({
    bulkCreateApartments: vi.fn(),
    updateApartment: vi.fn(),
    deleteApartment: vi.fn(),
}))

// Mock useRouter
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
        push: vi.fn(),
    }),
}))

describe('ApartmentManager Component', () => {
    const mockApartments = [
        {
            apartment: {
                id: 1,
                unit: '1A',
                floor: 1,
                permillage: 50,
                residentId: null,
            },
            resident: null,
        },
        {
            apartment: {
                id: 2,
                unit: '1B',
                floor: 1,
                permillage: 50,
                residentId: 'res-1',
            },
            resident: {
                id: 'res-1',
                name: 'John Doe',
                email: 'john@example.com',
            },
        },
    ]

    it('renders the list of apartments', () => {
        render(<ApartmentManager apartments={mockApartments} buildingId="b-1" />)

        expect(screen.getByText('1A')).toBeDefined()
        expect(screen.getByText('1B')).toBeDefined()
        expect(screen.getAllByText('Floor 1').length).toBeGreaterThan(0)

        // Use text match because it might be inside other elements or have whitespace
        expect(screen.getByText((content) => content.includes('John Doe'))).toBeDefined()
    })

    it('opens bulk add form when button is clicked', () => {
        render(<ApartmentManager apartments={mockApartments} buildingId="b-1" />)

        const bulkAddBtn = screen.getByText('Bulk Add')
        fireEvent.click(bulkAddBtn)

        expect(screen.getByText('Units (comma or line separated)')).toBeDefined()
    })

    it('calls bulkCreateApartments when form is submitted', async () => {
        render(<ApartmentManager apartments={mockApartments} buildingId="b-1" />)

        fireEvent.click(screen.getByText('Bulk Add'))

        const textarea = screen.getByPlaceholderText(/Loja A/i)
        fireEvent.change(textarea, { target: { value: '2A, 2B' } })

        fireEvent.click(screen.getByText('Add Units'))

        await waitFor(() => {
            expect(buildingActions.bulkCreateApartments).toHaveBeenCalledWith('b-1', '2A, 2B')
        })
    })

    it('opens edit form when pencil is clicked', () => {
        const { container } = render(<ApartmentManager apartments={mockApartments} buildingId="b-1" />)

        const pencilIcon = container.querySelector('.lucide-pencil')
        const editButton = pencilIcon?.closest('button')

        expect(editButton).toBeDefined()
        if (editButton) {
            fireEvent.click(editButton)

            // Check for inputs by value since label association might be tricky with custom components
            expect(screen.getByDisplayValue('1A')).toBeDefined()
            expect(screen.getByDisplayValue('1')).toBeDefined()
            expect(screen.getByDisplayValue('50')).toBeDefined()
        }
    })
})
