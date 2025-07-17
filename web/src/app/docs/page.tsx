import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface DocSection {
  id: string
  title: string
  description?: string
  paragraphs: string[]
  lists?: {
    type: 'ordered' | 'unordered'
    items: string[]
  }[]
  subsections?: {
    title: string
    description?: string
    paragraphs?: string[]
    lists?: {
      type: 'ordered' | 'unordered'
      items: string[]
    }[]
  }[]
}

const docSections: DocSection[] = [
  {
    id: "welcome",
    title: "Bienvenido al Portal",
    description: "Introducción al nuevo Portal de Clientes B2B de DisCor",
    paragraphs: [
      "¡Te damos la bienvenida al nuevo Portal de Clientes B2B! Esta plataforma ha sido diseñada desde cero para ofrecerte una experiencia moderna, rápida y potente.",
      "Aquí podrás consultar nuestro catálogo completo, ver tus precios personalizados, gestionar tus pedidos y mucho más.",
      "Esta guía te ayudará a entender todas las funcionalidades disponibles. Puedes navegar entre las diferentes secciones usando el menú de navegación."
    ]
  },
  {
    id: "system-access",
    title: "Acceso al Sistema",
    description: "Cómo acceder al portal con tus credenciales únicas",
    paragraphs: [
      "Para garantizar la seguridad y la personalización, el acceso al portal se realiza con credenciales únicas generadas a partir de tus datos de cliente.",
      "Si tienes problemas para acceder, por favor, contacta a tu representante de ventas para verificar que tus datos estén correctamente cargados en nuestro sistema."
    ],
    subsections: [
      {
        title: "Tu Usuario y Contraseña",
        paragraphs: [
          "Las credenciales de acceso se generan automáticamente a partir de tu información de cliente:"
        ],
        lists: [
          {
            type: 'unordered',
            items: [
              "Usuario: Tu código de cliente en nuestro sistema ERP",
              "Contraseña: Los últimos 4 dígitos de tu CUIT registrado"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "find-products",
    title: "Encontrar Productos",
    description: "Herramientas para encontrar rápidamente las piezas que necesitas",
    paragraphs: [
      "Encontrar la pieza que necesitas es fácil y rápido gracias a nuestras herramientas de búsqueda inteligente."
    ],
    subsections: [
      {
        title: "Búsqueda Inteligente",
        paragraphs: [
          "Ubicada en la parte superior de la página, la barra de búsqueda te permite encontrar productos por múltiples criterios:",
        ],
        lists: [
          {
            type: 'unordered',
            items: [
              "Nombre: Ej: Manija Levanta Cristal",
              "SKU o Código de Artículo: Ej: 752300",
            ]
          }
        ]
      },
      {
        title: "Filtros por Vehículo (Próximamente)",
        paragraphs: [
          "Estamos trabajando para implementar un sistema de filtros avanzados que te permitirá encontrar piezas seleccionando la Marca, Modelo y Año del vehículo, asegurando una compatibilidad perfecta."
        ]
      }
    ]
  },
  {
    id: "product-page",
    title: "Página de Producto y Precios",
    description: "Comprende tu estructura de precios personalizada",
    paragraphs: [
      "La página de detalle de producto está diseñada para darte toda la información que necesitas, incluyendo tu estructura de precios personalizada."
    ],
    subsections: [
      {
        title: "Entendiendo tus Precios",
        paragraphs: [
          "En la página verás varios precios. Así es como funcionan:"
        ],
        lists: [
          {
            type: 'ordered',
            items: [
              "Precio de Lista: Es el precio base de referencia del producto",
              "Su Costo: Este es el precio más importante para ti. Se calcula aplicando tu descuento de cliente predefinido (ej: 37%) sobre el Precio de Lista. Este es el precio que tú nos pagas por el producto",
              "Calculadora de Precio de Venta: Una herramienta especializada para ti"
            ]
          }
        ]
      },
      {
        title: "Calculadora de Precio de Venta",
        paragraphs: [
          "Esta herramienta te permite calcular rápidamente el precio final para tus propios clientes:"
        ],
        lists: [
          {
            type: 'unordered',
            items: [
              "Margen (%): Puedes introducir tu porcentaje de ganancia deseado en este campo",
              "Precio de Venta Sugerido: El sistema calculará automáticamente el precio final de venta al público, aplicando tu margen sobre 'Su Costo'",
              "Incluir IVA: Puedes marcar esta opción para que el cálculo del Precio de Venta Sugerido también incluya el IVA nacional"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "cart-order",
    title: "Carrito y Proceso de Pedido",
    description: "Guía completa del proceso de compra",
    paragraphs: [
      "El proceso de compra está diseñado para ser simple y eficiente, adaptándose a tus necesidades de negocio."
    ],
    subsections: [
      {
        title: "Añadir al Carrito",
        paragraphs: [
          "Desde la página de un producto, simplemente selecciona la cantidad y haz clic en 'Añadir al Carrito'.",
          "Puedes acceder a tu carrito en cualquier momento desde el icono en la barra de navegación."
        ]
      },
      {
        title: "Proceso de Checkout",
        paragraphs: [
          "Una vez que estés listo para finalizar tu compra, procede al pago desde la página del carrito:"
        ],
        lists: [
          {
            type: 'ordered',
            items: [
              "Método de Entrega: Deberás elegir entre Envío a Domicilio (selecciona una de tus direcciones guardadas) o Retiro en Local (indica que pasarás a buscar el pedido por nuestra sucursal)",
              "Confirmación: Revisa tu pedido por última vez y haz clic en 'Confirmar Pedido'"
            ]
          }
        ]
      },
      {
        title: "Disponibilidad y Envío Gratis",
        paragraphs: [
          "Nuestro sistema ofrece flexibilidad en el manejo de stock y beneficios especiales:"
        ],
        lists: [
          {
            type: 'unordered',
            items: [
              "Pedidos sin Stock: Nuestro sistema te permite realizar pedidos incluso de productos que no tengan stock en este momento. Estos quedarán pendientes y se procesarán tan pronto como el producto esté disponible",
              "Envío Gratis: Si tu cliente está asignado a una 'Zona de Envío' con promoción, el sistema verificará si tu pedido supera el monto mínimo. Si es así y es tu primer pedido de la semana que califica, el envío será gratuito. Este beneficio se aplica automáticamente",
              "Costo de Envío: El costo de envío final para pedidos que no califican se calculará después de que el pedido sea preparado"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "my-account",
    title: "Mi Cuenta",
    description: "Tu centro de control personal",
    paragraphs: [
      "La sección 'Mi Cuenta' es tu centro de control personal donde puedes gestionar tu información y revisar tu historial."
    ],
    subsections: [
      {
        title: "Perfil",
        paragraphs: [
          "Aquí puedes ver tus datos de cliente registrados, como tu Razón Social, CUIT y dirección de correo electrónico."
        ]
      },
      {
        title: "Historial de Pedidos",
        paragraphs: [
          "Consulta una lista completa de todos tus pedidos anteriores. Puedes hacer clic en cualquier pedido para ver sus detalles completos, incluyendo:"
        ],
        lists: [
          {
            type: 'unordered',
            items: [
              "Los productos incluidos",
              "Los precios al momento de la compra",
              "El estado actual del pedido (Procesando, Enviado, Completado)"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "advanced-tools",
    title: "Herramientas Avanzadas",
    description: "Funcionalidades para potenciar tu gestión comercial",
    paragraphs: [
      "Hemos desarrollado herramientas especializadas para potenciar tu gestión comercial y ahorrarte tiempo valioso."
    ],
    subsections: [
      {
        title: "Gestión de Margen de Ganancia",
        paragraphs: [
          "En la sección 'Mi Cuenta', encontrarás una opción para guardar tu margen de ganancia (%) predefinido.",
          "Al establecer un valor aquí (ej: 40%), el sistema lo recordará y lo aplicará automáticamente en la 'Calculadora de Precio de Venta' de todas las páginas de producto, ahorrándote tiempo."
        ]
      },
      {
        title: "Descargar Lista de Precios",
        paragraphs: [
          "En la página del catálogo de productos, encontrarás un botón para 'Descargar como Excel'. Esta función generará un archivo .xlsx con todo el catálogo de productos, incluyendo:",
          "Esta es una herramienta poderosa para tu análisis y gestión de inventario offline."
        ],
        lists: [
          {
            type: 'unordered',
            items: [
              "SKU / ID del producto",
              "Nombre del producto",
              "Precio de Lista",
              "Su Precio Final (con tu descuento ya aplicado)"
            ]
          }
        ]
      }
    ]
  }
]

const renderContent = (section: DocSection) => {
  return (
      <div className="space-y-6">
        {section.description && (
            <p className="text-base text-gray-700 font-medium">{section.description}</p>
        )}

        {section.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-gray-600 leading-relaxed">
              {paragraph}
            </p>
        ))}

        {section.lists?.map((list, index) => (
            <div key={index}>
              {list.type === 'ordered' ? (
                  <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-600">
                    {list.items.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                    ))}
                  </ol>
              ) : (
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-600">
                    {list.items.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
              )}
            </div>
        ))}

        {section.subsections?.map((subsection, index) => (
            <div key={index} className="border-l-2 border-gray-200 pl-4 space-y-3">
              <h4 className="font-semibold text-gray-900">{subsection.title}</h4>
              {subsection.description && (
                  <p className="text-sm text-gray-600 italic">{subsection.description}</p>
              )}
              {subsection.paragraphs?.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-sm text-gray-600">{paragraph}</p>
              ))}
              {subsection.lists?.map((list, lIndex) => (
                  <div key={lIndex}>
                    {list.type === 'ordered' ? (
                        <ol className="list-decimal list-inside space-y-1 ml-4 text-sm text-gray-600">
                          {list.items.map((item, itemIndex) => (
                              <li key={itemIndex}>{item}</li>
                          ))}
                        </ol>
                    ) : (
                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-gray-600">
                          {list.items.map((item, itemIndex) => (
                              <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                    )}
                  </div>
              ))}
            </div>
        ))}
      </div>
  )
}

export default function DocsPage() {
  return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Documentación DisCor
          </h1>
          <p className="text-gray-600">
            Guía completa para usar nuestra plataforma de cerrajería y accesorios
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {docSections.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  {renderContent(section)}
                </AccordionContent>
              </AccordionItem>
          ))}
        </Accordion>
      </div>
  )
}