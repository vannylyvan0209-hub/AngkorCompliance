import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormInput } from '../FormInput';

const renderFormInput = (props = {}) => {
  const defaultProps = {
    label: 'Test Label',
    name: 'testInput',
    type: 'text',
    ...props,
  };

  return render(<FormInput {...defaultProps} />);
};

describe('FormInput', () => {
  it('renders input with label', () => {
    renderFormInput();

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders input with correct type', () => {
    renderFormInput({ type: 'email' });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('renders input with correct name', () => {
    renderFormInput({ name: 'email' });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('name', 'email');
  });

  it('renders input with placeholder', () => {
    renderFormInput({ placeholder: 'Enter your email' });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('placeholder', 'Enter your email');
  });

  it('renders input with value', () => {
    renderFormInput({ value: 'test@example.com' });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveValue('test@example.com');
  });

  it('renders input as required when required prop is true', () => {
    renderFormInput({ required: true });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('required');
  });

  it('renders input as disabled when disabled prop is true', () => {
    renderFormInput({ disabled: true });

    const input = screen.getByLabelText('Test Label');
    expect(input).toBeDisabled();
  });

  it('renders input with error state', () => {
    renderFormInput({ error: 'This field is required' });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveClass('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('renders input with success state', () => {
    renderFormInput({ success: true });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveClass('border-green-300', 'focus:border-green-500', 'focus:ring-green-500');
  });

  it('renders input with help text', () => {
    renderFormInput({ helpText: 'This is help text' });

    expect(screen.getByText('This is help text')).toBeInTheDocument();
  });

  it('calls onChange when input value changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    renderFormInput({ onChange });

    const input = screen.getByLabelText('Test Label');
    await user.type(input, 'test');

    expect(onChange).toHaveBeenCalled();
  });

  it('calls onBlur when input loses focus', async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    
    renderFormInput({ onBlur });

    const input = screen.getByLabelText('Test Label');
    await user.click(input);
    await user.tab();

    expect(onBlur).toHaveBeenCalled();
  });

  it('calls onFocus when input gains focus', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    
    renderFormInput({ onFocus });

    const input = screen.getByLabelText('Test Label');
    await user.click(input);

    expect(onFocus).toHaveBeenCalled();
  });

  it('renders input with correct CSS classes', () => {
    renderFormInput();

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveClass('block', 'w-full', 'px-3', 'py-2', 'border', 'border-gray-300', 'rounded-md', 'shadow-sm', 'placeholder-gray-400', 'focus:outline-none', 'focus:ring-amber-500', 'focus:border-amber-500', 'sm:text-sm');
  });

  it('renders label with correct CSS classes', () => {
    renderFormInput();

    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('block', 'text-sm', 'font-medium', 'text-gray-700');
  });

  it('renders error message with correct CSS classes', () => {
    renderFormInput({ error: 'This field is required' });

    const errorMessage = screen.getByText('This field is required');
    expect(errorMessage).toHaveClass('mt-1', 'text-sm', 'text-red-600');
  });

  it('renders help text with correct CSS classes', () => {
    renderFormInput({ helpText: 'This is help text' });

    const helpText = screen.getByText('This is help text');
    expect(helpText).toHaveClass('mt-1', 'text-sm', 'text-gray-500');
  });

  it('renders input with correct id', () => {
    renderFormInput({ id: 'custom-id' });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('id', 'custom-id');
  });

  it('renders input with auto-generated id when id is not provided', () => {
    renderFormInput({ name: 'testInput' });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('id', 'testInput');
  });

  it('renders input with correct aria-describedby when error is present', () => {
    renderFormInput({ error: 'This field is required' });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('aria-describedby', 'testInput-error');
  });

  it('renders input with correct aria-describedby when help text is present', () => {
    renderFormInput({ helpText: 'This is help text' });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('aria-describedby', 'testInput-help');
  });

  it('renders input with correct aria-describedby when both error and help text are present', () => {
    renderFormInput({ error: 'This field is required', helpText: 'This is help text' });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('aria-describedby', 'testInput-error testInput-help');
  });

  it('renders input with correct aria-invalid when error is present', () => {
    renderFormInput({ error: 'This field is required' });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders input with correct aria-invalid when error is not present', () => {
    renderFormInput();

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('handles different input types', () => {
    const types = ['text', 'email', 'password', 'number', 'tel', 'url'];
    
    types.forEach(type => {
      const { unmount } = renderFormInput({ type });
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('type', type);
      unmount();
    });
  });

  it('renders input with correct min and max attributes for number type', () => {
    renderFormInput({ type: 'number', min: 0, max: 100 });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
  });

  it('renders input with correct step attribute for number type', () => {
    renderFormInput({ type: 'number', step: 0.1 });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('step', '0.1');
  });

  it('renders input with correct minLength and maxLength attributes', () => {
    renderFormInput({ minLength: 5, maxLength: 50 });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('minLength', '5');
    expect(input).toHaveAttribute('maxLength', '50');
  });

  it('renders input with correct pattern attribute', () => {
    renderFormInput({ pattern: '[0-9]{3}-[0-9]{3}-[0-9]{4}' });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('pattern', '[0-9]{3}-[0-9]{3}-[0-9]{4}');
  });

  it('renders input with correct autocomplete attribute', () => {
    renderFormInput({ autoComplete: 'email' });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('autocomplete', 'email');
  });

  it('renders input with correct spellCheck attribute', () => {
    renderFormInput({ spellCheck: false });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('spellcheck', 'false');
  });

  it('renders input with correct readOnly attribute', () => {
    renderFormInput({ readOnly: true });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('readonly');
  });

  it('renders input with correct autoFocus attribute', () => {
    renderFormInput({ autoFocus: true });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('autofocus');
  });

  it('handles controlled input correctly', () => {
    const { rerender } = renderFormInput({ value: 'initial' });

    let input = screen.getByLabelText('Test Label');
    expect(input).toHaveValue('initial');

    rerender(<FormInput label="Test Label" name="testInput" value="updated" />);
    input = screen.getByLabelText('Test Label');
    expect(input).toHaveValue('updated');
  });

  it('handles uncontrolled input correctly', () => {
    renderFormInput({ defaultValue: 'default' });

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveValue('default');
  });
});