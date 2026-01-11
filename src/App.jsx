import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'

// ==================== SUPABASE CONFIG ====================
const SUPABASE_URL = 'https://tqxrahpbidlctyttpffc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxeHJhaHBiaWRsY3R5dHRwZmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTk3MzQsImV4cCI6MjA4MzQzNTczNH0.tmh9_GzWJhIcRoS3L6gpCX95_eZrkIR7hy3gOl9Qd2s'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ============== ICONS ==============
const Icons = {
  Sparkles: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
    </svg>
  ),
  Message: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Zap: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Users: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Target: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Play: () => (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Linkedin: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  Twitter: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  ),
  Facebook: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  Instagram: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  Plus: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Minus: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  X: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// ============== BACKGROUND ==============
const BackgroundAnimation = () => {
  const { scrollY } = useScroll()
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-green-500/10 rounded-full blur-[120px]" style={{ y: useTransform(scrollY, [0, 1000], [0, 100]) }} animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" style={{ y: useTransform(scrollY, [0, 1000], [0, -50]) }} animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} />
      <motion.div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px]" style={{ y: useTransform(scrollY, [0, 1000], [0, 150]) }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 12, repeat: Infinity, delay: 4 }} />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:50px_50px]" />
      {[...Array(5)].map((_, i) => (
        <motion.div key={i} className="absolute w-1 h-1 bg-green-500 rounded-full" style={{ left: `${20 + i * 15}%`, top: `${10 + i * 20}%` }} animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }} />
      ))}
    </div>
  )
}

// ============== NAVBAR ==============
const Navbar = ({ onOpenModal, currentPage, setCurrentPage }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'מוצר', dropdown: [{ label: 'איך זה עובד', page: 'how-it-works' }, { label: 'תכונות', page: 'features' }, { label: 'אינטגרציות', page: 'integrations' }] },
    { label: 'פתרונות', dropdown: [{ label: 'לעסקים קטנים', page: 'solutions' }, { label: 'למספרות ויופי', page: 'solutions' }, { label: 'ליועצים ומאמנים', page: 'solutions' }] },
    { label: 'בלוג', page: 'blog' },
    { label: 'אודות', page: 'about' },
  ]

  return (
    <motion.nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-3 bg-slate-950/80 backdrop-blur-lg border-b border-white/10' : 'py-5 bg-transparent'}`} initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <motion.div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentPage('home')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:shadow-green-500/50 transition-shadow"><Icons.Message /></div>
          <span className="text-2xl font-black tracking-tight">Easy<span className="text-green-500">chat</span></span>
        </motion.div>
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item, i) => (
            item.dropdown ? (
              <div key={i} className="dropdown relative">
                <button className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors font-medium">{item.label}<Icons.ChevronDown /></button>
                <div className="dropdown-menu">{item.dropdown.map((subItem, j) => (<a key={j} href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); setCurrentPage(subItem.page); }}>{subItem.label}</a>))}</div>
              </div>
            ) : (<a key={i} href="#" className="text-slate-300 hover:text-green-500 transition-colors font-medium" onClick={(e) => { e.preventDefault(); setCurrentPage(item.page); }}>{item.label}</a>)
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-4">
          <motion.button className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 rounded-full font-bold hover:from-orange-400 hover:to-amber-400 transition-all btn-shine" onClick={onOpenModal} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>אני רוצה לנסות</motion.button>
        </div>
        <button className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <Icons.X /> : <Icons.Menu />}</button>
      </div>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div className="lg:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-b border-white/10" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="p-6 space-y-4">
              {navItems.map((item, i) => (<a key={i} href="#" className="block text-lg text-slate-300 hover:text-green-500 transition-colors" onClick={(e) => { e.preventDefault(); setCurrentPage(item.page || item.dropdown?.[0]?.page || 'home'); setIsMobileMenuOpen(false); }}>{item.label}</a>))}
              <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 rounded-xl font-bold mt-4" onClick={() => { onOpenModal(); setIsMobileMenuOpen(false); }}>אני רוצה לנסות</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

// ============== CLIENT LOGOS ==============
const ClientLogos = () => {
  const logos = ['מספרת אורלי', 'סטודיו פיט', 'יועץ משכנתאות', 'קליניקה', 'סטודיו יוגה']
  return (
    <div className="py-16 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-slate-500 mb-8 text-sm uppercase tracking-wider">מהימנים על ידי מאות עסקים בישראל</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {logos.map((logo, i) => (<motion.div key={i} className="text-slate-600 text-lg font-bold opacity-50 hover:opacity-100 transition-opacity cursor-default" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 0.5, y: 0 }} whileHover={{ opacity: 1, scale: 1.1 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>{logo}</motion.div>))}
        </div>
      </div>
    </div>
  )
}

