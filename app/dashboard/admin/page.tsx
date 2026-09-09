'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { OWNER_EMAIL, isPlatformOwner } from '@/lib/admin-owner'
import {
  Shield,
  Users,
  PackageCheck,
  Headphones,
  DollarSign,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  ExternalLink,
  Filter,
  RefreshCw,
  AlertCircle,
  Lock,
  ChevronRight,
  Sliders,
  Check,
} from 'lucide-react'

type UserRecord = {
  id: string
  name: string
  email: string
  role: string
  joined: string
  status: 'active' | 'pending' | 'verified'
}

type ProductApproval = {
  id: string
  name: string
  seller: string
  submitted: string
  status: 'pending' | 'approved' | 'rejected'
}

type Complaint = {
  id: string
  subject: string
  name?: string
  email?: string
  from: string
  message?: string
  status: 'open' | 'resolved'
  created_at?: string
}

type TabKey = 'overview' | 'users' | 'products' | 'complaints' | 'escrow'

export default function AdminCommandCenter() {
  const router = useRouter()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [users, setUsers] = useState<UserRecord[]>([])
  const [products, setProducts] = useState<ProductApproval[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [toastMsg, setToastMsg] = useState('')

  // Search & Filter state
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all')
  const [productSearch, setProductSearch] = useState('')
  const [productStatusFilter, setProductStatusFilter] = useState<string>('all')
  const [complaintSearch, setComplaintSearch] = useState('')
  const [complaintStatusFilter, setComplaintStatusFilter] = useState<string>('all')

  async function loadAdminData() {
    setLoading(true)
    try {
      // 1. Fetch real profiles
      const { data: dbProfiles, error: profilesErr } = await supabase
        .from('profiles')
        .select('id, email, role, full_name, created_at, is_verified')
        .order('created_at', { ascending: false })

      if (profilesErr) {
        console.error('Failed to load user profiles:', profilesErr)
        showToast(`⚠️ Failed to load user profiles: ${profilesErr.message}`)
        setUsers([])
      } else {
        const formattedUsers: UserRecord[] = (dbProfiles || []).map((p: any) => ({
          id: p.id,
          name: p.full_name || p.email?.split('@')[0] || 'PrintHive User',
          email: p.email || 'user@printhive.com',
          role: p.role || 'buyer',
          joined: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '2026-08-01',
          status: p.is_verified ? 'verified' : (p.role === 'printer_owner' || p.role === 'seller' ? 'pending' : 'active'),
        }))
        setUsers(formattedUsers)
      }

      // 2. Fetch real products
      const { data: dbProducts, error: productsErr } = await supabase
        .from('products')
        .select('id, title, name, seller, seller_name, created_at, status')
        .order('created_at', { ascending: false })

      if (productsErr) {
        console.error('Failed to load product queue:', productsErr)
        showToast(`⚠️ Failed to load product catalog: ${productsErr.message}`)
        setProducts([])
      } else {
        const formattedProducts: ProductApproval[] = (dbProducts || []).map((prod: any) => ({
          id: prod.id,
          name: prod.title || prod.name || '3D Printed Product',
          seller: prod.seller || prod.seller_name || 'Store Seller',
          submitted: prod.created_at ? new Date(prod.created_at).toISOString().split('T')[0] : '2026-08-01',
          status: prod.status === 'rejected' ? 'rejected' : prod.status === 'pending' ? 'pending' : 'approved',
        }))
        setProducts(formattedProducts)
      }

      // 3. Fetch real complaints
      const res = await fetch('/api/contact')
      if (!res.ok) {
        showToast(`⚠️ Failed to fetch complaints (HTTP ${res.status})`)
        setComplaints([])
        return
      }
      const data = await res.json()
      if (data.success && data.complaints) {
        const formatted = data.complaints.map((c: any) => ({
          id: c.id,
          subject: c.subject,
          name: c.name || c.email?.split('@')[0] || 'User',
          email: c.email,
          from: `${c.name || 'User'} (${c.email})`,
          message: c.message,
          status: c.status || 'open',
          created_at: c.created_at,
        }))
        setComplaints(formatted)
      }
    } catch (err: any) {
      console.error('Failed to load admin operations hub data:', err)
      showToast(`⚠️ Error loading operations data: ${err?.message || 'Network error'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const handleSignOut = async () => {
    document.cookie = 'printhive_guest_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    document.cookie = 'printhive_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 4000)
  }

  const handleVerifyUser = async (userId: string, userName: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ is_verified: true }).eq('id', userId)
      if (error) throw error
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: 'verified' } : u))
      )
      showToast(`✅ ${userName} verified and approved on PrintHive network!`)
    } catch (err: any) {
      showToast(`❌ Verification failed: ${err.message || 'Database update error'}`)
    }
  }

  const handleApproveProduct = async (prodId: string, prodName: string) => {
    try {
      const { error } = await supabase.from('products').update({ status: 'approved' }).eq('id', prodId)
      if (error) throw error
      setProducts((prev) =>
        prev.map((p) => (p.id === prodId ? { ...p, status: 'approved' } : p))
      )
      showToast(`✅ ${prodName} approved and published to live marketplace!`)
    } catch (err: any) {
      showToast(`❌ Approval failed: ${err.message || 'Database update error'}`)
    }
  }

  const handleRejectProduct = async (prodId: string, prodName: string) => {
    try {
      const { error } = await supabase.from('products').update({ status: 'rejected' }).eq('id', prodId)
      if (error) throw error
      setProducts((prev) =>
        prev.map((p) => (p.id === prodId ? { ...p, status: 'rejected' } : p))
      )
      showToast(`❌ ${prodName} returned for modification.`)
    } catch (err: any) {
      showToast(`❌ Rejection failed: ${err.message || 'Database update error'}`)
    }
  }

  const handleResolveComplaint = async (compId: string) => {
    const previousComplaint = complaints.find((c) => c.id === compId)
    const previousStatus = previousComplaint?.status || 'open'

    setComplaints((prev) =>
      prev.map((c) => (c.id === compId ? { ...c, status: 'resolved' } : c))
    )
    try {
      const res = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: compId, status: 'resolved' }),
      })
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`)
      }
      showToast(`✅ Contact support ticket resolved and closed.`)
    } catch (e: any) {
      setComplaints((prev) =>
        prev.map((c) => (c.id === compId ? { ...c, status: previousStatus } : c))
      )
      showToast(`❌ Failed to update ticket: ${e?.message || 'Network error'}. Status reverted.`)
    }
  }

  // Filtered lists
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter
      return matchesSearch && matchesRole
    })
  }, [users, userSearch, userRoleFilter])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.seller.toLowerCase().includes(productSearch.toLowerCase())
      const matchesStatus = productStatusFilter === 'all' || p.status === productStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [products, productSearch, productStatusFilter])

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        c.subject.toLowerCase().includes(complaintSearch.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(complaintSearch.toLowerCase()) ||
        (c.message || '').toLowerCase().includes(complaintSearch.toLowerCase())
      const matchesStatus = complaintStatusFilter === 'all' || c.status === complaintStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [complaints, complaintSearch, complaintStatusFilter])

  const pendingVerificationsCount = users.filter((u) => u.status === 'pending').length
  const pendingProductsCount = products.filter((p) => p.status === 'pending').length
  const openComplaintsCount = complaints.filter((c) => c.status === 'open').length

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    users.forEach((u) => {
      counts[u.role] = (counts[u.role] || 0) + 1
    })
    return counts
  }, [users])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#070B16',
        color: '#F8FAFC',
        fontFamily: 'inherit',
        backgroundImage:
          'radial-gradient(circle at 15% 10%, rgba(234, 88, 12, 0.08) 0%, transparent 40%), radial-gradient(circle at 85% 20%, rgba(59, 130, 246, 0.06) 0%, transparent 40%)',
      }}
    >
      {/* ========================================================
          1. DEDICATED OPERATIONS COMMAND HEADER
      ======================================================== */}
      <header
        style={{
          background: 'rgba(11, 17, 33, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '0 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {/* Brand & Telemetry Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #EA580C 0%, #9A3412 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(234, 88, 12, 0.4)',
                }}
              >
                <Shield size={22} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px', color: '#FFFFFF' }}>
                    Print<span style={{ color: '#EA580C' }}>Hive</span>
                  </span>
                  <span
                    style={{
                      background: 'rgba(234, 88, 12, 0.15)',
                      border: '1px solid rgba(234, 88, 12, 0.3)',
                      color: '#EA580C',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 99,
                      letterSpacing: 0.8,
                      textTransform: 'uppercase',
                    }}
                  >
                    Command Center
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
                  Master Administrative Console
                </div>
              </div>
            </div>

            {/* Live Telemetry Pills */}
            <div className="admin-telemetry-pills">
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#10B981',
                  padding: '4px 10px',
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                OPERATIONAL
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  color: '#60A5FA',
                  padding: '4px 10px',
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                <Lock size={11} />
                ESCROW SHIELD 70/15/15
              </div>
            </div>
          </div>

          {/* Right Action Cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Refresh Data Button */}
            <button
              type="button"
              onClick={loadAdminData}
              title="Refresh Live Telemetry"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94A3B8',
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Sync</span>
            </button>

            {/* Link to Public Marketplace */}
            <Link
              href="/"
              target="_blank"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#CBD5E1',
                borderRadius: 10,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>Public Store</span>
              <ExternalLink size={13} color="#94A3B8" />
            </Link>

            {/* Admin Profile Chip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '4px 12px 4px 6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 99,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 900,
                  color: '#FFFFFF',
                }}
              >
                P
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#FFFFFF' }}>Prince M Mandal</div>
                <div style={{ fontSize: 10, color: '#EA580C', fontWeight: 700 }}>PLATFORM OWNER</div>
              </div>
            </div>

            {/* Secure Sign Out */}
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171',
                borderRadius: 10,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          2. TOAST NOTIFICATION
      ======================================================== */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: 88,
            right: 24,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(234, 88, 12, 0.4)',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 13,
            boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(234, 88, 12, 0.2)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================
          3. MAIN WORKSPACE CONTAINER
      ======================================================== */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px 80px' }}>
        {/* KPI TELEMETRY GRID */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            marginBottom: 28,
          }}
        >
          {/* KPI 1: Users */}
          <div
            onClick={() => setActiveTab('users')}
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 18,
              padding: '20px 22px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Network Profiles
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#FFFFFF', marginTop: 6, letterSpacing: '-0.5px' }}>
                  {users.length}
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} color="#60A5FA" />
              </div>
            </div>
            <div style={{ marginTop: 14, fontSize: 11.5, color: '#64748B', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span>{roleCounts['buyer'] || 0} Buyers</span> • 
              <span>{roleCounts['seller'] || 0} Sellers</span> • 
              <span>{roleCounts['printer_owner'] || 0} Hubs</span>
            </div>
          </div>

          {/* KPI 2: Pending Verifications */}
          <div
            onClick={() => setActiveTab('users')}
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: `1px solid ${pendingVerificationsCount > 0 ? 'rgba(234, 88, 12, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: 18,
              padding: '20px 22px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Pending KYC Verifications
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: pendingVerificationsCount > 0 ? '#EA580C' : '#10B981',
                    marginTop: 6,
                    letterSpacing: '-0.5px',
                  }}
                >
                  {pendingVerificationsCount}
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(234, 88, 12, 0.12)', border: '1px solid rgba(234, 88, 12, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} color="#EA580C" />
              </div>
            </div>
            <div style={{ marginTop: 14, fontSize: 11.5, color: pendingVerificationsCount > 0 ? '#FB923C' : '#10B981', fontWeight: 700 }}>
              {pendingVerificationsCount > 0 ? 'Action required in User Control' : 'All accounts verified'}
            </div>
          </div>

          {/* KPI 3: Product Approvals */}
          <div
            onClick={() => setActiveTab('products')}
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 18,
              padding: '20px 22px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Catalog Review Queue
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#FFFFFF', marginTop: 6, letterSpacing: '-0.5px' }}>
                  {products.length}
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PackageCheck size={20} color="#34D399" />
              </div>
            </div>
            <div style={{ marginTop: 14, fontSize: 11.5, color: '#64748B' }}>
              <span style={{ color: pendingProductsCount > 0 ? '#EA580C' : '#10B981', fontWeight: 700 }}>
                {pendingProductsCount} pending approval
              </span>
            </div>
          </div>

          {/* KPI 4: Support Tickets */}
          <div
            onClick={() => setActiveTab('complaints')}
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: `1px solid ${openComplaintsCount > 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: 18,
              padding: '20px 22px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Support &amp; Complaints
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: openComplaintsCount > 0 ? '#EF4444' : '#10B981',
                    marginTop: 6,
                    letterSpacing: '-0.5px',
                  }}
                >
                  {openComplaintsCount}
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Headphones size={20} color="#F87171" />
              </div>
            </div>
            <div style={{ marginTop: 14, fontSize: 11.5, color: openComplaintsCount > 0 ? '#F87171' : '#10B981', fontWeight: 700 }}>
              {openComplaintsCount > 0 ? `${openComplaintsCount} open inquiries awaiting resolution` : 'All inquiries resolved'}
            </div>
          </div>
        </section>

        {/* ========================================================
            4. WORKSPACE NAVIGATION TABS
        ======================================================== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 24,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: 12,
            overflowX: 'auto',
          }}
        >
          {[
            { key: 'overview', label: 'Overview Telemetry', icon: Shield },
            { key: 'users', label: `User Management (${users.length})`, icon: Users },
            { key: 'products', label: `Product Approvals (${products.length})`, icon: PackageCheck },
            { key: 'complaints', label: `Support Desk (${complaints.length})`, icon: Headphones },
            { key: 'escrow', label: 'Escrow & Financials', icon: DollarSign },
          ].map(({ key, label, icon: TabIcon }) => {
            const isSelected = activeTab === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key as TabKey)}
                style={{
                  background: isSelected ? 'rgba(234, 88, 12, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? '1px solid rgba(234, 88, 12, 0.4)' : '1px solid transparent',
                  color: isSelected ? '#FFFFFF' : '#94A3B8',
                  padding: '10px 18px',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <TabIcon size={16} color={isSelected ? '#EA580C' : '#64748B'} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>

        {/* ========================================================
            TAB 1: OVERVIEW TELEMETRY & SYSTEM PULSE
        ======================================================== */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
            {/* Quick Actions Card */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 20,
                padding: 24,
              }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF', margin: '0 0 16px 0' }}>
                Operational Launchpad
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    color: '#F8FAFC',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Users size={18} color="#EA580C" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800 }}>Audit Network User Directory</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>Review verification statuses and roles</div>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#64748B" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    color: '#F8FAFC',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <PackageCheck size={18} color="#10B981" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800 }}>Marketplace Catalog Moderation</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{pendingProductsCount} items pending approval</div>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#64748B" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('complaints')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    color: '#F8FAFC',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Headphones size={18} color="#EF4444" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800 }}>Support &amp; Dispute Resolution Desk</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{openComplaintsCount} open customer complaints</div>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#64748B" />
                </button>
              </div>
            </div>

            {/* Platform Security Protocol Status */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 20,
                padding: 24,
              }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF', margin: '0 0 16px 0' }}>
                Cryptographic Security &amp; Escrow Health
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: 'rgba(2, 6, 23, 0.6)', borderRadius: 12, padding: '12px 16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#94A3B8' }}>Master Authentication Gateway</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} /> LOCKED TO OWNER
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 4 }}>
                    Exclusive entry at <code>/admin/login</code> reserved for <code>{OWNER_EMAIL}</code>.
                  </div>
                </div>

                <div style={{ background: 'rgba(2, 6, 23, 0.6)', borderRadius: 12, padding: '12px 16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#94A3B8' }}>Escrow Split Math Verification</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} /> 70/15/15 ENFORCED
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 4 }}>
                    Printer: 70% | Platform Fee: 15% | Designer Royalty: 15% with zero-sum rounding conservation.
                  </div>
                </div>

                <div style={{ background: 'rgba(2, 6, 23, 0.6)', borderRadius: 12, padding: '12px 16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#94A3B8' }}>Demo Access Protection</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} /> DISABLED FOR ADMIN
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 4 }}>
                    All guest role switchers forbid administrative access; unauthenticated callers are redirected.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: USER MANAGEMENT & KYC VERIFICATION
        ======================================================== */}
        {activeTab === 'users' && (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 20,
              padding: 24,
            }}
          >
            {/* Table Controls Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                  Network Accounts &amp; Identity Verification
                </h2>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                  Showing {filteredUsers.length} of {users.length} registered user profiles
                </div>
              </div>

              {/* Filters & Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {/* Role Filter Chips */}
                <div style={{ display: 'flex', background: 'rgba(2, 6, 23, 0.6)', padding: 4, borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  {['all', 'buyer', 'seller', 'designer', 'printer_owner', 'admin'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setUserRoleFilter(r)}
                      style={{
                        background: userRoleFilter === r ? '#EA580C' : 'transparent',
                        color: userRoleFilter === r ? '#FFFFFF' : '#94A3B8',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {r === 'printer_owner' ? 'Hubs' : r}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative' }}>
                  <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 10,
                      padding: '8px 14px 8px 36px',
                      fontSize: 13,
                      color: '#FFFFFF',
                      outline: 'none',
                      minWidth: 220,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>User Account</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>Platform Role</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>Registered Date</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>KYC Status</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>Verification Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 48, textAlign: 'center', color: '#64748B', fontSize: 14 }}>
                        No user accounts matched the active search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isOwner = isPlatformOwner(u.email)
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.15s' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: '50%',
                                  background: isOwner ? '#EA580C' : '#1E293B',
                                  color: '#FFFFFF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 13,
                                  fontWeight: 800,
                                }}
                              >
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#FFFFFF' }}>
                                  {u.name} {isOwner && <span style={{ fontSize: 10, background: 'rgba(234, 88, 12, 0.2)', color: '#EA580C', padding: '2px 6px', borderRadius: 4, marginLeft: 4 }}>OWNER</span>}
                                </div>
                                <div style={{ fontSize: 12, color: '#94A3B8' }}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                background:
                                  u.role === 'admin'
                                    ? 'rgba(234, 88, 12, 0.2)'
                                    : u.role === 'printer_owner'
                                    ? 'rgba(59, 130, 246, 0.15)'
                                    : u.role === 'seller'
                                    ? 'rgba(168, 85, 247, 0.15)'
                                    : u.role === 'designer'
                                    ? 'rgba(236, 72, 153, 0.15)'
                                    : 'rgba(255, 255, 255, 0.06)',
                                color:
                                  u.role === 'admin'
                                    ? '#FB923C'
                                    : u.role === 'printer_owner'
                                    ? '#60A5FA'
                                    : u.role === 'seller'
                                    ? '#C084FC'
                                    : u.role === 'designer'
                                    ? '#F472B6'
                                    : '#CBD5E1',
                                padding: '4px 10px',
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                              }}
                            >
                              {u.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: 13, color: '#94A3B8' }}>
                            {u.joined}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '4px 10px',
                                borderRadius: 99,
                                fontSize: 11.5,
                                fontWeight: 800,
                                background:
                                  u.status === 'verified'
                                    ? 'rgba(16, 185, 129, 0.12)'
                                    : u.status === 'pending'
                                    ? 'rgba(234, 88, 12, 0.15)'
                                    : 'rgba(255, 255, 255, 0.06)',
                                color:
                                  u.status === 'verified'
                                    ? '#34D399'
                                    : u.status === 'pending'
                                    ? '#FB923C'
                                    : '#94A3B8',
                              }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                              {u.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {u.status === 'pending' ? (
                              <button
                                type="button"
                                onClick={() => handleVerifyUser(u.id, u.name)}
                                style={{
                                  background: '#EA580C',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: 8,
                                  padding: '6px 14px',
                                  fontSize: 12,
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
                                  transition: 'all 0.15s',
                                }}
                              >
                                Verify &amp; Approve
                              </button>
                            ) : (
                              <span style={{ fontSize: 12, color: '#34D399', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Check size={14} /> Verified Account
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: PRODUCT APPROVAL QUEUE
        ======================================================== */}
        {activeTab === 'products' && (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 20,
              padding: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                  Marketplace Product Review &amp; Moderation
                </h2>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                  Verify catalog submissions before live listing publication
                </div>
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', background: 'rgba(2, 6, 23, 0.6)', padding: 4, borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  {['all', 'pending', 'approved', 'rejected'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setProductStatusFilter(st)}
                      style={{
                        background: productStatusFilter === st ? '#EA580C' : 'transparent',
                        color: productStatusFilter === st ? '#FFFFFF' : '#94A3B8',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative' }}>
                  <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search product or seller..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    style={{
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 10,
                      padding: '8px 14px 8px 36px',
                      fontSize: 13,
                      color: '#FFFFFF',
                      outline: 'none',
                      minWidth: 200,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>Product Title</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>Seller / Creator</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>Submitted Date</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>Status</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>Moderation Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 48, textAlign: 'center', color: '#64748B', fontSize: 14 }}>
                        No product listings found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 800, color: '#FFFFFF' }}>{p.name}</td>
                        <td style={{ padding: '14px 16px', color: '#94A3B8', fontSize: 13 }}>{p.seller}</td>
                        <td style={{ padding: '14px 16px', color: '#64748B', fontSize: 13 }}>{p.submitted}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: 99,
                              fontSize: 11.5,
                              fontWeight: 800,
                              background:
                                p.status === 'approved'
                                  ? 'rgba(16, 185, 129, 0.12)'
                                  : p.status === 'rejected'
                                  ? 'rgba(239, 68, 68, 0.12)'
                                  : 'rgba(234, 88, 12, 0.15)',
                              color:
                                p.status === 'approved'
                                  ? '#34D399'
                                  : p.status === 'rejected'
                                  ? '#F87171'
                                  : '#FB923C',
                            }}
                          >
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {p.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                type="button"
                                onClick={() => handleApproveProduct(p.id, p.name)}
                                style={{
                                  background: '#10B981',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: 8,
                                  padding: '6px 14px',
                                  fontSize: 12,
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                }}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectProduct(p.id, p.name)}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  color: '#F87171',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  borderRadius: 8,
                                  padding: '6px 14px',
                                  fontSize: 12,
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: p.status === 'approved' ? '#34D399' : '#F87171', fontWeight: 800 }}>
                              {p.status === 'approved' ? 'Active in Shop ✓' : 'Rejected'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: SUPPORT DESK & DISPUTES
        ======================================================== */}
        {activeTab === 'complaints' && (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 20,
              padding: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                  Customer Support Inquiries &amp; Complaints
                </h2>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                  Review and resolve inquiries submitted through the Help Center
                </div>
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', background: 'rgba(2, 6, 23, 0.6)', padding: 4, borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  {['all', 'open', 'resolved'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setComplaintStatusFilter(st)}
                      style={{
                        background: complaintStatusFilter === st ? '#EA580C' : 'transparent',
                        color: complaintStatusFilter === st ? '#FFFFFF' : '#94A3B8',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative' }}>
                  <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search subject or email..."
                    value={complaintSearch}
                    onChange={(e) => setComplaintSearch(e.target.value)}
                    style={{
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 10,
                      padding: '8px 14px 8px 36px',
                      fontSize: 13,
                      color: '#FFFFFF',
                      outline: 'none',
                      minWidth: 200,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>Subject</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>Sender Info</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>Message Body</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>Status</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 48, textAlign: 'center', color: '#64748B', fontSize: 14 }}>
                        No support tickets match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 800, color: '#FFFFFF', maxWidth: 220 }}>{c.subject}</td>
                        <td style={{ padding: '14px 16px', color: '#94A3B8', fontSize: 12, maxWidth: 200 }}>
                          <div style={{ color: '#FFFFFF', fontWeight: 700 }}>{c.name || 'User'}</div>
                          <div>{c.email}</div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#CBD5E1', fontSize: 12.5, lineHeight: 1.5, maxWidth: 360 }}>
                          {c.message || 'Support ticket submitted through website.'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: 99,
                              fontSize: 11.5,
                              fontWeight: 800,
                              background: c.status === 'resolved' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                              color: c.status === 'resolved' ? '#34D399' : '#F87171',
                            }}
                          >
                            {c.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {c.status === 'open' ? (
                            <button
                              type="button"
                              onClick={() => handleResolveComplaint(c.id)}
                              style={{
                                background: '#EA580C',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: 8,
                                padding: '6px 14px',
                                fontSize: 12,
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
                              }}
                            >
                              Resolve Ticket
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: '#34D399', fontWeight: 800 }}>
                              Resolved ✓
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: ESCROW & FINANCIAL OVERSIGHT
        ======================================================== */}
        {activeTab === 'escrow' && (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 20,
              padding: 24,
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0' }}>
              Escrow Distribution Architecture &amp; Financial Shield
            </h2>
            <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>
              All PrintHive transactions enforce automated tripartite escrow holding and cryptographic release upon delivery confirmation.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 28 }}>
              <div style={{ background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Printer Owner Allocation
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#FFFFFF', marginTop: 6 }}>
                  70%
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8 }}>
                  Covers filament materials, machine run-time depreciation, packaging, and local dispatch fulfillment.
                </div>
              </div>

              <div style={{ background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(234, 88, 12, 0.3)', borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Platform Operations Fee
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#FFFFFF', marginTop: 6 }}>
                  15%
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8 }}>
                  Funds payment gateway processing, AI slicing computation, infrastructure, and dispute resolution.
                </div>
              </div>

              <div style={{ background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#C084FC', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Designer Royalty Allocation
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#FFFFFF', marginTop: 6 }}>
                  15%
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8 }}>
                  Direct creator royalty for publishing digital 3D STL &amp; 3MF models to the marketplace.
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#34D399', fontWeight: 800, fontSize: 14, marginBottom: 4 }}>
                <CheckCircle2 size={18} /> Exact Sum Conservation Proof Active
              </div>
              <div style={{ fontSize: 12.5, color: '#CBD5E1', lineHeight: 1.6 }}>
                Every financial transaction enforces strict server-derived arithmetic guaranteeing that Printer Share (70%) + Platform Fee (15%) + Designer Royalty (15%) exactly conserves 100% of the customer order price without rounding leakage.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}