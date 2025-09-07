import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormButton } from '../FormButton';

const renderFormButton = (props = {}) => {
  const defaultProps = {
    children: 'Test Button',
    ...props,
  };

  return render(<FormButton {...defaultProps} />);
};

describe('FormButton', () => {
  it('renders button with text', () => {
    renderFormButton();

    expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
  });

  it('renders button with correct type', () => {
    renderFormButton({ type: 'submit' });

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('renders button as disabled when disabled prop is true', () => {
    renderFormButton({ disabled: true });

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toBeDisabled();
  });

  it('renders button with loading state', () => {
    renderFormButton({ loading: true });

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders button with custom loading text', () => {
    renderFormButton({ loading: true, loadingText: 'Saving...' });

    const button = screen.getByRole('button', { name: 'Saving...' });
    expect(button).toBeDisabled();
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('calls onClick when button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    renderFormButton({ onClick });

    const button = screen.getByRole('button', { name: 'Test Button' });
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when button is disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    renderFormButton({ onClick, disabled: true });

    const button = screen.getByRole('button', { name: 'Test Button' });
    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when button is loading', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    renderFormButton({ onClick, loading: true });

    const button = screen.getByRole('button', { name: 'Loading...' });
    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders button with primary variant by default', () => {
    renderFormButton();

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveClass('bg-amber-600', 'hover:bg-amber-700', 'focus:ring-amber-500', 'text-white');
  });

  it('renders button with secondary variant', () => {
    renderFormButton({ variant: 'secondary' });

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveClass('bg-white', 'hover:bg-gray-50', 'focus:ring-amber-500', 'text-gray-700', 'border', 'border-gray-300');
  });

  it('renders button with danger variant', () => {
    renderFormButton({ variant: 'danger' });

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveClass('bg-red-600', 'hover:bg-red-700', 'focus:ring-red-500', 'text-white');
  });

  it('renders button with ghost variant', () => {
    renderFormButton({ variant: 'ghost' });

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveClass('bg-transparent', 'hover:bg-gray-100', 'focus:ring-amber-500', 'text-gray-700');
  });

  it('renders button with outline variant', () => {
    renderFormButton({ variant: 'outline' });

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveClass('bg-transparent', 'hover:bg-amber-50', 'focus:ring-amber-500', 'text-amber-700', 'border', 'border-amber-300');
  });

  it('renders button with small size', () => {
    renderFormButton({ size: 'sm' });

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
  });

  it('renders button with medium size by default', () => {
    renderFormButton();

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveClass('px-4', 'py-2', 'text-sm');
  });

  it('renders button with large size', () => {
    renderFormButton({ size: 'lg' });

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveClass('px-6', 'py-3', 'text-base');
  });

  it('renders button with extra large size', () => {
    renderFormButton({ size: 'xl' });

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveClass('px-8', 'py-4', 'text-lg');
  });

  it('renders button with full width', () => {
    renderFormButton({ fullWidth: true });

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveClass('w-full');
  });

  it('renders button with custom className', () => {
    renderFormButton({ className: 'custom-class' });

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveClass('custom-class');
  });

  it('renders button with icon', () => {
    const icon = <span data-testid="test-icon">Icon</span>;
    renderFormButton({ icon });

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders button with icon on the left', () => {
    const icon = <span data-testid="test-icon">Icon</span>;
    renderFormButton({ icon, iconPosition: 'left' });

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveClass('flex', 'items-center', 'justify-center');
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders button with icon on the right', () => {
    const icon = <span data-testid="test-icon">Icon</span>;
    renderFormButton({ icon, iconPosition: 'right' });

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveClass('flex', 'items-center', 'justify-center');
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders button with loading spinner when loading', () => {
    renderFormButton({ loading: true });

    const button = screen.getByRole('button', { name: 'Loading...' });
    expect(button).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('renders button with correct accessibility attributes', () => {
    renderFormButton({ 'aria-label': 'Custom label' });

    const button = screen.getByRole('button', { name: 'Custom label' });
    expect(button).toHaveAttribute('aria-label', 'Custom label');
  });

  it('renders button with correct data attributes', () => {
    renderFormButton({ 'data-testid': 'custom-button' });

    const button = screen.getByTestId('custom-button');
    expect(button).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    renderFormButton({ onClick });

    const button = screen.getByRole('button', { name: 'Test Button' });
    button.focus();
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);

    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('renders button with correct focus styles', () => {
    renderFormButton();

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
  });

  it('renders button with correct disabled styles', () => {
    renderFormButton({ disabled: true });

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('renders button with correct loading styles', () => {
    renderFormButton({ loading: true });

    const button = screen.getByRole('button', { name: 'Loading...' });
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('handles different button types', () => {
    const types = ['button', 'submit', 'reset'];
    
    types.forEach(type => {
      const { unmount } = renderFormButton({ type });
      const button = screen.getByRole('button', { name: 'Test Button' });
      expect(button).toHaveAttribute('type', type);
      unmount();
    });
  });

  it('renders button with correct form attribute', () => {
    renderFormButton({ form: 'test-form' });

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveAttribute('form', 'test-form');
  });

  it('renders button with correct name attribute', () => {
    renderFormButton({ name: 'test-button' });

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveAttribute('name', 'test-button');
  });

  it('renders button with correct value attribute', () => {
    renderFormButton({ value: 'test-value' });

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toHaveAttribute('value', 'test-value');
  });
});
