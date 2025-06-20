import type { Metadata } from 'next'
import {
  ClerkProvider,
} from '@clerk/nextjs'
import "./global.css"
import SidebarLayout from '@/components/layouts/sidebar-layout';

export const metadata: Metadata = {
  title: 'Universidad Bethesda',
  description: 'Universidad Bethesda , una universidad cristiana que ofrece una educación de calidad y un ambiente acogedor para sus estudiantes.',
}
const localization = {
  signIn: {
    start: {
      title: "Inicia Sesión ",
      subtitle: "Accede a tu área de consultas"
    }
  }
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  // if(!user){
  //   return null;
  // }
  return (
    <ClerkProvider localization={localization} >
      <html lang="es" suppressHydrationWarning={true}>
        <head>
          <link
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
            rel="stylesheet"
          />
        </head>
        <body className={` antialiased`}>
         <SidebarLayout >
            {children}
          </SidebarLayout>
        </body>
      </html>
    </ClerkProvider>
  )
}