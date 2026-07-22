"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type ThemeType = "light" | "dark" | "ocean" | "dracula" | "sunset" | "desert"

interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>("dark")

  useEffect(() => {
    // Load saved theme on mount
    const savedTheme = localStorage.getItem("hermione-theme") as ThemeType
    if (savedTheme) {
      setThemeState(savedTheme)
    }
  }, [])

  useEffect(() => {
    // Apply theme to document element
    const root = document.documentElement
    
    // Remove all old theme classes (if any, like 'dark')
    root.classList.remove("light", "dark", "ocean", "dracula", "sunset", "desert")
    
    // Add current theme class (used for Tailwind variants if needed)
    root.classList.add(theme)
    
    // Set data-theme attribute
    root.setAttribute("data-theme", theme)
    
  }, [theme])

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme)
    localStorage.setItem("hermione-theme", newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
