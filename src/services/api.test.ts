import { describe, it, expect } from 'vitest'
import {
    parseDate,
    normalizeInternalType,
    normalizeArray,
    normalizeAttachment,
    normalizeText,
    normalizePercentage,
} from './api'
import type { Observacion, Attachment } from '../types'

describe('parseDate', () => {
    it('should parse YYYY-MM-DD format correctly', () => {
        const result = parseDate('2024-01-15')
        expect(result).toBeInstanceOf(Date)
        expect(result?.getFullYear()).toBe(2024)
        expect(result?.getMonth()).toBe(0) // January is 0
        expect(result?.getDate()).toBe(15)
    })

    it('should parse dd/MM/yyyy format correctly', () => {
        const result = parseDate('15/01/2024')
        expect(result).toBeInstanceOf(Date)
        expect(result?.getFullYear()).toBe(2024)
        expect(result?.getMonth()).toBe(0)
        expect(result?.getDate()).toBe(15)
    })

    it('should parse ISO date format correctly', () => {
        const result = parseDate('2024-01-15T10:30:00Z')
        expect(result).toBeInstanceOf(Date)
        expect(result?.getFullYear()).toBe(2024)
    })

    it('should return null for invalid date strings', () => {
        expect(parseDate('invalid-date')).toBeNull()
        expect(parseDate('99/99/9999')).toBeNull()
    })

    it('should return null for null input', () => {
        expect(parseDate(null)).toBeNull()
    })

    it('should return null for undefined input', () => {
        expect(parseDate(undefined)).toBeNull()
    })

    it('should return null for empty string', () => {
        expect(parseDate('')).toBeNull()
    })
})

describe('normalizeInternalType', () => {
    it('should normalize ACTUALIZACION with accents', () => {
        expect(normalizeInternalType('ACTUALIZACIÓN')).toBe('ACTUALIZACION')
        expect(normalizeInternalType('actualizacion')).toBe('ACTUALIZACION')
        expect(normalizeInternalType('Actualización')).toBe('ACTUALIZACION')
    })

    it('should normalize OBSERVACION with accents', () => {
        expect(normalizeInternalType('OBSERVACIÓN')).toBe('OBSERVACION')
        expect(normalizeInternalType('observacion')).toBe('OBSERVACION')
        expect(normalizeInternalType('Observación')).toBe('OBSERVACION')
    })

    it('should normalize ORIGINAL', () => {
        expect(normalizeInternalType('ORIGINAL')).toBe('ORIGINAL')
        expect(normalizeInternalType('original')).toBe('ORIGINAL')
    })

    it('should normalize AJUSTE', () => {
        expect(normalizeInternalType('AJUSTE')).toBe('AJUSTE')
        expect(normalizeInternalType('ajuste')).toBe('AJUSTE')
    })

    it('should normalize SUMA-VUCE', () => {
        expect(normalizeInternalType('SUMA-VUCE')).toBe('SUMA-VUCE')
        expect(normalizeInternalType('suma-vuce')).toBe('SUMA-VUCE')
    })

    it('should normalize COMPLEMENTARIO', () => {
        expect(normalizeInternalType('COMPLEMENTARIO')).toBe('COMPLEMENTARIO')
        expect(normalizeInternalType('complementario')).toBe('COMPLEMENTARIO')
    })

    it('should normalize PENDIENTE', () => {
        expect(normalizeInternalType('PENDIENTE')).toBe('PENDIENTE')
        expect(normalizeInternalType('pendiente')).toBe('PENDIENTE')
    })

    it('should default to OBSERVACION for unknown values', () => {
        expect(normalizeInternalType('UNKNOWN')).toBe('OBSERVACION')
        expect(normalizeInternalType('')).toBe('OBSERVACION')
        expect(normalizeInternalType('random text')).toBe('OBSERVACION')
    })
})

describe('normalizeArray', () => {
    it('should convert string to array', () => {
        expect(normalizeArray('test')).toEqual(['test'])
    })

    it('should keep array as is', () => {
        expect(normalizeArray(['item1', 'item2'])).toEqual(['item1', 'item2'])
    })

    it('should filter out empty strings from array', () => {
        expect(normalizeArray(['item1', '', 'item2'])).toEqual(['item1', 'item2'])
    })

    it('should normalize objects in array to strings', () => {
        const input = [{ name: 'test1' }, { value: 'test2' }]
        const result = normalizeArray(input)
        expect(result).toContain('test1')
        expect(result).toContain('test2')
    })

    it('should return empty array for undefined', () => {
        expect(normalizeArray(undefined)).toEqual([])
    })

    it('should return empty array for non-string, non-array values', () => {
        expect(normalizeArray(123 as any)).toEqual([])
    })
})