// ============== HERO ==============
const HeroSection = ({ onOpenModal }) => {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <section className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center relative z-10">
      <motion.div className="max-w-7xl mx-auto px-6 text-center" style={{ y, opacity }}>
        <motion.div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-green-400 text-sm font-bold mb-10 shadow-[0_0_30px_rgba(34,197,94,0.15)]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}><Icons.Sparkles /></motion.span>
          <span className="tracking-wide">הבוט החכם שעובד בשבילך 24/7</span>
        </motion.div>
        <motion.h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] mb-8 tracking-tighter" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>אל תיתן ללקוחות שלך<br /><span className="gradient-text">לחכות למענה.</span></motion.h1>
        <motion.p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-400 max-w-4xl mx-auto mb-12 leading-relaxed font-light" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>הצ'אט-בוט החכם שלנו סוגר עסקאות, מתזמן פגישות ומסנן לידים{' '}<span className="text-white font-medium">בזמן אמת</span>{' '}– כדי שאתה תוכל להתמקד במה שחשוב באמת.</motion.p>
        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center mb-16" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
          <motion.button className="px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 rounded-2xl text-xl font-black hover:from-orange-400 hover:to-amber-400 transition-all shadow-[0_20px_50px_-10px_rgba(249,115,22,0.5)] flex items-center justify-center gap-3 group btn-shine" onClick={onOpenModal} whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
            <motion.span className="group-hover:rotate-12 transition-transform" whileHover={{ rotate: 12 }}><Icons.Message /></motion.span>אני רוצה לנסות<Icons.ArrowRight />
          </motion.button>
          <motion.button className="px-10 py-5 bg-slate-800/80 border border-white/10 rounded-2xl text-xl font-bold text-white hover:bg-slate-700/80 transition-all flex items-center justify-center gap-3 group" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors"><Icons.Play /></div>צפה בהדגמה
          </motion.button>
        </motion.div>
        <motion.div className="flex flex-wrap justify-center gap-6 mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }}>
          <div className="flex items-center gap-2 text-slate-400 text-sm"><svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>מאובטח SSL</div>
          <div className="flex items-center gap-2 text-slate-400 text-sm"><svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>ללא כרטיס אשראי</div>
          <div className="flex items-center gap-2 text-slate-400 text-sm"><svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>ביטול בכל עת</div>
          <div className="flex items-center gap-2 text-slate-400 text-sm"><svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>תמיכה בעברית 24/7</div>
        </motion.div>
        <motion.div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}>
          {[{ number: '500+', label: 'עסקים פעילים' }, { number: '1M+', label: 'הודעות נענו' }, { number: '98%', label: 'שביעות רצון' }].map((stat, i) => (<motion.div key={i} className="text-center" whileHover={{ scale: 1.1 }}><div className="text-3xl sm:text-4xl md:text-5xl font-black text-green-500 mb-2">{stat.number}</div><div className="text-slate-500 text-sm">{stat.label}</div></motion.div>))}
        </motion.div>
      </motion.div>
      <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"><motion.div className="w-1.5 h-1.5 rounded-full bg-green-500" animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }} /></div>
      </motion.div>
    </section>
  )
}

