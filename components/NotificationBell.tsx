'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

type NotificationItem = {
  id: string
  title: string
  message: string
  type: 'info' | 'order' | 'bid' | 'payment' | 'payout' | 'system'
  link?: string
  is_read: boolean
  created_at: string
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getIcon(type: string): string {
  switch (type) {
    case 'order': return '📦'
    case 'bid': return '🎨'
    case 'payment': return '💳'
    case 'payout': return '💰'
    case 'system': return '⚙️'
    default: return '🔔'
  }
}

export default function NotificationBell() {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setNotifications(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
        }
      }
    } catch {
      // Ignore network errors silently
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 25000) // Poll every 25 seconds
    return () => clearInterval(interval)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkSingleRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking single notification read:', err)
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      {/* BELL TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '8px 12px',
          fontSize: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0F172A',
          transition: 'transform 0.2s',
        }}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: 900,
              borderRadius: 99,
              height: 18,
              minWidth: 18,
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
              border: '2px solid #FFFFFF',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* NOTIFICATIONS DROPDOWN MENU */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 48,
            width: 360,
            maxHeight: 460,
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            borderRadius: 20,
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.12)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* HEADER */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#FAF8F5',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: '#0F172A' }}>Notifications</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: '#FF6B35',
                    color: '#FFF',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 99,
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FF6B35',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* NOTIFICATION LIST */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94A3B8' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔕</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#475569' }}>No notifications yet</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>We'll notify you when orders or bids update!</div>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.is_read && handleMarkSingleRead(item.id)}
                  style={{
                    padding: '12px 18px',
                    background: item.is_read ? 'transparent' : '#FFF7ED',
                    borderBottom: '1px solid #F1F5F9',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{ fontSize: 20, marginTop: 2 }}>{getIcon(item.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: item.is_read ? 700 : 900,
                          color: '#0F172A',
                        }}
                      >
                        {item.title}
                      </div>
                      <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>
                        {timeAgo(item.created_at)}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.4, marginBottom: 4 }}>
                      {item.message}
                    </div>
                    {item.link && (
                      <Link
                        href={item.link}
                        onClick={() => setIsOpen(false)}
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: '#FF6B35',
                          textDecoration: 'none',
                          display: 'inline-block',
                          marginTop: 2,
                        }}
                      >
                        View details →
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
