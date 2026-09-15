import './globals.css'

export const metadata = {
  title: 'Quel voyageur Boss êtes-vous ?',
  description: 'Expérience interactive Les Boss - Tour du Monde des Entrepreneurs'
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
