import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../Header';
import { User } from '../../../types';

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  Bell: () => <div data-testid="bell-icon">Bell</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  User: () => <div data-testid="user-icon">User</div>,
  LogOut: () => <div data-testid="log-out-icon">LogOut</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
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

const renderHeader = (props = {}) => {
  const defaultProps = {
    setSidebarOpen: vi.fn(),
    user: mockUser,
    ...props,
  };

  return render(<Header {...defaultProps} />);
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with menu button', () => {
    renderHeader();

    expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderHeader();

    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  it('renders notification bell icon', () => {
    renderHeader();

    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
  });

  it('renders user profile section', () => {
    renderHeader();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Factory Admin')).toBeInTheDocument();
  });

  it('calls setSidebarOpen when menu button is clicked', () => {
    const setSidebarOpen = vi.fn();
    renderHeader({ setSidebarOpen });

    const menuButton = screen.getByTestId('menu-icon');
    fireEvent.click(menuButton);

    expect(setSidebarOpen).toHaveBeenCalledWith(true);
  });

  it('handles search input changes', () => {
    renderHeader();

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    expect(searchInput).toHaveValue('test search');
  });

  it('renders user avatar with initials', () => {
    renderHeader();

    const avatar = screen.getByText('JD');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('bg-amber-500', 'text-white');
  });

  it('handles user with missing name gracefully', () => {
    const userWithoutName = { ...mockUser, firstName: '', lastName: '' };
    renderHeader({ user: userWithoutName });

    const avatar = screen.getByText('??');
    expect(avatar).toBeInTheDocument();
  });

  it('renders role badge with correct styling', () => {
    renderHeader();

    const roleBadge = screen.getByText('Factory Admin');
    expect(roleBadge).toHaveClass('bg-amber-100', 'text-amber-800');
  });

  it('handles different user roles', () => {
    const hrUser = { ...mockUser, role: 'hr_staff' };
    renderHeader({ user: hrUser });

    expect(screen.getByText('HR Staff')).toBeInTheDocument();
  });

  it('handles missing user gracefully', () => {
    renderHeader({ user: null });

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Factory Admin')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes for header styling', () => {
    renderHeader();

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b', 'border-gray-200');
  });

  it('applies correct CSS classes for search input', () => {
    renderHeader();

    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toHaveClass('block', 'w-full', 'pl-10', 'pr-3', 'py-2', 'border', 'border-gray-300', 'rounded-md', 'leading-5', 'bg-white', 'placeholder-gray-500', 'focus:outline-none', 'focus:placeholder-gray-400', 'focus:ring-1', 'focus:ring-amber-500', 'focus:border-amber-500', 'sm:text-sm');
  });

  it('applies correct CSS classes for notification button', () => {
    renderHeader();

    const notificationButton = screen.getByTestId('bell-icon').closest('button');
    expect(notificationButton).toHaveClass('p-1', 'rounded-full', 'text-gray-400', 'hover:text-gray-500', 'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2', 'focus:ring-amber-500');
  });

  it('applies correct CSS classes for user profile section', () => {
    renderHeader();

    const userProfile = screen.getByText('John Doe').closest('div');
    expect(userProfile).toHaveClass('flex', 'items-center', 'space-x-3');
  });

  it('renders search icon in search input', () => {
    renderHeader();

    const searchIcon = screen.getByTestId('search-icon');
    expect(searchIcon).toBeInTheDocument();
  });

  it('handles search input focus and blur', () => {
    renderHeader();

    const searchInput = screen.getByPlaceholderText('Search...');
    
    fireEvent.focus(searchInput);
    expect(searchInput).toHaveFocus();
    
    fireEvent.blur(searchInput);
    expect(searchInput).not.toHaveFocus();
  });

  it('renders notification button with correct accessibility attributes', () => {
    renderHeader();

    const notificationButton = screen.getByTestId('bell-icon').closest('button');
    expect(notificationButton).toHaveAttribute('type', 'button');
  });

  it('renders menu button with correct accessibility attributes', () => {
    renderHeader();

    const menuButton = screen.getByTestId('menu-icon').closest('button');
    expect(menuButton).toHaveAttribute('type', 'button');
  });

  it('handles keyboard navigation in search input', () => {
    renderHeader();

    const searchInput = screen.getByPlaceholderText('Search...');
    
    fireEvent.keyDown(searchInput, { key: 'Enter' });
    // Should not throw any errors
    
    fireEvent.keyDown(searchInput, { key: 'Escape' });
    // Should not throw any errors
  });

  it('renders user email in profile section', () => {
    renderHeader();

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('handles user with partial name', () => {
    const userWithPartialName = { ...mockUser, firstName: 'John', lastName: '' };
    renderHeader({ user: userWithPartialName });

    expect(screen.getByText('John')).toBeInTheDocument();
    const avatar = screen.getByText('J?');
    expect(avatar).toBeInTheDocument();
  });

  it('renders header with correct responsive classes', () => {
    renderHeader();

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('lg:pl-64');
  });
});
