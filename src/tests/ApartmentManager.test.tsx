import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApartmentManager } from '../features/dashboard/ApartmentManager';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as buildingActions from '@/app/actions/building';
import { useRouter } from 'next/navigation';

// Mock the server actions
vi.mock('@/app/actions/building', () => ({
  bulkCreateApartments: vi.fn(),
  updateApartment: vi.fn(),
  deleteApartment: vi.fn(),
}));

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('ApartmentManager Component', () => {
  const mockApartments = [
    {
      apartment: {
        id: 1,
        unit: '1A',
        floor: 1,
        permillage: 10,
        residentId: null,
        buildingId: 'bld-123'
      },
      resident: null
    },
    {
        apartment: {
          id: 2,
          unit: '2A',
          floor: 2,
          permillage: 20,
          residentId: 'res-1',
          buildingId: 'bld-123'
        },
        resident: {
            id: 'res-1',
            name: 'John Doe',
            email: 'john@example.com'
        }
      }
  ];

  const mockRouter = {
      refresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it('renders apartment list correctly', () => {
    render(<ApartmentManager apartments={mockApartments} buildingId="bld-123" />);

    expect(screen.getByText('1A')).toBeInTheDocument();
    expect(screen.getByText('Floor 1', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('2A')).toBeInTheDocument();
    expect(screen.getByText('John Doe', { exact: false })).toBeInTheDocument();
  });

  it('handles bulk add apartments', async () => {
    render(<ApartmentManager apartments={mockApartments} buildingId="bld-123" />);

    // Click Bulk Add button
    fireEvent.click(screen.getByText('Bulk Add'));

    // Type in textarea
    const textarea = screen.getByPlaceholderText(/Loja A/);
    fireEvent.change(textarea, { target: { value: '3A\n3B' } });

    // Click Add Units
    fireEvent.click(screen.getByText('Add Units'));

    await waitFor(() => {
        expect(buildingActions.bulkCreateApartments).toHaveBeenCalledWith('bld-123', '3A\n3B');
    });
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it('handles edit apartment', async () => {
    render(<ApartmentManager apartments={mockApartments} buildingId="bld-123" />);

    // Click Edit button for first apartment (1A)
    // Note: Icons might not have accessible text, so we might need to rely on container or something else.
    // The code uses lucide-react icons inside buttons.
    const editButtons = screen.getAllByRole('button').filter(b => b.querySelector('svg.lucide-pencil'));
    fireEvent.click(editButtons[0]);

    // Change values
    const unitInput = screen.getByDisplayValue('1A');
    fireEvent.change(unitInput, { target: { value: '1A Updated' } });

    const floorInput = screen.getByDisplayValue('1');
    fireEvent.change(floorInput, { target: { value: '2' } });

    // Save
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
        expect(buildingActions.updateApartment).toHaveBeenCalledWith(1, {
            unit: '1A Updated',
            floor: 2,
            permillage: 10 // Existing value shouldn't change if we didn't touch it?
            // Wait, the component initializes state with existing values.
            // checking component code:
            // setEditForm({ unit: apt.unit, floor: apt.floor... })
            // So if I didn't change permillage input, it sends the original value (as parsed number)
        });
    });
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it('handles delete apartment', async () => {
      // Mock confirm
      window.confirm = vi.fn().mockReturnValue(true);

      render(<ApartmentManager apartments={mockApartments} buildingId="bld-123" />);

      const deleteButtons = screen.getAllByRole('button').filter(b => b.querySelector('svg.lucide-trash-2'));
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
          expect(buildingActions.deleteApartment).toHaveBeenCalledWith(1);
      });
      expect(mockRouter.refresh).toHaveBeenCalled();
  });
});
