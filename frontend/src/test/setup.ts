import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Without globals:true, Testing Library's auto-cleanup is not registered,
// so unmount rendered trees between tests ourselves.
afterEach(() => cleanup())