describe('normalizeAttachment', () => {
    it('should convert string URL to attachment object', () => {
        const result = normalizeAttachment('https://example.com/file.pdf')
        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({
            url: 'https://example.com/file.pdf',
            filename: 'Ver Documento',
            type: 'link',
        })
        expect(result[0].id).toBeDefined()
    })

    it('should normalize array of attachments', () => {
        const input = [
            {
                id: 'att123',
                url: 'https://example.com/file1.pdf',
                filename: 'file1.pdf',
                size: 1024,
                type: 'application/pdf',
            },
            {
                id: 'att456',
                url: 'https://example.com/file2.jpg',
                filename: 'file2.jpg',
                size: 2048,
                type: 'image/jpeg',
            },
        ]
        const result = normalizeAttachment(input)
        expect(result).toHaveLength(2)
        expect(result[0]).toMatchObject({
            id: 'att123',
            url: 'https://example.com/file1.pdf',
            filename: 'file1.pdf',
            size: 1024,
            type: 'application/pdf',
        })
    })

    it('should handle attachments without optional fields', () => {
        const input = [{ url: 'https://example.com/file.pdf' }]
        const result = normalizeAttachment(input)
        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({
            url: 'https://example.com/file.pdf',
            filename: 'Documento',
        })
    })

    it('should return empty array for null', () => {
        expect(normalizeAttachment(null)).toEqual([])
    })

    it('should return empty array for undefined', () => {
        expect(normalizeAttachment(undefined)).toEqual([])
    })
})

describe('normalizeText', () => {
    it('should convert string to string', () => {
        expect(normalizeText('test')).toBe('test')
    })

    it('should convert number to string', () => {
        expect(normalizeText(123)).toBe('123')
        expect(normalizeText(0)).toBe('0')
    })

    it('should return empty string for null', () => {
        expect(normalizeText(null)).toBe('')
    })

    it('should return empty string for undefined', () => {
        expect(normalizeText(undefined)).toBe('')
    })

    it('should extract value property from object', () => {
        expect(normalizeText({ value: 'test' })).toBe('test')
    })

    it('should extract name property from object', () => {
        expect(normalizeText({ name: 'test' })).toBe('test')
    })

    it('should extract id property from object', () => {
        expect(normalizeText({ id: 'test' })).toBe('test')
    })

    it('should prioritize value over name and id', () => {
        expect(normalizeText({ value: 'val', name: 'nm', id: 'i' })).toBe('val')
    })

    it('should return empty string for object without value, name, or id', () => {
        expect(normalizeText({ other: 'test' })).toBe('')
    })
})

describe('normalizePercentage', () => {
    it('should convert decimal to percentage', () => {
        expect(normalizePercentage(0.75)).toBe(75)
        expect(normalizePercentage(0.5)).toBe(50)
        expect(normalizePercentage(1)).toBe(100)
    })

    it('should keep percentage as is if > 1', () => {
        expect(normalizePercentage(75)).toBe(75)
        expect(normalizePercentage(100)).toBe(100)
    })

    it('should convert string numbers', () => {
        expect(normalizePercentage('0.75')).toBe(75)
        expect(normalizePercentage('75')).toBe(75)
    })

    it('should return 0 for null', () => {
        expect(normalizePercentage(null)).toBe(0)
    })

    it('should return 0 for undefined', () => {
        expect(normalizePercentage(undefined)).toBe(0)
    })

    it('should return 0 for empty string', () => {
        expect(normalizePercentage('')).toBe(0)
    })

    it('should return 0 for NaN', () => {
        expect(normalizePercentage('invalid')).toBe(0)
    })

    it('should handle edge case of exactly 1', () => {
        expect(normalizePercentage(1)).toBe(100)
    })

    it('should handle very small decimals', () => {
        expect(normalizePercentage(0.001)).toBe(0.1)
    })
})