// ============== HOW IT WORKS ==============
const HowItWorksSection = ({ onOpenModal }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const steps = [
    { number: '01', title: 'חיבור פשוט', description: 'מחברים את הוואטסאפ העסקי שלך ב-2 דקות. בלי קוד, בלי התקנות מסובכות.', icon: '🔗' },
    { number: '02', title: 'אימון הבוט', description: 'מלמדים את הבוט על העסק שלך - שירותים, מחירים, שעות פעילות. הוא לומד מהר.', icon: '🧠' },
    { number: '03', title: 'מענה אוטומטי', description: 'הבוט עונה ללקוחות שלך 24/7, קובע פגישות, ושולח תזכורות - בזמן שאתה ישן.', icon: '⚡' },
    { number: '04', title: 'צמיחה מתמדת', description: 'צופה בנתונים, מקבל תובנות, ורואה איך העסק שלך גדל מחודש לחודש.', icon: '📈' }
  ]

  return (
    <section ref={ref} className="py-32 relative z-10" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-black uppercase tracking-[0.2em] mb-6"><Icons.Zap />איך זה עובד</div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6">פשוט. מהיר. <span className="text-green-500">יעיל.</span></h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">ב-4 צעדים פשוטים תהפוך את הוואטסאפ שלך למכונת מכירות אוטומטית</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div key={i} className="relative group" initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: i * 0.15 }}>
              {i < steps.length - 1 && <div className="hidden lg:block absolute top-16 right-0 w-full h-0.5 bg-gradient-to-l from-green-500/50 to-transparent translate-x-1/2" />}
              <div className="glass p-8 rounded-3xl hover-lift hover-glow h-full">
                <div className="text-6xl font-black text-white/5 absolute top-4 left-4">{step.number}</div>
                <motion.div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-white/10 group-hover:border-green-500/50 transition-colors relative z-10" whileHover={{ scale: 1.1, rotate: 5 }}>{step.icon}</motion.div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div className="text-center mt-16" initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.8 }}>
          <button onClick={onOpenModal} className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-white font-bold hover:bg-white/10 transition-all inline-flex items-center gap-2">למד עוד על התהליך<Icons.ArrowRight /></button>
        </motion.div>
      </div>
    </section>
  )
}

// ============== FEATURES ==============
const FeaturesSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const features = [
    { icon: '⚡', title: 'מענה מיידי', desc: 'תוך 2 שניות לכל הודעה' },
    { icon: '📅', title: 'תיאום פגישות', desc: 'סנכרון אוטומטי עם היומן' },
    { icon: '📄', title: 'הצעות מחיר', desc: 'שליחה אוטומטית ומעקב' },
    { icon: '🎯', title: 'ניהול לידים', desc: 'מעקב ותיעדוף חכם' },
    { icon: '💳', title: 'גביית תשלומים', desc: 'קישור לתשלום בהודעה' },
    { icon: '🧠', title: 'למידה עצמית', desc: 'משתפר עם כל שיחה' },
  ]

  return (
    <section ref={ref} className="py-32 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-6">תכונות</div>
          <h2 className="text-4xl md:text-6xl font-black mb-6">הכל ב<span className="text-green-500">מקום אחד</span></h2>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div key={i} className="glass p-8 rounded-3xl hover-lift group" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}>
              <motion.div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-white/10 group-hover:border-green-500/30 transition-all" whileHover={{ scale: 1.15, rotate: 10 }}>{feature.icon}</motion.div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-500">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============== ABOUT PAGE ==============
