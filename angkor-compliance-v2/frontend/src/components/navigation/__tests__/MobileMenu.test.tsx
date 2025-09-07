import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MobileMenu } from '../MobileMenu';
import { User } from '../../../types';

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Home: () => <div data-testid="home-icon">Home</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon">AlertTriangle</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
  FileText: () => <div data-testid="file-text-icon">FileText</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  BarChart3: () => <div data-testid="bar-chart-3-icon">BarChart3</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  X: () => <div data-testid="x-icon">X</div>,
}));

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'factory_admin',
  factoryId: 'factory-1',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'Home', current: true, roles: ['factory_admin'] },
  { name: 'Audits', href: '/audits', icon: 'Shield', current: false, roles: ['factory_admin'] },
  { name: 'Grievances', href: '/grievances', icon: 'AlertTriangle', current: false, roles: ['factory_admin'] },
  { name: 'Training', href: '/training', icon: 'CheckCircle', current: false, roles: ['factory_admin'] },
  { name: 'Documents', href: '/documents', icon: 'FileText', current: false, roles: ['factory_admin'] },
  { name: 'Users', href: '/users', icon: 'Users', current: false, roles: ['factory_admin'] },
  { name: 'Analytics', href: '/analytics', icon: 'BarChart3', current: false, roles: ['factory_admin'] },
  { name: 'Calendar', href: '/calendar', icon: 'Calendar', current: false, roles: ['factory_admin'] },
  { name: 'Settings', href: '/settings', icon: 'Settings', current: false, roles: ['factory_admin'] },
];

const renderMobileMenu = (props = {}) => {
  const defaultProps = {
    sidebarOpen: false,
    setSidebarOpen: vi.fn(),
    navigation: mockNavigation,
    user: mockUser,
    ...props,
  };

  return render(
    <BrowserRouter>
      <MobileMenu {...defaultProps} />
    </BrowserRouter>
  );
};

