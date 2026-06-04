import { StartClient } from '@tanstack/react-start/client'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { getRouter } from './router'

hydrateRoot(
  document,
  <StrictMode>
    <StartClient router={getRouter()} />
  </StrictMode>,
)