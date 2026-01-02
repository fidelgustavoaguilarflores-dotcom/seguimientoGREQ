import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi } from 'vitest';
import { useVuceData } from './hooks/useVuceData';

// Mock the hook
vi.mock('./hooks/useVuceData', () => ({
  useVuceData: vi.fn(),
}));

// Mock child components to avoid complex rendering and chart.js errors in JSDOM
vi.mock('./components/dashboard/Filters', () => ({
  Filters: () => <div data-testid="filters">Filters</div>
}));
vi.mock('./components/dashboard/KPICards', () => ({
  KPICards: () => <div data-testid="kpi-cards">KPI Cards</div>
}));
vi.mock('./components/dashboard/ChartsSection', () => ({
  ChartsSection: () => <div data-testid="charts-section">Charts</div>
}));
vi.mock('./components/dashboard/RecordsTable', () => ({
  RecordsTable: () => <div data-testid="records-table">Table</div>
}));
vi.mock('./components/chat/ChatWidget', () => ({
  ChatWidget: () => <div data-testid="chat-widget">Chat</div>
}));

describe('App', () => {
  it('shows loading state initially', () => {
    (useVuceData as any).mockReturnValue({
      data: [],
      loading: true,
      error: null,
    });

    render(<App />);
    expect(screen.getByText(/Cargando datos.../i)).toBeInTheDocument();
  });

  it('shows error state', () => {
    (useVuceData as any).mockReturnValue({
      data: [],
      loading: false,
      error: 'Failed to fetch',
    });

    render(<App />);
    expect(screen.getByText(/Error al cargar datos/i)).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
  });

  it('renders dashboard when data is loaded', async () => {
    (useVuceData as any).mockReturnValue({
      data: [{ id: 1, greq: 123 }], // Minimal mock data
      loading: false,
      error: null,
    });

    render(<App />);

    expect(screen.getByText('Dashboard Seguimiento VUCE')).toBeInTheDocument();
    expect(screen.getByTestId('filters')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-cards')).toBeInTheDocument();
    expect(screen.getByTestId('charts-section')).toBeInTheDocument();
    expect(screen.getByTestId('records-table')).toBeInTheDocument();
  });
});