describe('MobileMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders mobile menu when sidebar is open', () => {
    renderMobileMenu({ sidebarOpen: true });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Audits')).toBeInTheDocument();
    expect(screen.getByText('Grievances')).toBeInTheDocument();
    expect(screen.getByText('Training')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('does not render mobile menu when sidebar is closed', () => {
    renderMobileMenu({ sidebarOpen: false });

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Audits')).not.toBeInTheDocument();
  });

  it('renders close button when sidebar is open', () => {
    renderMobileMenu({ sidebarOpen: true });

    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
  });

  it('calls setSidebarOpen when close button is clicked', () => {
    const setSidebarOpen = vi.fn();
    renderMobileMenu({ sidebarOpen: true, setSidebarOpen });

    const closeButton = screen.getByTestId('x-icon');
    fireEvent.click(closeButton);

    expect(setSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('renders user information when sidebar is open', () => {
    renderMobileMenu({ sidebarOpen: true });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Factory Admin')).toBeInTheDocument();
  });

  it('renders navigation items with correct icons', () => {
    renderMobileMenu({ sidebarOpen: true });

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
    expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart-3-icon')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
  });

  it('highlights current navigation item', () => {
    renderMobileMenu({ sidebarOpen: true });

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-amber-50', 'border-amber-500', 'text-amber-700');
  });

  it('does not highlight non-current navigation items', () => {
    renderMobileMenu({ sidebarOpen: true });

    const auditsLink = screen.getByText('Audits').closest('a');
    expect(auditsLink).toHaveClass('border-transparent', 'text-gray-600', 'hover:bg-gray-50', 'hover:text-gray-900');
  });

  it('renders navigation links with correct href attributes', () => {
    renderMobileMenu({ sidebarOpen: true });

    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('Audits').closest('a')).toHaveAttribute('href', '/audits');
    expect(screen.getByText('Grievances').closest('a')).toHaveAttribute('href', '/grievances');
    expect(screen.getByText('Training').closest('a')).toHaveAttribute('href', '/training');
    expect(screen.getByText('Documents').closest('a')).toHaveAttribute('href', '/documents');
    expect(screen.getByText('Users').closest('a')).toHaveAttribute('href', '/users');
    expect(screen.getByText('Analytics').closest('a')).toHaveAttribute('href', '/analytics');
    expect(screen.getByText('Calendar').closest('a')).toHaveAttribute('href', '/calendar');
    expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/settings');
  });

  it('applies correct CSS classes for mobile menu overlay', () => {
    renderMobileMenu({ sidebarOpen: true });

    const overlay = screen.getByRole('dialog');
    expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50', 'lg:hidden');
  });

  it('applies correct CSS classes for mobile menu panel', () => {
    renderMobileMenu({ sidebarOpen: true });

    const panel = screen.getByRole('dialog').querySelector('div');
    expect(panel).toHaveClass('relative', 'flex', 'w-full', 'max-w-xs', 'flex-1', 'flex-col', 'bg-white');
  });

  it('handles empty navigation array', () => {
    renderMobileMenu({ sidebarOpen: true, navigation: [] });

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Audits')).not.toBeInTheDocument();
  });

  it('handles missing user gracefully', () => {
    renderMobileMenu({ sidebarOpen: true, user: null });

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
  });

  it('renders user avatar with initials', () => {
    renderMobileMenu({ sidebarOpen: true });

    const avatar = screen.getByText('JD');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('bg-amber-500', 'text-white');
  });

  it('handles user with missing name gracefully', () => {
    const userWithoutName = { ...mockUser, firstName: '', lastName: '' };
    renderMobileMenu({ sidebarOpen: true, user: userWithoutName });

    const avatar = screen.getByText('??');
    expect(avatar).toBeInTheDocument();
  });

  it('renders role badge with correct styling', () => {
    renderMobileMenu({ sidebarOpen: true });

    const roleBadge = screen.getByText('Factory Admin');
    expect(roleBadge).toHaveClass('bg-amber-100', 'text-amber-800');
  });

  it('handles different user roles', () => {
    const hrUser = { ...mockUser, role: 'hr_staff' };
    renderMobileMenu({ sidebarOpen: true, user: hrUser });

    expect(screen.getByText('HR Staff')).toBeInTheDocument();
  });

  it('applies correct CSS classes for mobile menu transitions', () => {
    renderMobileMenu({ sidebarOpen: true });

    const overlay = screen.getByRole('dialog');
    expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50', 'lg:hidden');
  });

  it('renders mobile menu with proper accessibility attributes', () => {
    renderMobileMenu({ sidebarOpen: true });

    const overlay = screen.getByRole('dialog');
    expect(overlay).toHaveAttribute('aria-modal', 'true');
  });

  it('handles navigation item clicks', () => {
    renderMobileMenu({ sidebarOpen: true });

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toBeInTheDocument();
    
    // Clicking should not throw any errors
    fireEvent.click(dashboardLink!);
  });

  it('renders mobile menu with correct responsive classes', () => {
    renderMobileMenu({ sidebarOpen: true });

    const overlay = screen.getByRole('dialog');
    expect(overlay).toHaveClass('lg:hidden');
  });

  it('handles user with partial name', () => {
    const userWithPartialName = { ...mockUser, firstName: 'John', lastName: '' };
    renderMobileMenu({ sidebarOpen: true, user: userWithPartialName });

    expect(screen.getByText('John')).toBeInTheDocument();
    const avatar = screen.getByText('J?');
    expect(avatar).toBeInTheDocument();
  });

  it('renders mobile menu with correct z-index', () => {
    renderMobileMenu({ sidebarOpen: true });

    const overlay = screen.getByRole('dialog');
    expect(overlay).toHaveClass('z-50');
  });

  it('handles mobile menu with different navigation items', () => {
    const limitedNavigation = [
      { name: 'Dashboard', href: '/dashboard', icon: 'Home', current: true, roles: ['factory_admin'] },
      { name: 'Settings', href: '/settings', icon: 'Settings', current: false, roles: ['factory_admin'] },
    ];

    renderMobileMenu({ sidebarOpen: true, navigation: limitedNavigation });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.queryByText('Audits')).not.toBeInTheDocument();
  });
});
