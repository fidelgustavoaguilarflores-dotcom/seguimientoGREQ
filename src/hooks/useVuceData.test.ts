import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useVuceData } from './useVuceData'
import * as api from '../services/api'
import type { Row } from '../types'

// Mock the api module
vi.mock('../services/api')

describe('useVuceData', () => {
    const mockData: Row[] = [
        {
            recordId: 'CALC001',
            greq: 1001,
            estado: 'En Desarrollo',
            entidad: 'ENT001',
            nombreEntidad: 'Entidad Test',
            sigla: 'ET',
            apco: 'APCO001',
            observacion: 'ORIGINAL',
            descripcionGreq: 'Descripción de prueba',
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
        }
    ]

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should start with loading state', () => {
        vi.mocked(api.fetchData).mockImplementation(() => new Promise(() => { })) // Never resolves

        const { result } = renderHook(() => useVuceData())

        expect(result.current.loading).toBe(true)
        expect(result.current.data).toEqual([])
        expect(result.current.error).toBeNull()
    })

    it('should load data successfully', async () => {
        vi.mocked(api.fetchData).mockResolvedValue(mockData)

        const { result } = renderHook(() => useVuceData())

        expect(result.current.loading).toBe(true)

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        expect(result.current.data).toEqual(mockData)
        expect(result.current.error).toBeNull()
    })

    it('should handle errors correctly', async () => {
        const errorMessage = 'Failed to fetch data'
        vi.mocked(api.fetchData).mockRejectedValue(new Error(errorMessage))

        const { result } = renderHook(() => useVuceData())

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        expect(result.current.data).toEqual([])
        expect(result.current.error).toBe(errorMessage)
    })

    it('should handle non-Error exceptions', async () => {
        vi.mocked(api.fetchData).mockRejectedValue('String error')

        const { result } = renderHook(() => useVuceData())

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        expect(result.current.error).toBe('Error desconocido al cargar datos')
    })

    it('should provide a refetch function', async () => {
        vi.mocked(api.fetchData).mockResolvedValue(mockData)

        const { result } = renderHook(() => useVuceData())

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        expect(result.current.refetch).toBeDefined()
        expect(typeof result.current.refetch).toBe('function')
    })

    it('should refetch data when refetch is called', async () => {
        const initialData = mockData
        const updatedData: Row[] = [
            ...mockData,
            {
                ...mockData[0],
                recordId: 'CALC002',
                greq: 1002,
            }
        ]

        vi.mocked(api.fetchData)
            .mockResolvedValueOnce(initialData)
            .mockResolvedValueOnce(updatedData)

        const { result } = renderHook(() => useVuceData())

        // Wait for initial load
        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        expect(result.current.data).toEqual(initialData)

        // Call refetch
        result.current.refetch()

        // Wait for refetch to complete
        await waitFor(() => {
            expect(result.current.data).toEqual(updatedData)
        })

        expect(api.fetchData).toHaveBeenCalledTimes(2)
    })

    it('should clear error on successful refetch', async () => {
        vi.mocked(api.fetchData)
            .mockRejectedValueOnce(new Error('Initial error'))
            .mockResolvedValueOnce(mockData)

        const { result } = renderHook(() => useVuceData())

        // Wait for initial error
        await waitFor(() => {
            expect(result.current.error).toBe('Initial error')
        })

        // Refetch
        result.current.refetch()

        // Wait for successful refetch
        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        expect(result.current.data).toEqual(mockData)
        expect(result.current.error).toBeNull()
    })
})
