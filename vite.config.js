import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import scanHandler from './api/scan.js'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-dev',
      configureServer(server) {
        server.middlewares.use('/api/scan', (req, res) => {
          const chunks = []
          req.on('data', (c) => chunks.push(c))
          req.on('end', () => {
            let body = {}
            try { body = JSON.parse(Buffer.concat(chunks).toString()) } catch {}

            const mockReq = { method: req.method, headers: req.headers, socket: req.socket, body }
            const mockRes = {
              _status: 200,
              status(code) { this._status = code; return this },
              json(data) {
                res.setHeader('Content-Type', 'application/json')
                res.statusCode = this._status
                res.end(JSON.stringify(data))
              },
            }

            scanHandler(mockReq, mockRes)
          })
        })
      },
    },
  ],
})
