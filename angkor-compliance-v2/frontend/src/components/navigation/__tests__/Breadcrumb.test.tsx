import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Breadcrumb } from '../Breadcrumb';

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
  Home: () => <div data-testid="home-icon">Home</div>,
}));

const mockBreadcrumbItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Audits', href: '/audits' },
  { label: 'Current Audit', href: '/audits/123' },
];

const renderBreadcrumb = (items = mockBreadcrumbItems) => {
  return render(
    <BrowserRouter>
      <Breadcrumb items={items} />
    </BrowserRouter>
  );
};

describe('Breadcrumb', () => {
  it('renders breadcrumb navigation', () => {
    renderBreadcrumb();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Audits')).toBeInTheDocument();
    expect(screen.getByText('Current Audit')).toBeInTheDocument();
  });

  it('renders home icon for first item', () => {
    renderBreadcrumb();

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  it('renders chevron right icons between items', () => {
    renderBreadcrumb();

    const chevronIcons = screen.getAllByTestId('chevron-right-icon');
    expect(chevronIcons).toHaveLength(2); // One between each pair of items
  });

  it('renders breadcrumb links with correct href attributes', () => {
    renderBreadcrumb();

    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('Audits').closest('a')).toHaveAttribute('href', '/audits');
    expect(screen.getByText('Current Audit').closest('a')).toHaveAttribute('href', '/audits/123');
  });

  it('applies correct CSS classes to breadcrumb container', () => {
    renderBreadcrumb();

    const breadcrumb = screen.getByRole('navigation');
    expect(breadcrumb).toHaveClass('flex', 'items-center', 'space-x-2', 'text-sm', 'text-gray-500');
  });

  it('applies correct CSS classes to breadcrumb links', () => {
    renderBreadcrumb();

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('hover:text-gray-700', 'transition-colors', 'duration-200');
  });

  it('applies correct CSS classes to chevron icons', () => {
    renderBreadcrumb();

    const chevronIcons = screen.getAllByTestId('chevron-right-icon');
    chevronIcons.forEach(icon => {
      expect(icon).toHaveClass('h-4', 'w-4', 'text-gray-400');
    });
  });

  it('handles empty breadcrumb items array', () => {
    renderBreadcrumb([]);

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Audits')).not.toBeInTheDocument();
    expect(screen.queryByText('Current Audit')).not.toBeInTheDocument();
  });

  it('handles single breadcrumb item', () => {
    const singleItem = [{ label: 'Dashboard', href: '/dashboard' }];
    renderBreadcrumb(singleItem);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('chevron-right-icon')).not.toBeInTheDocument();
  });

  it('renders home icon only for first item', () => {
    renderBreadcrumb();

    const homeIcons = screen.getAllByTestId('home-icon');
    expect(homeIcons).toHaveLength(1);
  });

  it('handles breadcrumb items with special characters', () => {
    const specialItems = [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Audit & Compliance', href: '/audit-compliance' },
      { label: 'Report (2024)', href: '/report-2024' },
    ];

    renderBreadcrumb(specialItems);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Audit & Compliance')).toBeInTheDocument();
    expect(screen.getByText('Report (2024)')).toBeInTheDocument();
  });

  it('handles breadcrumb items with long labels', () => {
    const longLabelItems = [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Very Long Breadcrumb Item Name That Might Overflow', href: '/long-item' },
    ];

    renderBreadcrumb(longLabelItems);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Very Long Breadcrumb Item Name That Might Overflow')).toBeInTheDocument();
  });

  it('applies correct CSS classes for responsive design', () => {
    renderBreadcrumb();

    const breadcrumb = screen.getByRole('navigation');
    expect(breadcrumb).toHaveClass('flex', 'items-center', 'space-x-2');
  });

  it('renders breadcrumb with proper accessibility attributes', () => {
    renderBreadcrumb();

    const breadcrumb = screen.getByRole('navigation');
    expect(breadcrumb).toHaveAttribute('aria-label', 'Breadcrumb');
  });

  it('handles breadcrumb items with empty labels', () => {
    const emptyLabelItems = [
      { label: '', href: '/empty' },
      { label: 'Valid Item', href: '/valid' },
    ];

    renderBreadcrumb(emptyLabelItems);

    // Should not crash and should render valid items
    expect(screen.getByText('Valid Item')).toBeInTheDocument();
  });

  it('handles breadcrumb items with missing href', () => {
    const missingHrefItems = [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Current Page' }, // Missing href
    ];

    renderBreadcrumb(missingHrefItems);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('renders breadcrumb with correct order', () => {
    renderBreadcrumb();

    const breadcrumbItems = screen.getAllByRole('link');
    expect(breadcrumbItems[0]).toHaveTextContent('Dashboard');
    expect(breadcrumbItems[1]).toHaveTextContent('Audits');
    expect(breadcrumbItems[2]).toHaveTextContent('Current Audit');
  });

  it('applies correct CSS classes to home icon', () => {
    renderBreadcrumb();

    const homeIcon = screen.getByTestId('home-icon');
    expect(homeIcon).toHaveClass('h-4', 'w-4', 'text-gray-400');
  });

  it('handles breadcrumb items with numeric labels', () => {
    const numericItems = [
      { label: 'Dashboard', href: '/dashboard' },
      { label: '2024', href: '/2024' },
      { label: 'Q1', href: '/2024/q1' },
    ];

    renderBreadcrumb(numericItems);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('Q1')).toBeInTheDocument();
  });
});
