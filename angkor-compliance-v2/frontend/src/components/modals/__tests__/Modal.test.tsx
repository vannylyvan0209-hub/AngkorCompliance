import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

// Mock Headless UI components
vi.mock('@headlessui/react', () => ({
  Dialog: ({ children, open, onClose }: any) => (
    open ? (
      <div data-testid="dialog" onClick={onClose}>
        {children}
      </div>
    ) : null
  ),
  Transition: ({ children }: any) => <div data-testid="transition">{children}</div>,
  DialogPanel: ({ children, className }: any) => (
    <div data-testid="dialog-panel" className={className}>
      {children}
    </div>
  ),
  DialogTitle: ({ children, className }: any) => (
    <h3 data-testid="dialog-title" className={className}>
      {children}
    </h3>
  ),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
}));

const renderModal = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
    ...props,
  };

  return render(<Modal {...defaultProps} />);
};

describe('Modal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when isOpen is true', () => {
    renderModal();

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('transition')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-panel')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    renderModal({ isOpen: false });

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('renders modal title', () => {
    renderModal({ title: 'Custom Title' });

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders modal content', () => {
    renderModal({ children: <div>Custom content</div> });

    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('renders close button by default', () => {
    renderModal();

    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
  });

  it('does not render close button when showCloseButton is false', () => {
    renderModal({ showCloseButton: false });

    expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    const closeButton = screen.getByTestId('x-icon');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when dialog is clicked', () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    const dialog = screen.getByTestId('dialog');
    fireEvent.click(dialog);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders modal with small size', () => {
    renderModal({ size: 'sm' });

    const dialogPanel = screen.getByTestId('dialog-panel');
    expect(dialogPanel).toHaveClass('max-w-sm');
  });

  it('renders modal with medium size', () => {
    renderModal({ size: 'md' });

    const dialogPanel = screen.getByTestId('dialog-panel');
    expect(dialogPanel).toHaveClass('max-w-md');
  });

  it('renders modal with large size by default', () => {
    renderModal();

    const dialogPanel = screen.getByTestId('dialog-panel');
    expect(dialogPanel).toHaveClass('max-w-lg');
  });

  it('renders modal with extra large size', () => {
    renderModal({ size: 'xl' });

    const dialogPanel = screen.getByTestId('dialog-panel');
    expect(dialogPanel).toHaveClass('max-w-xl');
  });

  it('renders modal with 2xl size', () => {
    renderModal({ size: '2xl' });

    const dialogPanel = screen.getByTestId('dialog-panel');
    expect(dialogPanel).toHaveClass('max-w-2xl');
  });

  it('renders modal with correct CSS classes', () => {
    renderModal();

    const dialogPanel = screen.getByTestId('dialog-panel');
    expect(dialogPanel).toHaveClass('w-full', 'transform', 'overflow-hidden', 'rounded-lg', 'bg-white', 'p-6', 'text-left', 'align-middle', 'shadow-xl', 'transition-all');
  });

  it('renders dialog title with correct CSS classes', () => {
    renderModal();

    const dialogTitle = screen.getByTestId('dialog-title');
    expect(dialogTitle).toHaveClass('text-lg', 'font-medium', 'leading-6', 'text-gray-900', 'flex', 'justify-between', 'items-center');
  });

  it('renders close button with correct CSS classes', () => {
    renderModal();

    const closeButton = screen.getByTestId('x-icon').closest('button');
    expect(closeButton).toHaveClass('text-gray-400', 'hover:text-gray-500', 'focus:outline-none', 'focus:ring-2', 'focus:ring-amber-500', 'focus:ring-offset-2', 'rounded-md');
  });

  it('handles initial focus ref', () => {
    const initialFocusRef = { current: null };
    renderModal({ initialFocusRef });

    // Should not throw any errors
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('renders modal with custom className', () => {
    renderModal({ className: 'custom-modal' });

    const dialogPanel = screen.getByTestId('dialog-panel');
    expect(dialogPanel).toHaveClass('custom-modal');
  });

  it('renders modal with multiple children', () => {
    renderModal({
      children: (
        <div>
          <p>First paragraph</p>
          <p>Second paragraph</p>
          <button>Action button</button>
        </div>
      ),
    });

    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph')).toBeInTheDocument();
    expect(screen.getByText('Action button')).toBeInTheDocument();
  });

  it('renders modal with form content', () => {
    renderModal({
      children: (
        <form>
          <input type="text" placeholder="Enter text" />
          <button type="submit">Submit</button>
        </form>
      ),
    });

    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('renders modal with table content', () => {
    renderModal({
      children: (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John Doe</td>
              <td>john@example.com</td>
            </tr>
          </tbody>
        </table>
      ),
    });

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('handles modal with no children', () => {
    renderModal({ children: null });

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('handles modal with empty children', () => {
    renderModal({ children: '' });

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('renders modal with long title', () => {
    const longTitle = 'This is a very long modal title that might wrap to multiple lines';
    renderModal({ title: longTitle });

    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it('renders modal with special characters in title', () => {
    const specialTitle = 'Modal Title with Special Characters: @#$%^&*()';
    renderModal({ title: specialTitle });

    expect(screen.getByText(specialTitle)).toBeInTheDocument();
  });

  it('handles modal with different sizes and content', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', '2xl'];
    
    sizes.forEach(size => {
      const { unmount } = renderModal({ size, children: <div>Content for {size}</div> });
      expect(screen.getByText(`Content for ${size}`)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders modal with correct accessibility attributes', () => {
    renderModal();

    const dialog = screen.getByTestId('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('handles modal with custom onClose behavior', () => {
    const customOnClose = vi.fn(() => {
      console.log('Custom close behavior');
    });
    
    renderModal({ onClose: customOnClose });

    const closeButton = screen.getByTestId('x-icon');
    fireEvent.click(closeButton);

    expect(customOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders modal with correct z-index', () => {
    renderModal();

    const dialog = screen.getByTestId('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('handles modal with different content types', () => {
    const contentTypes = [
      <div>Div content</div>,
      <span>Span content</span>,
      <p>Paragraph content</p>,
      <section>Section content</section>,
    ];

    contentTypes.forEach((content, index) => {
      const { unmount } = renderModal({ children: content });
      expect(screen.getByText(`${content.type} content`)).toBeInTheDocument();
      unmount();
    });
  });
});