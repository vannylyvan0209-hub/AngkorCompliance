import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
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
  Menu: () => <div data-testid="menu-icon">Menu</div>,
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

const renderSidebar = (props = {}) => {
  const defaultProps = {
    sidebarOpen: false,
    setSidebarOpen: vi.fn(),
    navigation: mockNavigation,
    user: mockUser,
    ...props,
  };

  return render(
    <BrowserRouter>
      <Sidebar {...defaultProps} />
    </BrowserRouter>
  );
};

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sidebar with navigation items', () => {
    renderSidebar();

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

  it('renders user information', () => {
    renderSidebar();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Factory Admin')).toBeInTheDocument();
  });

  it('shows close button when sidebar is open', () => {
    renderSidebar({ sidebarOpen: true });

    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
  });

  it('shows menu button when sidebar is closed', () => {
    renderSidebar({ sidebarOpen: false });

    expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
  });

  it('calls setSidebarOpen when close button is clicked', () => {
    const setSidebarOpen = vi.fn();
    renderSidebar({ sidebarOpen: true, setSidebarOpen });

    const closeButton = screen.getByTestId('x-icon');
    fireEvent.click(closeButton);

    expect(setSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('calls setSidebarOpen when menu button is clicked', () => {
    const setSidebarOpen = vi.fn();
    renderSidebar({ sidebarOpen: false, setSidebarOpen });

    const menuButton = screen.getByTestId('menu-icon');
    fireEvent.click(menuButton);

    expect(setSidebarOpen).toHaveBeenCalledWith(true);
  });

  it('renders navigation items with correct icons', () => {
    renderSidebar();

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
    renderSidebar();

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-amber-50', 'border-amber-500', 'text-amber-700');
  });

  it('does not highlight non-current navigation items', () => {
    renderSidebar();

    const auditsLink = screen.getByText('Audits').closest('a');
    expect(auditsLink).toHaveClass('border-transparent', 'text-gray-600', 'hover:bg-gray-50', 'hover:text-gray-900');
  });

  it('renders navigation links with correct href attributes', () => {
    renderSidebar();

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

  it('handles empty navigation array', () => {
    renderSidebar({ navigation: [] });

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Audits')).not.toBeInTheDocument();
  });

  it('handles missing user gracefully', () => {
    renderSidebar({ user: null });

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes for sidebar state', () => {
    const { rerender } = renderSidebar({ sidebarOpen: false });

    let sidebar = screen.getByRole('navigation');
    expect(sidebar).toHaveClass('-translate-x-full');

    rerender(
      <BrowserRouter>
        <Sidebar sidebarOpen={true} setSidebarOpen={vi.fn()} navigation={mockNavigation} user={mockUser} />
      </BrowserRouter>
    );

    sidebar = screen.getByRole('navigation');
    expect(sidebar).toHaveClass('translate-x-0');
  });

  it('renders user avatar with initials', () => {
    renderSidebar();

    const avatar = screen.getByText('JD');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('bg-amber-500', 'text-white');
  });

  it('handles user with missing name gracefully', () => {
    const userWithoutName = { ...mockUser, firstName: '', lastName: '' };
    renderSidebar({ user: userWithoutName });

    const avatar = screen.getByText('??');
    expect(avatar).toBeInTheDocument();
  });

  it('renders role badge with correct styling', () => {
    renderSidebar();

    const roleBadge = screen.getByText('Factory Admin');
    expect(roleBadge).toHaveClass('bg-amber-100', 'text-amber-800');
  });

  it('handles different user roles', () => {
    const hrUser = { ...mockUser, role: 'hr_staff' };
    renderSidebar({ user: hrUser });

    expect(screen.getByText('HR Staff')).toBeInTheDocument();
  });

  it('filters navigation items based on user role', () => {
    const limitedNavigation = [
      { name: 'Dashboard', href: '/dashboard', icon: 'Home', current: true, roles: ['factory_admin'] },
      { name: 'Training', href: '/training', icon: 'CheckCircle', current: false, roles: ['hr_staff'] },
    ];

    renderSidebar({ navigation: limitedNavigation });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Training')).not.toBeInTheDocument();
  });
});
