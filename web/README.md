
---

### **Plan de Desarrollo del Frontend por Etapas**

Este plan está diseñado para que construyas desde los cimientos hacia afuera. Cada etapa te dejará con un progreso tangible y motivador.

#### **Etapa 0: La Cimentación (Duración: 2-3 días)**

**Objetivo:** Preparar el terreno. Al final de esta etapa, no tendrás páginas funcionales, pero tendrás un proyecto frontend profesional, limpio y listo para construir sobre él sin tener que preocuparte por la configuración más adelante.

**Tu Misión:**
1.  **Inicializar el Proyecto Next.js:**
    *   Dentro de tu carpeta `web/`, ejecuta `npx create-next-app@latest . --ts --tailwind --eslint`. (Si decidiste usar JS, omite `--ts`).
    *   Limpia la página de inicio por defecto para tener un lienzo en blanco.

2.  **Configurar la Estructura de Carpetas:**
    *   Crea la estructura de carpetas que definimos: `app/`, `components/` (con `ui/` y `features/` dentro), `lib/` (con `api/` y `hooks/` dentro).

3.  **Configurar `shadcn/ui`:**
    *   Sigue las instrucciones de instalación de `shadcn/ui`. Esto creará tu archivo `components.json` y preparará las utilidades de estilo.
    *   **Acción:** Instala tus primeros componentes básicos que usarás en todas partes: `button`, `input`, `card`.
        ```bash
        npx shadcn-ui@latest add button input card
        ```

4.  **Crear el Cliente de API Centralizado (Axios):**
    *   En `lib/api/`, crea un archivo `client.ts` (o `.js`).
    *   Configura una instancia de Axios con la URL base de tu API (`http://localhost:4000` para desarrollo).
    *   Configura un **interceptor** que automáticamente añada el `Authorization: Bearer [token]` a todas las peticiones si existe un token en `localStorage`.

5.  **Configurar SWR:**
    *   En el layout principal (`app/layout.tsx`), envuelve tu aplicación en el `<SWRConfig>`.
    *   Define una función `fetcher` global que use tu instancia de Axios para ser usada por SWR en toda la aplicación.

**Resultado al Finalizar:** Un esqueleto de proyecto robusto, con las herramientas listas, pero visualmente vacío.

---

#### **Etapa 1: La "Vidriera" - Autenticación y Visualización (Duración: 1 semana)**

**Objetivo:** Permitir que un usuario inicie sesión y vea el catálogo. Es la primera gran victoria visual.

**Tu Misión:**
1.  **Construir el Layout Principal:**
    *   Crea los componentes `Navbar.tsx` y `Footer.tsx` en `components/layout/`.
    *   La Navbar debe tener el logo, enlaces de navegación (aún no funcionales) y un espacio para el menú de usuario y el carrito (solo visual, sin lógica todavía).

2.  **Crear la Página de Login:**
    *   Construye el formulario de inicio de sesión en `app/(auth)/login/page.tsx`.
    *   Usa `React Hook Form` y `Zod` para la validación básica de los campos.
    *   Al enviar, llama al endpoint `POST /api/auth/login` usando tu cliente de Axios.
    *   Gestiona los estados de carga y muestra los errores de la API. Al tener éxito, guarda el token y redirige al usuario.

3.  **Implementar la Lógica de Autenticación Global:**
    *   Crea un `AuthContext` o un store de `Zustand` simple para almacenar el estado del usuario (`isLoggedIn`, `user_data`).
    *   Usa el hook `useSWR('/api/auth/me')` para obtener los datos del usuario si hay un token.
    *   Implementa rutas protegidas para que solo los usuarios logueados puedan acceder a las páginas principales.

4.  **Construir el Catálogo de Productos:**
    *   Crea la página `app/(main)/products/page.tsx`.
    *   Usa `useSWR('/api/products?page=1')` para obtener la primera página de productos.
    *   Crea un componente `ProductCard.tsx` para mostrar cada producto en una grilla.
    *   Implementa una paginación simple (botones "Siguiente" y "Anterior").
    *   Crea la página de detalle `app/(main)/products/[productId]/page.tsx` que usa `useSWR` para obtener los datos de un solo producto.

**Resultado al Finalizar:** Un usuario puede iniciar sesión, ver su nombre en la Navbar, navegar por el catálogo, ver los productos y sus precios correctos, y hacer logout. La aplicación se siente "real".

---

#### **Etapa 2: La Interacción - El Carrito de Compras (Duración: 1 semana)**

**Objetivo:** Hacer que la aplicación sea interactiva. El usuario ahora puede "elegir" productos.

**Tu Misión:**
1.  **Hacer Funcional el Botón "Añadir al Carrito":**
    *   En la página de detalle del producto, implementa la lógica del botón.
    *   Al hacer clic, debe llamar al endpoint `POST /api/cart/items`.
    *   Es crucial que uses el "mutador" de SWR (`mutate('/api/cart')`) después de la llamada para que los datos del carrito se actualicen automáticamente en toda la aplicación.

2.  **Crear un Store Global para el Carrito (Zustand):**
    *   Aunque los datos del carrito viven en el backend, tener un store en el frontend para el estado de la UI (ej: "¿está el panel del carrito abierto?") es muy útil.

3.  **Conectar el Icono del Carrito en la Navbar:**
    *   El contador de ítems junto al icono del carrito ahora debe reflejar la cantidad real de productos, obtenida con `useSWR('/api/cart')`.
    *   Al hacer clic, debe abrir un panel lateral o un desplegable que muestre un resumen del carrito.

4.  **Construir la Página del Carrito (`/cart`):**
    *   Esta página consume los datos de `GET /api/cart`.
    *   Muestra cada ítem del carrito en una fila.
    *   Implementa los botones para **actualizar la cantidad** y **eliminar un ítem**, llamando a los endpoints `PUT` y `DELETE` de la API y usando `mutate` de SWR para refrescar la vista.
    *   Muestra el resumen de totales y un botón prominente "Proceder al Pago".

**Resultado al Finalizar:** Un flujo de compra completo hasta el checkout. Los usuarios pueden gestionar activamente su selección de productos.

---

#### **Etapa 3: La Transacción - Checkout y Mi Cuenta (Duración: 1 semana)**

**Objetivo:** Cerrar el ciclo de compra y proporcionar al usuario las herramientas para ver su historial.

**Tu Misión:**
1.  **Construir la Página de Checkout (`/checkout`):**
    *   Crea el formulario para seleccionar el método de envío y la dirección.
    *   Usa `React Hook Form` y `Zod` para validar estos datos.
    *   Al enviar el formulario, llama al endpoint `POST /api/orders`.

2.  **Crear las Páginas de Resultado del Pedido:**
    *   Una página de éxito (`/orders/success/[orderId]`) a la que se redirige después de un pedido exitoso.
    *   (Opcional pero recomendado) Una página de error genérica (`/orders/error`).

3.  **Construir el Panel "Mi Cuenta":**
    *   Crea la página `app/(main)/account/page.tsx` que muestre los datos del cliente.
    *   Crea la página de historial de pedidos `app/(main)/account/orders/page.tsx`, que usa `useSWR` para llamar a `GET /api/account/orders` con paginación.
    *   Crea la página de detalle de un pedido `app/(main)/account/orders/[orderId].tsx`, que muestra todos los detalles de un pedido pasado.

**Resultado al Finalizar:** ¡Has completado el MVP! Un usuario puede realizar todo el ciclo: iniciar sesión, buscar, añadir al carrito, pagar y revisar sus pedidos anteriores.

