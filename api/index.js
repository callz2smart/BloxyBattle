import app from '../server/index.js'

export default function handler(request, response) {
  const requestUrl = new URL(request.url || '/', 'http://localhost')
  const routedPath = requestUrl.searchParams.get('__vercel_path')

  if (routedPath) {
    requestUrl.searchParams.delete('__vercel_path')
    const query = requestUrl.searchParams.toString()
    request.url = `/api/${routedPath}${query ? `?${query}` : ''}`
  }

  return app(request, response)
}
