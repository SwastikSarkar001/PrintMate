"use client"
 
import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { Toaster } from "sonner"
 
export default function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      {children}
      <ToasterTheme />
    </NextThemesProvider>
  )
}

function ToasterTheme() {
  const { theme } = useTheme()
  return (
    <Toaster
      position='top-right'
      theme={theme as "light" | "dark" | "system" | undefined}
      richColors
      closeButton
      duration={6000}
    />
  )
}