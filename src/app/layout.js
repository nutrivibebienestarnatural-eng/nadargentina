import './globals.css'

export const metadata = {
  title: 'Gestor Tienda Nube PRO',
  description: 'Sistema de gestión de pedidos y envíos',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-bg text-white antialiased">
        {children}
      </body>
    </html>
  )
}
