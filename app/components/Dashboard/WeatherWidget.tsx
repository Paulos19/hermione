"use client"

import { useEffect, useState } from "react"
import { Cloud, CloudRain, Sun, CloudLightning, CloudSnow, Wind } from "lucide-react"

interface WeatherData {
  temp: number
  humidity: number
  code: number
}

export function WeatherWidget({ lang }: { lang: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(true)
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code`)
          
          if (!res.ok) throw new Error("Weather API failed")
          
          const data = await res.json()
          setWeather({
            temp: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            code: data.current.weather_code,
          })
        } catch (err) {
          console.error("Failed to fetch weather", err)
          setError(true)
        } finally {
          setLoading(false)
        }
      },
      () => {
        // user denied or error
        setError(true)
        setLoading(false)
      }
    )
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-24 h-full animate-pulse">
        <div className="w-10 h-10 bg-[var(--theme-bg-surface-elevated)] rounded-full mb-3" />
        <div className="w-14 h-4 bg-[var(--theme-bg-surface-elevated)] rounded-full" />
      </div>
    )
  }

  if (error || !weather) {
    return null // Ocultar silenciosamente em caso de erro
  }

  // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
  const getWeatherIcon = (code: number) => {
    // Custom animations using Tailwind's arbitrary values or existing ones
    // animate-[spin_12s_linear_infinite] for Sun
    // animate-[bounce_3s_infinite] for Cloud
    if (code === 0 || code === 1) return <Sun className="w-10 h-10 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-[spin_10s_linear_infinite]" />
    if (code === 2 || code === 3) return <Cloud className="w-10 h-10 text-gray-400 drop-shadow-md animate-[pulse_3s_ease-in-out_infinite]" />
    if (code >= 51 && code <= 67) return <CloudRain className="w-10 h-10 text-blue-400 drop-shadow-md animate-bounce" />
    if (code >= 71 && code <= 77) return <CloudSnow className="w-10 h-10 text-slate-300 drop-shadow-md animate-pulse" />
    if (code >= 80 && code <= 82) return <CloudRain className="w-10 h-10 text-blue-500 drop-shadow-md animate-bounce" />
    if (code >= 95 && code <= 99) return <CloudLightning className="w-10 h-10 text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.6)] animate-[pulse_1s_ease-in-out_infinite]" />
    return <Sun className="w-10 h-10 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-[spin_10s_linear_infinite]" />
  }

  return (
    <div className="flex flex-col items-center justify-center transition-all duration-500 hover:scale-105 group cursor-default">
      <div className="mb-2 relative">
        <div className="absolute inset-0 bg-[var(--theme-bg-surface-elevated)] blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
        {getWeatherIcon(weather.code)}
      </div>
      <div className="text-[22px] font-bold text-[var(--theme-text-main)] leading-none mb-1.5 tracking-tight">
        {Math.round(weather.temp)}°C
      </div>
      <div className="text-[12px] font-medium text-[var(--theme-text-muted)] flex items-center gap-1.5 bg-[var(--theme-bg-surface-elevated)] px-2.5 py-0.5 rounded-full">
        <Wind className="w-3.5 h-3.5" />
        {weather.humidity}%
      </div>
    </div>
  )
}

