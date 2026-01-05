# Documentación de Testing - VUCE Dashboard

## Descripción General

Este proyecto utiliza **Vitest** como framework de testing junto con **React Testing Library** para tests de componentes. La suite de tests incluye tests unitarios, de integración y de hooks.

## Ejecutar Tests

### Comandos Disponibles

```bash
# Ejecutar tests en modo watch (desarrollo)
npm test

# Ejecutar tests una sola vez
npm run test:run

# Ejecutar tests con interfaz visual
npm run test:ui

# Ejecutar tests con reporte de cobertura
npm run test:coverage
```

### Ejemplos de Uso

**Durante desarrollo:**
```bash
npm test
```
Este comando ejecutará los tests en modo watch, re-ejecutando automáticamente cuando detecte cambios en los archivos.

**En CI/CD:**
```bash
npm run test:run
```
Este comando ejecuta todos los tests una sola vez y sale, ideal para pipelines de integración continua.

**Ver cobertura:**
```bash
npm run test:coverage
```
Este comando genera un reporte HTML en `coverage/index.html` que puedes abrir en tu navegador.

## Estructura de Tests

```
src/
├── services/
│   ├── api.ts                      # Código fuente
│   ├── api.test.ts                 # Tests unitarios
│   └── api.integration.test.ts     # Tests de integración
├── hooks/
│   ├── useVuceData.ts              # Hook personalizado
│   └── useVuceData.test.ts         # Tests del hook
├── components/
│   └── ...                         # Componentes (tests pendientes)
├── App.tsx                         # Componente principal
├── App.test.tsx                    # Tests de integración del App
└── test/
    └── setup.ts                    # Configuración global de tests
```

### Convenciones de Naming

- **Tests unitarios**: `*.test.ts` o `*.test.tsx`
- **Tests de integración**: `*.integration.test.ts` o `*.integration.test.tsx`
- **Ubicación**: Los tests se ubican junto al código que testean

## Tipos de Tests

### 1. Tests Unitarios

Tests que verifican funciones individuales en aislamiento.

**Ejemplo** (`src/services/api.test.ts`):
```typescript
describe('parseDate', () => {
  it('should parse YYYY-MM-DD format correctly', () => {
    const result = parseDate('2024-01-15')
    expect(result).toBeInstanceOf(Date)
    expect(result?.getFullYear()).toBe(2024)
  })
})
```

**Archivos:**
- `src/services/api.test.ts` - 44 tests para funciones de utilidad

### 2. Tests de Integración

Tests que verifican la interacción entre múltiples componentes o módulos.

**Ejemplo** (`src/services/api.integration.test.ts`):
```typescript
describe('fetchData integration', () => {
  it('should fetch and transform data correctly', async () => {
    const mockRawData = [/* ... */]
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRawData,
    } as Response)

    const result = await fetchData()
    expect(result).toHaveLength(1)
    expect(result[0].greq).toBe(1001)
  })
})
```

**Archivos:**
- `src/services/api.integration.test.ts` - 7 tests para `fetchData`
- `src/App.test.tsx` - 4 tests de integración para el componente App

### 3. Tests de Hooks

Tests para hooks personalizados de React usando `renderHook`.

**Ejemplo** (`src/hooks/useVuceData.test.ts`):
```typescript
describe('useVuceData', () => {
  it('should load data successfully', async () => {
    vi.mocked(api.fetchData).mockResolvedValue(mockData)
    
    const { result } = renderHook(() => useVuceData())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.data).toEqual(mockData)
  })
})
```

**Archivos:**
- `src/hooks/useVuceData.test.ts` - 7 tests para el hook `useVuceData`

## Mocking

### Mocking de Módulos

Para mockear un módulo completo:

```typescript
import { vi } from 'vitest'
import * as api from '../services/api'

vi.mock('../services/api')

// Luego en el test:
vi.mocked(api.fetchData).mockResolvedValue(mockData)
```

### Mocking de Fetch Global

```typescript
global.fetch = vi.fn()

vi.mocked(fetch).mockResolvedValueOnce({
  ok: true,
  json: async () => mockData,
} as Response)
```

### Limpiar Mocks

Siempre limpia los mocks entre tests:

```typescript
beforeEach(() => {
  vi.clearAllMocks()
})
```

## Utilidades de Testing Library

### Queries Principales

- `getByText()` - Encuentra elemento por texto (error si no existe)
- `queryByText()` - Encuentra elemento por texto (null si no existe)
- `findByText()` - Encuentra elemento por texto (async, espera)
- `getByPlaceholderText()` - Encuentra input por placeholder
- `getByRole()` - Encuentra elemento por rol ARIA

### Esperar Cambios Asíncronos

```typescript
await waitFor(() => {
  expect(screen.queryByText('Cargando...')).not.toBeInTheDocument()
})
```

## Cobertura de Tests

### Estado Actual

- **Total de tests**: 62
- **Tests pasando**: 62 (100%)
- **Archivos con tests**:
  - `api.ts` - Funciones de utilidad (44 tests)
  - `api.ts` - Integración fetchData (7 tests)
  - `useVuceData.ts` - Hook personalizado (7 tests)
  - `App.tsx` - Componente principal (4 tests)

### Objetivos de Cobertura

- Funciones de utilidad: ≥ 80%
- Hooks: ≥ 70%
- Componentes: ≥ 60%

## Mejores Prácticas

### 1. Tests Descriptivos

```typescript
// ✅ Bueno
it('should return null for invalid date strings', () => {
  expect(parseDate('invalid-date')).toBeNull()
})

// ❌ Malo
it('test parseDate', () => {
  expect(parseDate('invalid-date')).toBeNull()
})
```

### 2. Arrange-Act-Assert

```typescript
it('should normalize percentage from decimal', () => {
  // Arrange
  const input = 0.75
  
  // Act
  const result = normalizePercentage(input)
  
  // Assert
  expect(result).toBe(75)
})
```

### 3. Un Concepto por Test

Cada test debe verificar un solo comportamiento o escenario.

### 4. Tests Independientes

Los tests no deben depender del orden de ejecución.

```typescript
beforeEach(() => {
  vi.clearAllMocks()
  // Reset cualquier estado compartido
})
```

### 5. Evitar Lógica Compleja en Tests

Los tests deben ser simples y fáciles de entender.

## Troubleshooting

### Error: "act(...)" Warning

Este warning aparece cuando hay actualizaciones de estado de React fuera de `act()`. Generalmente se resuelve usando `waitFor`:

```typescript
await waitFor(() => {
  expect(result.current.loading).toBe(false)
})
```

### Error: "HTMLCanvasElement's getContext() method"

Este error aparece al testear componentes con Chart.js. Es un warning que no afecta los tests, ya que jsdom no soporta canvas nativamente.

### Tests Lentos

Si los tests son lentos:
1. Usa `vi.useFakeTimers()` para timers
2. Mockea llamadas HTTP
3. Evita renderizar componentes pesados innecesariamente

## Recursos Adicionales

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
