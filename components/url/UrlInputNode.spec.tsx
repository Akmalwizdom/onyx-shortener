import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import UrlInputNode from './UrlInputNode'

// Mock wagmi
vi.mock('wagmi', () => ({
  useAccount: () => ({ address: '0x123' }),
}))

describe('UrlInputNode', () => {
  it('should render input field', () => {
    render(<UrlInputNode onSubmit={vi.fn()} />)
    expect(screen.getByPlaceholderText(/https:\/\/example.com/i)).toBeInTheDocument()
  })

  it('should update input value', () => {
    render(<UrlInputNode onSubmit={vi.fn()} />)
    const input = screen.getByPlaceholderText(/https:\/\/example.com/i)
    fireEvent.change(input, { target: { value: 'https://test.com' } })
    expect(input).toHaveValue('https://test.com')
  })

  it('should call onSubmit with valid URL', () => {
    const handleSubmit = vi.fn()
    render(<UrlInputNode onSubmit={handleSubmit} />)
    
    const input = screen.getByPlaceholderText(/https:\/\/example.com/i)
    fireEvent.change(input, { target: { value: 'https://test.com' } })
    
    const button = screen.getByRole('button', { name: /shorten/i })
    fireEvent.click(button)

    expect(handleSubmit).toHaveBeenCalledWith('https://test.com', null)
  })

  it('should show error for invalid URL', async () => {
    render(<UrlInputNode onSubmit={vi.fn()} />)
    
    const input = screen.getByPlaceholderText(/https:\/\/example.com/i)
    fireEvent.change(input, { target: { value: 'http://' } })
    
    const button = screen.getByRole('button', { name: /shorten/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Invalid URL format/i)).toBeInTheDocument()
    })
  })

  it('should toggle gate configuration', () => {
    render(<UrlInputNode onSubmit={vi.fn()} />)
    
    const gateButton = screen.getByText(/ADD GATE/i)
    fireEvent.click(gateButton)
    
    expect(screen.getByText(/CONTRACT ADDRESS/i)).toBeInTheDocument()
    expect(screen.getByText(/MINIMUM BALANCE/i)).toBeInTheDocument()
  })

  it('should render quota indicator when prop is provided', () => {
    const quota = { remaining: 3, limit: 5 }
    render(<UrlInputNode onSubmit={vi.fn()} quota={quota} />)
    
    expect(screen.getByText(/DAILY QUOTA/i)).toBeInTheDocument()
    expect(screen.getByText(/3\/5 REMAINING/i)).toBeInTheDocument()
  })
})
