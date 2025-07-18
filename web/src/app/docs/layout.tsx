export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Documentación para Clientes
          </h1>
          <p className="text-gray-600">
            Encuentra toda la información que necesitas sobre nuestros productos y servicios
          </p>
        </header>
        {children}
      </div>
    </div>
  )
}

