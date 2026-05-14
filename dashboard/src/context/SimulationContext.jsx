import { createContext, useContext, useEffect, useState } from 'react'
import { INITIAL_ZONES } from '../data/mockData'

const SimulationContext = createContext(null)

export function SimulationProvider({ children }) {
  const [zones, setZones] = useState(INITIAL_ZONES)

  useEffect(() => {
    const id = setInterval(() => {
      setZones(prev =>
        prev.map(zone => {
          // Random delta biased slightly positive to simulate active campus
          const delta = Math.round((Math.random() - 0.46) * 8)
          const newCount = Math.max(0, Math.min(zone.capacity, zone.currentCount + delta))
          const actual = newCount - zone.currentCount
          return {
            ...zone,
            currentCount: newCount,
            inCount:  actual > 0 ? zone.inCount  + actual          : zone.inCount,
            outCount: actual < 0 ? zone.outCount + Math.abs(actual) : zone.outCount,
          }
        }),
      )
    }, 2000)
    return () => clearInterval(id)
  }, [])

  const totalCount   = zones.reduce((s, z) => s + z.currentCount, 0)
  const alertCount   = zones.filter(z => (z.currentCount / z.capacity) * 100 >= z.threshold).length

  const addZone = (zoneInput) => {
    setZones(prev => {
      const nextId = prev.length ? Math.max(...prev.map(z => z.id)) + 1 : 1
      const safeCapacity = Number(zoneInput.capacity) || 1
      const initialCount = Math.max(0, Math.min(Number(zoneInput.currentCount) || 0, safeCapacity))
      return [
        ...prev,
        {
          id: nextId,
          name: zoneInput.name.trim(),
          shortName: (zoneInput.shortName || zoneInput.name).trim(),
          location: zoneInput.location.trim(),
          camera: zoneInput.camera.trim().toUpperCase(),
          capacity: safeCapacity,
          currentCount: initialCount,
          inCount: Number(zoneInput.inCount) || 0,
          outCount: Number(zoneInput.outCount) || 0,
          threshold: Number(zoneInput.threshold) || 80,
        },
      ]
    })
  }

  return (
    <SimulationContext.Provider value={{ zones, totalCount, alertCount, addZone }}>
      {children}
    </SimulationContext.Provider>
  )
}

export const useSimulation = () => useContext(SimulationContext)
