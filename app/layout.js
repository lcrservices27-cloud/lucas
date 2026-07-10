import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

export const metadata = {
  title: 'Pipeline — Lucas AI',
  description: 'Dashboard interno de prospecção — Lucas AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
