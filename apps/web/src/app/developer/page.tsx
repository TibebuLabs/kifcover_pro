'use client'
import Link from 'next/link'

const endpoints = [
  { method: 'POST', path: '/api/v1/auth/register', desc: 'Register a new customer account' },
  { method: 'POST', path: '/api/v1/auth/login', desc: 'Login and receive JWT token' },
  { method: 'GET',  path: '/api/v1/products', desc: 'List all active insurance products (public)' },
  { method: 'POST', path: '/api/v1/quotes/generate', desc: 'Generate a risk-adjusted quote' },
  { method: 'POST', path: '/api/v1/policies/issue', desc: 'Convert quote to active policy' },
  { method: 'GET',  path: '/api/v1/policies/my', desc: 'Get authenticated user policies' },
  { method: 'POST', path: '/api/v1/claims', desc: 'Submit a new insurance claim' },
  { method: 'POST', path: '/api/v1/payments/initiate', desc: 'Initiate a payment (Telebirr/bank/card)' },
]

const methodColor: Record<string, string> = {
  GET:   'bg-blue-100 text-blue-700',
  POST:  'bg-green-100 text-green-700',
  PATCH: 'bg-yellow-100 text-yellow-700',
  DELETE:'bg-red-100 text-red-700',
}

export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-background-main">
      {/* Header */}
      <div className="bg-primary text-white py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="flex items-center gap-2 mb-8 opacity-70 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-4xl text-secondary-fixed">code</span>
            <h1 className="font-display text-4xl font-bold">Developer Tools</h1>
          </div>
          <p className="text-white/70 text-lg max-w-2xl">
            KifCover provides a RESTful API and TCP microservices architecture. Use the Swagger UI for interactive testing.
          </p>
          <div className="flex gap-3 mt-8">
            <a href="http://localhost:3000/api/docs" target="_blank" rel="noopener noreferrer"
              className="bg-secondary text-on-secondary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined">open_in_new</span>
              Open Swagger UI
            </a>
            <Link href="/marketplace"
              className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-white/20 transition-colors">
              View Products
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12 space-y-8">
        {/* Quick start */}
        <div>
          <h2 className="font-display text-2xl font-bold text-primary mb-4">Quick Start</h2>
          <div className="bg-gray-900 text-green-400 p-6 rounded-2xl font-mono text-sm overflow-x-auto">
            <p className="text-gray-400 mb-2"># 1. Register</p>
            <p>curl -X POST http://localhost:3000/api/v1/auth/register \</p>
            <p className="pl-4">-H "Content-Type: application/json" \</p>
            <p className="pl-4">{'  '}-d &#39;&#123;"email":"user@test.et","password":"pass1234","firstName":"Abebe","lastName":"Kebede"&#125;&#39;</p>
            <br />
            <p className="text-gray-400"># 2. Use the token</p>
            <p>curl http://localhost:3000/api/v1/policies/my \</p>
            <p className="pl-4">-H "Authorization: Bearer YOUR_TOKEN"</p>
          </div>
        </div>

        {/* API Endpoints */}
        <div>
          <h2 className="font-display text-2xl font-bold text-primary mb-4">Key Endpoints</h2>
          <div className="space-y-2">
            {endpoints.map((e) => (
              <div key={e.path} className="flex items-center gap-4 p-4 bg-white border border-border-subtle rounded-xl">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg font-mono w-16 text-center ${methodColor[e.method]}`}>
                  {e.method}
                </span>
                <code className="text-sm text-primary font-mono flex-1">{e.path}</code>
                <span className="text-sm text-on-surface-variant hidden sm:block">{e.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-6">
          <a href="http://localhost:3000/api/docs" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-semibold hover:bg-primary-container transition-colors">
            <span className="material-symbols-outlined">api</span>
            Full API Reference (Swagger)
          </a>
        </div>
      </div>
    </div>
  )
}
