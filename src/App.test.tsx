import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'
import * as api from './services/api'
import type { Row } from './types'

// Mock the api module
vi.mock('./services/api')

describe('App Integration Tests', () => {
    const mockData: Row[] = [
        {
            recordId: 'CALC001',
            greq: 1001,
            estado: 'En Desarrollo',
            entidad: 'ENT001',
            nombreEntidad: 'Entidad Test 1',
            sigla: 'ET1',
            apco: 'APCO001',
            observacion: 'ORIGINAL',
            descripcionGreq: 'Descripción de prueba 1',
            responsableAnalisis: 'Juan Pérez',
            estadoAnalisis: 'Completado',
            fechaIniAnalisis: new Date('2024-01-01'),
            fechaFinAnalisis: new Date('2024-01-15'),
            responsablesDesarrollo: ['María García'],
            estadoDesarrollo: 'En Progreso',
            fechaIniDesarrollo: new Date('2024-01-16'),
            fechaFinDesarrollo: null,
            responsableCC: 'Ana Martínez',
            estadoCC: 'Pendiente',
            fechaIniCC: null,
            fechaFinCC: null,
            fechaInicio: new Date('2024-01-01'),
            fechaFinal: new Date('2024-03-01'),
            fechaPublicacion: new Date('2024-03-15'),
            porcentajeAvance: 65,
            orden: 1,
            createdTime: new Date('2024-01-01T10:00:00Z'),
            fechaGreq: new Date('2024-01-01'),
            archivoAdjunto: []
        },
        {
            recordId: 'CALC002',
            greq: 1002,
            estado: 'Completado',
            entidad: 'ENT002',
            nombreEntidad: 'Entidad Test 2',
            sigla: 'ET2',
            apco: 'APCO002',
            observacion: 'ACTUALIZACION',
            descripcionGreq: 'Descripción de prueba 2',
            responsableAnalisis: 'Pedro López',
            estadoAnalisis: 'Completado',
            fechaIniAnalisis: new Date('2024-02-01'),
            fechaFinAnalisis: new Date('2024-02-15'),
            responsablesDesarrollo: ['Carlos Ruiz'],
            estadoDesarrollo: 'Completado',
            fechaIniDesarrollo: new Date('2024-02-16'),
            fechaFinDesarrollo: new Date('2024-03-01'),
            responsableCC: 'Luis Fernández',
            estadoCC: 'Completado',
            fechaIniCC: new Date('2024-03-02'),
            fechaFinCC: new Date('2024-03-10'),
            fechaInicio: new Date('2024-02-01'),
            fechaFinal: new Date('2024-03-15'),
            fechaPublicacion: new Date('2024-03-20'),
            porcentajeAvance: 100,
            orden: 2,
            createdTime: new Date('2024-02-01T10:00:00Z'),
            fechaGreq: new Date('2024-02-01'),
            archivoAdjunto: []
        }
    ]

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should display loading state initially', () => {
        vi.mocked(api.fetchData).mockImplementation(() => new Promise(() => { }))

        render(<App />)

        expect(screen.getByText('Cargando datos...')).toBeInTheDocument()
    })

    it('should load and display data successfully', async () => {
        vi.mocked(api.fetchData).mockResolvedValue(mockData)

        render(<App />)

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument()
        })

        // Check that the header is displayed
        expect(screen.getByText('Dashboard Seguimiento VUCE')).toBeInTheDocument()

        // Check that the record count is displayed
        expect(screen.getByText(/Registros: 2/)).toBeInTheDocument()
    })

    it('should display error message on fetch failure', async () => {
        const errorMessage = 'Error fetching data: Network error'
        vi.mocked(api.fetchData).mockRejectedValue(new Error(errorMessage))

        render(<App />)

        // Wait for error to appear
        await waitFor(() => {
            expect(screen.getByText('Error al cargar datos')).toBeInTheDocument()
        })

        expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('should render all main sections when data is loaded', async () => {
        vi.mocked(api.fetchData).mockResolvedValue(mockData)

        render(<App />)

        await waitFor(() => {
            expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument()
        })

        // Check for filter section (search input)
        expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument()

        // Check for dashboard header
        expect(screen.getByText('Dashboard Seguimiento VUCE')).toBeInTheDocument()
    })
})