const AboutPage = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const team = [
    { name: 'אריאל אוחיון', role: 'מייסד ומפתח', emoji: '👨‍💻', bio: 'יזם עם תשוקה לבנות פתרונות טכנולוגיים שפותרים בעיות אמיתיות.' },
    { name: 'ארבל דיין', role: 'שותף מייסד', emoji: '🚀', bio: 'מומחה לטכנולוגיה וחוויית משתמש' },
  ]
  const values = [
    { icon: <Icons.Heart />, title: 'לקוח במרכז', desc: 'כל החלטה נבחנת דרך העיניים של הלקוח' },
    { icon: <Icons.Zap />, title: 'פשטות', desc: 'טכנולוגיה מתקדמת, שימוש פשוט' },
    { icon: <Icons.Target />, title: 'תוצאות', desc: 'מדידה מתמדת והשגת יעדים' },
    { icon: <Icons.Users />, title: 'שותפות', desc: 'גדלים יחד עם הלקוחות שלנו' },
  ]

  return (
    <section ref={ref} className="pt-32 pb-20 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-black uppercase tracking-[0.2em] mb-6">הסיפור שלנו</div>
          <h1 className="text-5xl md:text-7xl font-black mb-8">בונים את העתיד של <span className="gradient-text">שירות לקוחות</span></h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">התחלנו את Easychat מתוך תסכול אישי. ראינו עסקים קטנים מפסידים לקוחות כי לא הספיקו לענות. החלטנו שזה חייב להשתנות.</p>
        </motion.div>
        <motion.div className="glass p-12 md:p-16 rounded-[3rem] mb-20" initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-6">המשימה שלנו</h2>
              <p className="text-lg text-slate-400 leading-relaxed mb-6">לאפשר לכל עסק קטן בישראל לספק שירות לקוחות ברמה של חברה גדולה - בלי לשבור את הראש ובלי לשבור את הכיס.</p>
              <p className="text-lg text-slate-400 leading-relaxed">אנחנו מאמינים שטכנולוגיית AI צריכה להיות נגישה לכולם, ושבעל עסק צריך להתעסק בעסק שלו - לא בלענות על הודעות עד חצות.</p>
            </div>
            <div className="flex justify-center">
              <motion.div className="w-64 h-64 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                <div className="w-48 h-48 bg-slate-900 rounded-full flex items-center justify-center text-6xl">🎯</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        <motion.div className="mb-20" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }}>
          <h2 className="text-3xl font-black text-center mb-12">הערכים שמנחים אותנו</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div key={i} className="glass p-8 rounded-2xl text-center hover-lift" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 + i * 0.1 }}>
                <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center text-green-500 mx-auto mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-slate-500 text-sm">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }}>
          <h2 className="text-3xl font-black text-center mb-12">הצוות</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {team.map((member, i) => (
              <motion.div key={i} className="glass p-8 rounded-2xl text-center hover-lift" whileHover={{ y: -10 }}>
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">{member.emoji}</div>
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-green-500 text-sm mb-3">{member.role}</p>
                <p className="text-slate-500 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ============== SEA4U CASE STUDY SECTION ==============
const CaseStudySection = ({ setCurrentPage }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-32 relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-black uppercase tracking-[0.2em] mb-6">⭐ סיפור הצלחה אמיתי</div>
          <h2 className="text-4xl md:text-6xl font-black mb-4">הלקוחות שלנו <span className="text-green-500">מדברים</span></h2>
        </motion.div>
        <motion.div className="glass rounded-[2.5rem] overflow-hidden cursor-pointer hover-lift" initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} onClick={() => setCurrentPage('blog')} whileHover={{ scale: 1.02 }}>
          <div className="grid lg:grid-cols-2 gap-0">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl">🚤</div>
                <div><h3 className="text-2xl font-black">Sea4u</h3><p className="text-slate-400">השכרת יאכטות באילת</p></div>
              </div>
              <blockquote className="text-xl md:text-2xl text-slate-300 font-light italic mb-8 leading-relaxed">"הבוט ענה על 847 הודעות בחודש הראשון. זה כאילו שכרתי עובד שעובד 24/7 ולעולם לא מתעייף."</blockquote>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-800/50 rounded-xl p-4 text-center"><div className="text-3xl font-black text-green-500">117%</div><div className="text-slate-400 text-sm">עלייה בהזמנות</div></div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center"><div className="text-3xl font-black text-green-500">2 דק'</div><div className="text-slate-400 text-sm">זמן מענה ממוצע</div></div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center"><div className="text-3xl font-black text-green-500">100%</div><div className="text-slate-400 text-sm">פניות נענו</div></div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center"><div className="text-3xl font-black text-green-500">847</div><div className="text-slate-400 text-sm">הודעות בחודש</div></div>
              </div>
              <div className="flex items-center gap-2 text-green-500 font-bold">קרא את סיפור ההצלחה המלא<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div>
            </div>
            <div className="bg-slate-900/50 p-8 md:p-12">
              <div className="text-green-500 text-sm font-bold mb-6 flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />דוגמה לשיחה אמיתית</div>
              <div className="text-xs text-slate-500 text-center mb-4">22:47</div>
              <div className="space-y-4">
                <div className="bg-slate-800 rounded-2xl rounded-bl-sm p-4 mr-8"><p className="text-white">היי, מתעניין בהשכרת יאכטה ל-10 אנשים ליום הולדת</p></div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl rounded-br-sm p-4 ml-8"><p className="text-slate-900 font-medium">היי! שמח לעזור 🚤</p><p className="text-slate-900 mt-2">ליום הולדת אני ממליץ על היאכטה "Blue Dream" - מושלמת ל-10 אנשים, עם מערכת סאונד ואזור שיזוף.</p><p className="text-slate-900 mt-2 font-medium">📅 באיזה תאריך חשבתם?</p></div>
                <div className="bg-slate-800 rounded-2xl rounded-bl-sm p-4 mr-8"><p className="text-white">יום שישי הקרוב אפשרי?</p></div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl rounded-br-sm p-4 ml-8"><p className="text-slate-900">בודק לך עכשיו... ✅ יש פנוי!</p><p className="text-slate-900 mt-2">יש לנו שני מסלולים:</p><p className="text-slate-900">• הפלגת בוקר (10:00-14:00) - ₪2,400</p><p className="text-slate-900">• הפלגת שקיעה (16:00-20:00) - ₪2,800</p><p className="text-slate-900 mt-2 font-medium">מה מתאים לך יותר?</p></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ============== ROI CALCULATOR ==============
const ROICalculator = ({ onOpenModal }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [messages, setMessages] = useState(20)
  const [responseTime, setResponseTime] = useState(5)
  const [customerValue, setCustomerValue] = useState(500)

  const hoursWasted = Math.round((messages * responseTime * 30) / 60)
  const lostCustomers = Math.round(messages * 0.3 * 30)
  const yearlyLoss = lostCustomers * customerValue

  return (
    <section ref={ref} className="py-32 relative z-10">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-xs font-black uppercase tracking-[0.2em] mb-6">🔢 מחשבון ROI</div>
          <h2 className="text-4xl md:text-6xl font-black mb-4">כמה אתה <span className="text-orange-500">מפסיד</span> היום?</h2>
          <p className="text-xl text-slate-400">הזן את הנתונים שלך וגלה</p>
        </motion.div>
        <motion.div className="glass rounded-[2.5rem] p-8 md:p-12" initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }}>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div><label className="block text-lg font-bold mb-4">📱 כמה הודעות אתה מקבל ביום?</label><input type="range" min="5" max="100" value={messages} onChange={(e) => setMessages(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" /><div className="text-center text-3xl font-black text-orange-500 mt-2">{messages}</div></div>
              <div><label className="block text-lg font-bold mb-4">⏱️ כמה דקות לוקח לך לענות על הודעה?</label><input type="range" min="1" max="15" value={responseTime} onChange={(e) => setResponseTime(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" /><div className="text-center text-3xl font-black text-orange-500 mt-2">{responseTime} דקות</div></div>
              <div><label className="block text-lg font-bold mb-4">💰 מה שווה לך לקוח חדש? (בש"ח)</label><input type="range" min="100" max="5000" step="100" value={customerValue} onChange={(e) => setCustomerValue(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" /><div className="text-center text-3xl font-black text-orange-500 mt-2">₪{customerValue.toLocaleString()}</div></div>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-8 flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-6 text-center">📊 התוצאות שלך</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/20"><span className="text-slate-300">זמן מבוזבז בחודש</span><span className="text-2xl font-black text-red-400">{hoursWasted} שעות</span></div>
                <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/20"><span className="text-slate-300">לקוחות אבודים בחודש</span><span className="text-2xl font-black text-red-400">~{lostCustomers}</span></div>
                <div className="flex items-center justify-between p-4 bg-red-500/20 rounded-xl border border-red-500/30"><span className="text-slate-200 font-bold">הפסד שנתי משוער</span><span className="text-3xl font-black text-red-400">₪{yearlyLoss.toLocaleString()}</span></div>
              </div>
              <motion.button className="mt-8 w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 rounded-xl font-black text-lg hover:from-orange-400 hover:to-amber-400 transition-all" onClick={onOpenModal} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>אני רוצה להפסיק להפסיד 💪</motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ============== FAQ ==============
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <motion.div className="mb-4" layout>
      <button onClick={() => setIsOpen(!isOpen)} className={`w-full p-6 rounded-2xl glass border flex items-center justify-between gap-4 text-right transition-all duration-300 ${isOpen ? 'border-green-500/50 bg-white/5' : 'border-white/5'}`}>
        <span className="text-lg font-bold">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className={isOpen ? 'text-green-500' : 'text-slate-500'}>{isOpen ? <Icons.Minus /> : <Icons.Plus />}</motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-6 text-slate-400 text-lg leading-relaxed border-x border-b border-white/5 rounded-b-2xl bg-white/[0.02]">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const FAQSection = () => {
  const faqs = [
    { question: "האם הבוט יודע לדבר בעברית טבעית?", answer: "בוודאי. אנחנו משתמשים בטכנולוגיית AI מתקדמת שמותאמת במיוחד לשפה העברית, כולל סלנג, קיצורים והבנת הקשרים מורכבים בשיחה." },
    { question: "האם זה דורש מספר וואטסאפ חדש?", answer: "ממש לא. ניתן לחבר את המערכת למספר הקיים של העסק שלכם (וואטסאפ עסקי) בצורה חלקה ומאובטחת." },
    { question: "האם ניתן לחבר את הבוט למערכת ה-CRM שלי?", answer: "כן, אנחנו תומכים באינטגרציות לכל המערכות המובילות בשוק (Monday, Pipedrive, HubSpot) וגם למערכות ישראליות מקומיות." },
    { question: "כמה זמן לוקח להקים בוט כזה?", answer: "תהליך האפיון וההקמה שלנו מהיר במיוחד. בדרך כלל הבוט שלכם יהיה באוויר ויתחיל לענות ללקוחות תוך פחות מ-48 שעות." }
  ]

  return (
    <section className="py-32 px-6 max-w-4xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-6xl font-black mb-6">שאלות <span className="text-green-500">נפוצות</span></h2>
        <p className="text-xl text-slate-400">כל מה שרציתם לדעת על הצ'אט-בוט החדש שלכם</p>
      </div>
      <div className="space-y-4">{faqs.map((faq, i) => <FAQItem key={i} {...faq} />)}</div>
    </section>
  )
}

// ============== CTA SECTION ==============
const CTASection = ({ onOpenModal }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-32 px-6 relative z-10">
      <motion.div className="max-w-5xl mx-auto" initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}}>
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-green-500 to-emerald-600 p-12 md:p-20 text-center">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          <div className="relative z-10">
            <motion.h2 className="text-4xl md:text-6xl font-black text-slate-950 mb-6" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }}>מוכן להפסיק לאבד לקוחות?</motion.h2>
            <motion.p className="text-xl text-slate-900/80 mb-10 max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }}>הצטרף למאות עסקים שכבר משתמשים ב-Easychat ומרוויחים יותר</motion.p>
            <motion.button className="px-12 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 rounded-2xl text-xl font-black hover:from-orange-400 hover:to-amber-400 transition-all shadow-2xl inline-flex items-center gap-3" onClick={onOpenModal} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }}><Icons.Message />אני רוצה להתחיל עכשיו<Icons.ArrowRight /></motion.button>
            <motion.p className="mt-6 text-slate-900/60 text-sm" initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}>ללא כרטיס אשראי • התקנה ב-2 דקות • ביטול בכל עת</motion.p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

// ============== FOOTER ==============
const Footer = ({ setCurrentPage }) => {
  const footerLinks = {
    product: [{ label: 'תכונות', page: 'features' }, { label: 'איך זה עובד', page: 'how-it-works' }, { label: 'אינטגרציות', page: 'integrations' }, { label: 'עדכונים', page: 'changelog' }],
    company: [{ label: 'אודות', page: 'about' }, { label: 'קריירה', page: 'careers' }, { label: 'בלוג', page: 'blog' }, { label: 'צור קשר', page: 'contact' }],
    resources: [{ label: 'מרכז עזרה', page: 'help' }, { label: 'תיעוד API', page: 'docs' }, { label: 'סטטוס', page: 'status' }, { label: 'שותפים', page: 'partners' }],
    legal: [{ label: 'תנאי שימוש', page: 'terms' }, { label: 'פרטיות', page: 'privacy' }, { label: 'אבטחה', page: 'security' }],
  }

  return (
    <footer className="border-t border-white/5 pt-20 pb-10 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4"><div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center"><Icons.Message /></div><span className="text-xl font-black">Easy<span className="text-green-500">chat</span></span></div>
            <p className="text-slate-500 text-sm mb-6">הבוט החכם שעובד בשבילך 24/7</p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-green-500 hover:border-green-500/50 transition-all"><Icons.Linkedin /></a>
              <a href="#" className="w-10 h-10 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-green-500 hover:border-green-500/50 transition-all"><Icons.Twitter /></a>
              <a href="#" className="w-10 h-10 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-green-500 hover:border-green-500/50 transition-all"><Icons.Facebook /></a>
              <a href="https://instagram.com/easy_chat_ai" target="_blank" rel="noopener noreferrer" className="w-10 h-10 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-green-500 hover:border-green-500/50 transition-all"><Icons.Instagram /></a>
            </div>
          </div>
          <div><h4 className="font-bold mb-4">מוצר</h4><ul className="space-y-3">{footerLinks.product.map((link, i) => (<li key={i}><a href="#" className="text-slate-500 hover:text-green-500 transition-colors text-sm" onClick={(e) => { e.preventDefault(); setCurrentPage(link.page); }}>{link.label}</a></li>))}</ul></div>
          <div><h4 className="font-bold mb-4">חברה</h4><ul className="space-y-3">{footerLinks.company.map((link, i) => (<li key={i}><a href="#" className="text-slate-500 hover:text-green-500 transition-colors text-sm" onClick={(e) => { e.preventDefault(); setCurrentPage(link.page); }}>{link.label}</a></li>))}</ul></div>
          <div><h4 className="font-bold mb-4">משאבים</h4><ul className="space-y-3">{footerLinks.resources.map((link, i) => (<li key={i}><a href="#" className="text-slate-500 hover:text-green-500 transition-colors text-sm" onClick={(e) => { e.preventDefault(); setCurrentPage(link.page); }}>{link.label}</a></li>))}</ul></div>
          <div><h4 className="font-bold mb-4">משפטי</h4><ul className="space-y-3">{footerLinks.legal.map((link, i) => (<li key={i}><a href="#" className="text-slate-500 hover:text-green-500 transition-colors text-sm" onClick={(e) => { e.preventDefault(); setCurrentPage(link.page); }}>{link.label}</a></li>))}</ul></div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-sm">© 2025 Easychat. כל הזכויות שמורות.</p>
          <div className="flex items-center gap-4 text-sm text-slate-600"><span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />כל המערכות פעילות</span><span>made with 💚 in Israel</span></div>
        </div>
      </div>
    </footer>
  )
}

// ============== BLOG PAGE ==============
const BlogPage = ({ setCurrentPage, onOpenModal }) => {
  const [showPost, setShowPost] = useState(false)

  if (showPost) {
    return (
      <article className="pt-32 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <motion.button onClick={() => setShowPost(false)} className="flex items-center gap-2 text-slate-400 hover:text-green-500 transition-colors mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>חזרה לבלוג</motion.button>
          <motion.header className="mb-12" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-bold mb-4">סיפורי הצלחה</span>
            <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">איך Sea4u הכפילו את כמות ההזמנות תוך חודש עם Easychat</h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500"><span className="flex items-center gap-2"><Icons.Clock />5 דקות קריאה</span><span>ינואר 2025</span></div>
          </motion.header>
          <motion.div className="glass rounded-3xl p-12 mb-12 text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}><div className="text-8xl mb-4">🚤</div><h2 className="text-2xl font-bold text-green-500">Sea4u</h2><p className="text-slate-400">השכרת יאכטות ושיט פרטי באילת</p></motion.div>
          <motion.div className="prose prose-invert max-w-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h2 className="text-2xl font-black mt-8 mb-4">הסיפור של Sea4u</h2>
            <p className="text-slate-300 text-lg mb-6">Sea4u היא חברת השכרת יאכטות ושיט פרטי באילת. עם יותר מ-10 שנות ניסיון, הם מציעים חוויות ים בלתי נשכחות - מהפלגות שקיעה רומנטיות ועד ימי כיף לקבוצות.</p>
            <p className="text-slate-300 text-lg mb-6">אבל הייתה להם בעיה גדולה.</p>
            <h2 className="text-2xl font-black mt-8 mb-4">האתגר: לקוחות שמחכים = לקוחות שהולכים</h2>
            <div className="border-r-4 border-green-500 pr-6 py-4 my-8 bg-green-500/10 rounded-l-xl"><p className="text-white text-xl italic">"רוב הפניות שלנו מגיעות בערב ובסופי שבוע. בדיוק כשאנחנו בים עם לקוחות, או מנסים לנוח."</p><p className="text-slate-400 mt-2">— בעל העסק</p></div>
            <div className="grid grid-cols-3 gap-4 my-8">
              <div className="glass rounded-xl p-4 text-center"><div className="text-3xl font-black text-red-400">4-6</div><div className="text-slate-500 text-sm">שעות זמן מענה</div></div>
              <div className="glass rounded-xl p-4 text-center"><div className="text-3xl font-black text-red-400">60%</div><div className="text-slate-500 text-sm">פניות שנענו</div></div>
              <div className="glass rounded-xl p-4 text-center"><div className="text-3xl font-black text-red-400">15-20</div><div className="text-slate-500 text-sm">לידים אבודים בחודש</div></div>
            </div>
            <h2 className="text-2xl font-black mt-8 mb-4">הפתרון: בוט שמדבר בשפה של Sea4u</h2>
            <p className="text-slate-300 text-lg mb-4">תוך 48 שעות, הקמנו בוט מותאם אישית שיודע:</p>
            <ul className="text-slate-300 text-lg space-y-2 mb-8"><li>✅ לענות על שאלות נפוצות על היאכטות</li><li>✅ לשלוח מחירון מעודכן</li><li>✅ לתאם תאריכים ושעות</li><li>✅ לאסוף פרטי לקוח ולהעביר ליומן</li><li>✅ לזהות לקוחות "חמים" ולהתריע בזמן אמת</li></ul>
            <h2 className="text-2xl font-black mt-8 mb-4">התוצאות: המספרים מדברים</h2>
            <div className="glass rounded-2xl p-8 my-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center"><div className="text-sm text-slate-500 mb-2">זמן מענה</div><div className="text-red-400 line-through text-lg">4-6 שעות</div><div className="text-green-500 text-2xl font-black">2 דקות</div><div className="text-green-400 text-sm mt-1">↓ 99%</div></div>
                <div className="text-center"><div className="text-sm text-slate-500 mb-2">פניות שנענו</div><div className="text-red-400 line-through text-lg">60%</div><div className="text-green-500 text-2xl font-black">100%</div><div className="text-green-400 text-sm mt-1">↑ 67%</div></div>
                <div className="text-center"><div className="text-sm text-slate-500 mb-2">המרה לידים</div><div className="text-red-400 line-through text-lg">15%</div><div className="text-green-500 text-2xl font-black">32%</div><div className="text-green-400 text-sm mt-1">↑ 113%</div></div>
                <div className="text-center"><div className="text-sm text-slate-500 mb-2">הזמנות בחודש</div><div className="text-red-400 line-through text-lg">12</div><div className="text-green-500 text-2xl font-black">26</div><div className="text-green-400 text-sm mt-1">↑ 117%</div></div>
              </div>
            </div>
            <div className="border-r-4 border-green-500 pr-6 py-4 my-8 bg-green-500/10 rounded-l-xl"><p className="text-white text-xl italic">"הבוט ענה על 847 הודעות בחודש הראשון. זה כאילו שכרתי עובד שעובד 24/7 ולעולם לא מתעייף."</p><p className="text-slate-400 mt-2">— בעלי Sea4u</p></div>
            <div className="glass rounded-3xl p-8 md:p-12 text-center mt-16 bg-gradient-to-br from-green-500/10 to-blue-500/10">
              <h2 className="text-2xl md:text-3xl font-black mb-4">רוצה תוצאות דומות?</h2>
              <p className="text-slate-400 mb-8 text-lg">אם גם אתה מרגיש שאתה מפספס לקוחות כי אין לך זמן לענות, בוא נדבר.<br /><strong className="text-white">ההתקנה לוקחת 48 שעות. הניסיון חינם.</strong></p>
              <motion.button onClick={onOpenModal} className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 rounded-2xl text-xl font-black hover:from-orange-400 hover:to-amber-400 transition-all" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Icons.Message />אני רוצה לראות איך זה עובד</motion.button>
            </div>
          </motion.div>
        </div>
      </article>
    )
  }

  return (
    <section className="pt-32 pb-20 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-black uppercase tracking-[0.2em] mb-6">הבלוג שלנו</div>
          <h1 className="text-4xl md:text-6xl font-black mb-6">טיפים, מדריכים <span className="gradient-text">וסיפורי הצלחה</span></h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">למד איך להפוך את שירות הלקוחות שלך לאוטומטי, יעיל, וחכם יותר</p>
        </motion.div>
        <motion.article className="glass rounded-[2rem] overflow-hidden mb-12 cursor-pointer hover-lift" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} onClick={() => setShowPost(true)} whileHover={{ scale: 1.01 }}>
          <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
            <div className="flex flex-col justify-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-bold w-fit mb-4">⭐ מומלץ</span>
              <h2 className="text-2xl md:text-4xl font-black mb-4">איך Sea4u הכפילו את כמות ההזמנות תוך חודש</h2>
              <p className="text-slate-400 text-lg mb-6">Sea4u, חברת השכרת יאכטות באילת, עברו מזמן מענה של 4-6 שעות ל-2 דקות. קרא את סיפור ההצלחה המלא.</p>
              <div className="flex items-center gap-6 text-sm text-slate-500"><span className="flex items-center gap-2"><Icons.Clock />5 דקות</span><span>ינואר 2025</span><span>סיפורי הצלחה</span></div>
            </div>
            <div className="flex items-center justify-center"><div className="w-48 h-48 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center text-8xl">🚤</div></div>
          </div>
        </motion.article>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[{ title: 'המדריך המלא: מהו בוט וואטסאפ', category: 'מדריכים', icon: '🤖' }, { title: '5 דרכים לענות ללקוחות מהר יותר', category: 'טיפים', icon: '⚡' }, { title: 'איך לבחור בוט לעסק שלך', category: 'מדריכים', icon: '🎯' }].map((post, i) => (
            <motion.article key={i} className="glass rounded-2xl p-6 opacity-60" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 0.6, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-4">{post.icon}</div>
              <span className="text-green-500 text-sm font-bold">{post.category}</span>
              <h3 className="text-xl font-bold mt-2 mb-3">{post.title}</h3>
              <span className="inline-block px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400">בקרוב...</span>
            </motion.article