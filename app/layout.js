import './globals.css'

export const metadata = {
  title: 'Internal Audit Tree Explorer',
  description: 'Navigate through the internal audit taxonomy hierarchy',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}