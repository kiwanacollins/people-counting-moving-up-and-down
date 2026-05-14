import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { INITIAL_ZONES } from '../data/mockData'

const SimulationContext = createContext(null)

const HISTORY_LIMIT = 24

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function getSeverityFromPercent(percent, threshold) {
  if (percent >= 90) return 'critical'
  if (percent >= threshold) return 'warning'
  return 'info'
}

function buildPrediction(zone, history = []) {
  if (history.length < 2) {
    const currentPct = Math.round((zone.currentCount / zone.capacity) * 100)
    return {
      zoneId: zone.id,
      zoneName: zone.name,
      current: zone.currentCount,
      p15: zone.currentCount,
      p30: zone.currentCount,
      p60: zone.currentCount,
      confidence: 'Low',
      risk: getSeverityFromPercent(currentPct, zone.threshold),
      currentPercent: currentPct,
      p30Percent: currentPct,
      expectedBreach: currentPct >= zone.threshold,
    }
  }

  const recent = history.slice(-8)
  const deltas = []
  for (let i = 1; i < recent.length; i += 1) deltas.push(recent[i] - recent[i - 1])
  const avgDelta = deltas.reduce((s, d) => s + d, 0) / deltas.length
  const variance = deltas.reduce((s, d) => s + (d - avgDelta) ** 2, 0) / deltas.length
  const volatility = Math.sqrt(variance)

  const projected15 = clamp(Math.round(zone.currentCount + avgDelta * 5), 0, zone.capacity)
  const projected30 = clamp(Math.round(zone.currentCount + avgDelta * 10), 0, zone.capacity)
  const projected60 = clamp(Math.round(zone.currentCount + avgDelta * 20), 0, zone.capacity)

  const confidence = volatility <= 1.2 ? 'High' : volatility <= 2.5 ? 'Medium' : 'Low'
  const p30Percent = Math.round((projected30 / zone.capacity) * 100)
  const currentPercent = Math.round((zone.currentCount / zone.capacity) * 100)

  return {
    zoneId: zone.id,
    zoneName: zone.name,
    current: zone.currentCount,
    p15: projected15,
    p30: projected30,
    p60: projected60,
    confidence,
    risk: getSeverityFromPercent(p30Percent, zone.threshold),
    currentPercent,
    p30Percent,
    expectedBreach: p30Percent >= zone.threshold,
  }
}

// Module-level storage so messages survive user switches (logout → login)
let _sharedMessages = []
let _nextMessageId = 1

