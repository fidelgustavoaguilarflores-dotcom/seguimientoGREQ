import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchData } from './api'
import type { Row } from '../types'

// Mock global fetch
global.fetch = vi.fn()

describe('fetchData integration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should fetch and transform data correctly', async () => {
        const mockRawData = [
            {
                'GREQ': 1001,
                'Estado': 'En Desarrollo',
                'Entidad': 'ENT001',
                'Nombre Entidad': 'Entidad Test',
                'SIGLA': 'ET',
                'APCO': 'APCO001',
                'Observación': 'ORIGINAL',
                'Descripción GREQ': 'Descripción de prueba',
                'Responsable ANALISIS': 'Juan Pérez',
                'Estado ANALISIS': 'Completado',
                'Fecha Inicial ANALISIS': '2024-01-01',
                'Fecha Final ANALISIS': '2024-01-15',
                'Responsable DESARROLLO': ['María García', 'Pedro López'],
                'Estado DESARROLLO': 'En Progreso',
                'Fecha Inicial DESARROLLO': '2024-01-16',
                'Fecha Final DESARROLLO': null,
                'Responsable CONTROL DE CALIDAD': 'Ana Martínez',
                'Estado CONTROL DE CALIDAD': 'Pendiente',
                'Fecha Inicial CONTROL CALIDAD': null,
                'Fecha Final CONTROL CALIDAD': null,
                'Fecha Inicio': '2024-01-01',
                'Fecha Final': '2024-03-01',
                'Fecha Publicación': '2024-03-15',
                'Porcentaje de avance': 0.65,
                'Orden': 1,
                'Cálculo': 'CALC001',
                'createdTime': '2024-01-01T10:00:00Z',
                'Fecha GREQ': '2024-01-01',
                'Archivo adjunto': [
                    {
                        id: 'att123',
                        url: 'https://example.com/file.pdf',
                        filename: 'documento.pdf',
                        size: 1024,
                        type: 'application/pdf'
                    }
                ]
            }
        ]

        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => mockRawData,
        } as Response)

        const result = await fetchData()

        expect(fetch).toHaveBeenCalledTimes(1)
        expect(result).toHaveLength(1)

        const row = result[0]
        expect(row.recordId).toBe('CALC001')
        expect(row.greq).toBe(1001)
        expect(row.estado).toBe('En Desarrollo')
        expect(row.entidad).toBe('ENT001')
        expect(row.nombreEntidad).toBe('Entidad Test')
        expect(row.sigla).toBe('ET')
        expect(row.apco).toBe('APCO001')
        expect(row.observacion).toBe('ORIGINAL')
        expect(row.descripcionGreq).toBe('Descripción de prueba')
        expect(row.responsableAnalisis).toBe('Juan Pérez')
        expect(row.estadoAnalisis).toBe('Completado')
        expect(row.fechaIniAnalisis).toBeInstanceOf(Date)
        expect(row.fechaFinAnalisis).toBeInstanceOf(Date)
        expect(row.responsablesDesarrollo).toEqual(['María García', 'Pedro López'])
        expect(row.estadoDesarrollo).toBe('En Progreso')
        expect(row.fechaIniDesarrollo).toBeInstanceOf(Date)
        expect(row.fechaFinDesarrollo).toBeNull()
        expect(row.responsableCC).toBe('Ana Martínez')
        expect(row.estadoCC).toBe('Pendiente')
        expect(row.fechaIniCC).toBeNull()
        expect(row.fechaFinCC).toBeNull()
        expect(row.fechaInicio).toBeInstanceOf(Date)
        expect(row.fechaFinal).toBeInstanceOf(Date)
        expect(row.fechaPublicacion).toBeInstanceOf(Date)
        expect(row.porcentajeAvance).toBe(65) // 0.65 * 100
        expect(row.orden).toBe(1)
        expect(row.createdTime).toBeInstanceOf(Date)
        expect(row.fechaGreq).toBeInstanceOf(Date)
        expect(row.archivoAdjunto).toHaveLength(1)
        expect(row.archivoAdjunto[0].url).toBe('https://example.com/file.pdf')
    })

    it('should handle fetch errors', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: false,
            statusText: 'Internal Server Error',
        } as Response)

        await expect(fetchData()).rejects.toThrow('Error fetching data: Internal Server Error')
    })

    it('should handle network errors', async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

        await expect(fetchData()).rejects.toThrow('Network error')
    })

    it('should handle empty data array', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        } as Response)

        const result = await fetchData()
        expect(result).toEqual([])
    })

    it('should normalize observation types with accents', async () => {
        const mockRawData = [
            {
                'GREQ': 1002,
                'Observación': 'ACTUALIZACIÓN',
                'Cálculo': 'CALC002',
            }
        ]

        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => mockRawData,
        } as Response)

        const result = await fetchData()
        expect(result[0].observacion).toBe('ACTUALIZACION')
    })

    it('should handle string attachment as URL', async () => {
        const mockRawData = [
            {
                'GREQ': 1003,
                'Archivo adjunto': 'https://example.com/direct-link.pdf',
                'Cálculo': 'CALC003',
            }
        ]

        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => mockRawData,
        } as Response)

        const result = await fetchData()
        expect(result[0].archivoAdjunto).toHaveLength(1)
        expect(result[0].archivoAdjunto[0].url).toBe('https://example.com/direct-link.pdf')
        expect(result[0].archivoAdjunto[0].filename).toBe('Ver Documento')
    })

    it('should handle percentage already as whole number', async () => {
        const mockRawData = [
            {
                'GREQ': 1004,
                'Porcentaje de avance': 75,
                'Cálculo': 'CALC004',
            }
        ]

        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => mockRawData,
        } as Response)

        const result = await fetchData()
        expect(result[0].porcentajeAvance).toBe(75)
    })
})
