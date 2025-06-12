import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Mentions } from '../Mentions';

describe('Mentions Component', () => {
  test('renders with default placeholder', () => {
    render(<Mentions />);
    const textarea = screen.getByPlaceholderText('Type @ to mention someone...');
    expect(textarea).toBeInTheDocument();
  });

  test('renders with custom placeholder', () => {
    const customPlaceholder = 'Custom placeholder text';
    render(<Mentions placeholder={customPlaceholder} />);
    const textarea = screen.getByPlaceholderText(customPlaceholder);
    expect(textarea).toBeInTheDocument();
  });

  test('renders with initial value', () => {
    const initialValue = 'Hello @user';
    render(<Mentions value={initialValue} />);
    const textarea = screen.getByDisplayValue(initialValue);
    expect(textarea).toBeInTheDocument();
  });

  test('calls onChange when text is entered', () => {
    const handleChange = jest.fn();
    render(<Mentions onChange={handleChange} />);
    const textarea = screen.getByPlaceholderText('Type @ to mention someone...');
    
    fireEvent.change(textarea, { target: { value: 'Hello @user' } });
    expect(handleChange).toHaveBeenCalledWith('Hello @user');
  });

  test('updates value when controlled', () => {
    const { rerender } = render(<Mentions value="initial" />);
    const textarea = screen.getByDisplayValue('initial');
    
    rerender(<Mentions value="updated" />);
    expect(textarea).toHaveValue('updated');
  });

  test('maintains textarea styling', () => {
    render(<Mentions />);
    const textarea = screen.getByPlaceholderText('Type @ to mention someone...');
    
    expect(textarea).toHaveStyle({
      width: '100%',
      minHeight: '100px',
      padding: '8px',
      border: '1px solid #ccc',
      borderRadius: '4px',
    });
  });
}); 