export function SimulationProvider({ children }) {
  const [zones, setZones] = useState(INITIAL_ZONES)
  const [zoneHistory, setZoneHistory] = useState(() =>
    Object.fromEntries(INITIAL_ZONES.map(zone => [zone.id, [zone.currentCount]])),
  )
  const [incidents, setIncidents] = useState([])
  const [messages, setMessages] = useState(_sharedMessages)
  const nextIncidentId = useRef(1)

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

  useEffect(() => {
    setZoneHistory(prev => {
      const next = { ...prev }
      zones.forEach(zone => {
        const existing = next[zone.id] || []
        next[zone.id] = [...existing, zone.currentCount].slice(-HISTORY_LIMIT)
      })
      return next
    })
  }, [zones])

  const predictions = zones.map(zone => buildPrediction(zone, zoneHistory[zone.id] || []))

  useEffect(() => {
    setIncidents(prev => {
      const next = [...prev]
      let created = false
      predictions.forEach(pred => {
        const hasOpenIncident = next.some(
          incident =>
            incident.zoneId === pred.zoneId &&
            incident.source === 'predicted' &&
            !['resolved', 'closed'].includes(incident.status),
        )
        if (!pred.expectedBreach || hasOpenIncident) return

        const now = new Date().toISOString()
        created = true
        next.push({
          id: nextIncidentId.current,
          zoneId: pred.zoneId,
          zoneName: pred.zoneName,
          severity: pred.risk === 'critical' ? 'critical' : 'warning',
          source: 'predicted',
          title: `Expected occupancy breach in ${pred.zoneName}`,
          description: `Forecast indicates ${pred.p30Percent}% occupancy in 30 minutes (threshold likely to be exceeded).`,
          status: 'new',
          owner: 'Unassigned',
          createdAt: now,
          acknowledgedAt: null,
          resolvedAt: null,
          slaDueAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          timeline: [
            {
              id: `${nextIncidentId.current}-evt-1`,
              at: now,
              actor: 'System',
              type: 'created',
              message: `Incident auto-created from prediction engine (${pred.p30Percent}% in 30 mins).`,
            },
          ],
        })
        nextIncidentId.current += 1
      })
      return created ? next : prev
    })
  }, [predictions])

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

  const updateIncident = (incidentId, changes, actor, eventType, eventMessage) => {
    const now = new Date().toISOString()
    setIncidents(prev =>
      prev.map(incident => {
        if (incident.id !== incidentId) return incident
        return {
          ...incident,
          ...changes,
          updatedAt: now,
          timeline: [
            ...incident.timeline,
            {
              id: `${incident.id}-evt-${incident.timeline.length + 1}`,
              at: now,
              actor,
              type: eventType,
              message: eventMessage,
            },
          ],
        }
      }),
    )
  }

  const assignIncident = (incidentId, owner, actor = 'Administrator') => {
    updateIncident(incidentId, { owner }, actor, 'assigned', `Assigned incident to ${owner}.`)
  }

  const setIncidentStatus = (incidentId, status, actor = 'Administrator') => {
    const now = new Date().toISOString()
    setIncidents(prev =>
      prev.map(incident => {
        if (incident.id !== incidentId) return incident
        const changes = { status, updatedAt: now }
        if (status === 'acknowledged' && !incident.acknowledgedAt) changes.acknowledgedAt = now
        if (status === 'resolved' && !incident.resolvedAt) changes.resolvedAt = now
        return {
          ...incident,
          ...changes,
          timeline: [
            ...incident.timeline,
            {
              id: `${incident.id}-evt-${incident.timeline.length + 1}`,
              at: now,
              actor,
              type: 'status',
              message: `Status changed to ${status}.`,
            },
          ],
        }
      }),
    )
  }

  const addIncidentNote = (incidentId, note, actor = 'Administrator') => {
    if (!note.trim()) return
    updateIncident(incidentId, {}, actor, 'note', note.trim())
  }

  const sendMessage = (from, to, text) => {
    if (!text.trim()) return
    const now = new Date().toISOString()
    const newMsg = {
      id: _nextMessageId,
      from,
      to,
      text: text.trim(),
      timestamp: now,
      read: false,
    }
    _nextMessageId += 1
    _sharedMessages = [..._sharedMessages, newMsg]
    setMessages(_sharedMessages)
  }

  const markMessagesAsRead = (messageIds) => {
    _sharedMessages = _sharedMessages.map(msg =>
      messageIds.includes(msg.id) ? { ...msg, read: true } : msg,
    )
    setMessages(_sharedMessages)
  }

  const incidentStats = (() => {
    const resolved = incidents.filter(i => i.resolvedAt)
    const withAck = incidents.filter(i => i.acknowledgedAt)
    const avgMs = values => {
      if (!values.length) return 0
      return Math.round(values.reduce((s, v) => s + v, 0) / values.length)
    }

    const mttaMs = avgMs(
      withAck.map(i => new Date(i.acknowledgedAt).getTime() - new Date(i.createdAt).getTime()),
    )
    const mttrMs = avgMs(
      resolved.map(i => new Date(i.resolvedAt).getTime() - new Date(i.createdAt).getTime()),
    )

    const predictedPrevented = incidents.filter(
      i => i.source === 'predicted' && ['resolved', 'closed'].includes(i.status),
    ).length

    return {
      total: incidents.length,
      active: incidents.filter(i => !['resolved', 'closed'].includes(i.status)).length,
      predictedPrevented,
      mttaMs,
      mttrMs,
    }
  })()

  return (
    <SimulationContext.Provider
      value={{
        zones,
        totalCount,
        alertCount,
        addZone,
        predictions,
        incidents,
        incidentStats,
        assignIncident,
        setIncidentStatus,
        addIncidentNote,
        messages,
        sendMessage,
        markMessagesAsRead,
      }}
    >
      {children}
    </SimulationContext.Provider>
  )
}

export const useSimulation = () => useContext(SimulationContext)
