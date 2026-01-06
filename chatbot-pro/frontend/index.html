<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChatBot Pro - דשבורד</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- GSAP for animations -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    
    <!-- Supabase Client -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    
    <!-- Global Config -->
    <script src="js/config.js"></script>
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#00D4AA',
                        'primary-dark': '#00A080',
                        secondary: '#0066FF',
                        dark: '#1A1A2E',
                        success: '#00E676',
                    },
                    fontFamily: {
                        heebo: ['Heebo', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    
    <style>
        * { font-family: 'Heebo', sans-serif; }
        
        /* Glass Morphism */
        .glass {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        /* Gradients */
        .gradient-bg { background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%); }
        .gradient-primary { background: linear-gradient(135deg, #00D4AA 0%, #00A080 100%); }
        .gradient-secondary { background: linear-gradient(135deg, #0066FF 0%, #0052CC 100%); }
        
        /* Card hover */
        .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.15);
        }
        
        /* Skeleton loader */
        .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: skeleton-loading 1.5s infinite;
        }
        @keyframes skeleton-loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        /* Sidebar */
        .sidebar-item { transition: all 0.2s ease; }
        .sidebar-item:hover { background: rgba(0, 212, 170, 0.1); }
        .sidebar-item.active { background: rgba(0, 212, 170, 0.15); border-right: 3px solid #00D4AA; }
        
        /* Toast animation */
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .toast { animation: slideIn 0.3s ease; }
        
        /* Pulse animation */
        .pulse-dot { animation: pulse 2s infinite; }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        /* Ripple effect */
        .ripple { position: relative; overflow: hidden; }
        .ripple::after {
            content: '';
            position: absolute;
            top: 50%; left: 50%;
            width: 0; height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }
        .ripple:active::after { width: 300px; height: 300px; }
        
        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
        
        /* Badges */
        .badge-success { background: rgba(0, 230, 118, 0.15); color: #00C853; }
        .badge-warning { background: rgba(255, 193, 7, 0.15); color: #FF9800; }
        .badge-error { background: rgba(244, 67, 54, 0.15); color: #F44336; }
        .badge-info { background: rgba(0, 102, 255, 0.15); color: #0066FF; }
    </style>
</head>
<body class="gradient-bg min-h-screen">
    
    <!-- Toast Container -->
    <div id="toast-container" class="fixed top-4 left-4 z-50 flex flex-col gap-2"></div>
    
    <div class="flex min-h-screen">
        
        <!-- Sidebar -->
        <aside class="sidebar w-64 bg-white shadow-lg fixed h-full z-40">
            <!-- Logo -->
            <div class="p-6 border-b border-gray-100">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                        <i data-lucide="message-square" class="w-5 h-5 text-white"></i>
                    </div>
                    <div>
                        <h1 class="text-lg font-bold text-dark">ChatBot Pro</h1>
                        <p class="text-xs text-gray-500">ניהול בוט וואטסאפ</p>
                    </div>
                </div>
            </div>
            
            <!-- Navigation -->
            <nav class="p-4">
                <ul class="space-y-1">
                    <li>
                        <a href="index.html" class="sidebar-item active flex items-center gap-3 px-4 py-3 rounded-lg text-dark">
                            <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
                            <span>דשבורד</span>
                        </a>
                    </li>
                    <li>
                        <a href="conversations.html" class="sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:text-dark">
                            <i data-lucide="message-circle" class="w-5 h-5"></i>
                            <span>שיחות</span>
                            <span class="mr-auto bg-primary text-white text-xs px-2 py-0.5 rounded-full" id="unread-badge">0</span>
                        </a>
                    </li>
                    <li>
                        <a href="knowledge.html" class="sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:text-dark">
                            <i data-lucide="book-open" class="w-5 h-5"></i>
                            <span>מאגר מידע</span>
                        </a>
                    </li>
                    <li>
                        <a href="appointments.html" class="sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:text-dark">
                            <i data-lucide="calendar" class="w-5 h-5"></i>
                            <span>פגישות</span>
                        </a>
                    </li>
                    <li>
                        <a href="settings.html" class="sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:text-dark">
                            <i data-lucide="settings" class="w-5 h-5"></i>
                            <span>הגדרות</span>
                        </a>
                    </li>
                </ul>
            </nav>
            
            <!-- WhatsApp Status -->
            <div class="absolute bottom-0 w-full p-4 border-t border-gray-100">
                <div class="glass rounded-xl p-3">
                    <div class="flex items-center gap-3">
                        <div class="w-3 h-3 bg-success rounded-full pulse-dot"></div>
                        <div>
                            <p class="text-sm font-medium text-dark">וואטסאפ מחובר</p>
                            <p class="text-xs text-gray-500" id="whatsapp-number">טוען...</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
        
        <!-- Main Content -->
        <main class="flex-1 mr-64 p-8">
            
            <!-- Header -->
            <header class="flex items-center justify-between mb-8 opacity-0" id="header">
                <div>
                    <h2 class="text-2xl font-bold text-dark">שלום, <span id="owner-name">טוען...</span> 👋</h2>
                    <p class="text-gray-500">הנה סיכום הפעילות של הבוט שלך</p>
                </div>
                <div class="flex items-center gap-4">
                    <button class="relative p-2 rounded-xl hover:bg-white hover:shadow-md transition-all">
                        <i data-lucide="bell" class="w-5 h-5 text-gray-600"></i>
                        <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" id="notification-dot"></span>
                    </button>
                    <div class="flex items-center gap-3 glass px-4 py-2 rounded-xl">
                        <div class="w-8 h-8 gradient-secondary rounded-full flex items-center justify-center">
                            <span class="text-white text-sm font-bold" id="user-initials">--</span>
                        </div>
                        <span class="text-sm font-medium text-dark" id="business-name">טוען...</span>
                    </div>
                </div>
            </header>
            
            <!-- Stats Cards -->
            <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" id="stats-section">
                
                <!-- Total Conversations -->
                <div class="card-hover glass rounded-2xl p-6 opacity-0 stat-card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                            <i data-lucide="message-square" class="w-6 h-6 text-white"></i>
                        </div>
                        <span class="badge-success text-xs px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <p class="text-3xl font-bold text-dark" id="total-conversations">--</p>
                    <p class="text-sm text-gray-500">סה"כ שיחות</p>
                </div>
                
                <!-- Answered -->
                <div class="card-hover glass rounded-2xl p-6 opacity-0 stat-card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                            <i data-lucide="check-circle" class="w-6 h-6 text-white"></i>
                        </div>
                        <span class="badge-success text-xs px-2 py-1 rounded-full" id="answer-rate">--%</span>
                    </div>
                    <p class="text-3xl font-bold text-dark" id="total-answered">--</p>
                    <p class="text-sm text-gray-500">נענו אוטומטית</p>
                </div>
                
                <!-- Pending Review -->
                <div class="card-hover glass rounded-2xl p-6 opacity-0 stat-card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                            <i data-lucide="alert-circle" class="w-6 h-6 text-white"></i>
                        </div>
                        <span class="badge-warning text-xs px-2 py-1 rounded-full">ממתין</span>
                    </div>
                    <p class="text-3xl font-bold text-dark" id="pending-review">--</p>
                    <p class="text-sm text-gray-500">ממתינים למענה</p>
                </div>
                
                <!-- Appointments -->
                <div class="card-hover glass rounded-2xl p-6 opacity-0 stat-card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center">
                            <i data-lucide="calendar-check" class="w-6 h-6 text-white"></i>
                        </div>
                        <span class="badge-info text-xs px-2 py-1 rounded-full">היום</span>
                    </div>
                    <p class="text-3xl font-bold text-dark" id="today-appointments">--</p>
                    <p class="text-sm text-gray-500">פגישות היום</p>
                </div>
                
            </section>
            
            <!-- Charts & Quick Actions -->
            <section class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                <!-- Response Rate Chart -->
                <div class="lg:col-span-2 glass rounded-2xl p-6 opacity-0" id="chart-card">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-bold text-dark">אחוז מענה אוטומטי</h3>
                        <select class="text-sm bg-gray-50 border-0 rounded-lg px-3 py-2" id="chart-period">
                            <option value="7">7 ימים אחרונים</option>
                            <option value="30">30 ימים אחרונים</option>
                            <option value="90">90 ימים אחרונים</option>
                        </select>
                    </div>
                    
                    <!-- Simple Bar Chart -->
                    <div class="h-48 flex items-end justify-between gap-2 px-4" id="chart-bars">
                        <div class="flex-1 flex flex-col items-center">
                            <div class="w-full bg-primary rounded-t-lg transition-all duration-500" style="height: 75%"></div>
                            <span class="text-xs text-gray-500 mt-2">א</span>
                        </div>
                        <div class="flex-1 flex flex-col items-center">
                            <div class="w-full bg-primary rounded-t-lg transition-all duration-500" style="height: 85%"></div>
                            <span class="text-xs text-gray-500 mt-2">ב</span>
                        </div>
                        <div class="flex-1 flex flex-col items-center">
                            <div class="w-full bg-primary rounded-t-lg transition-all duration-500" style="height: 60%"></div>
                            <span class="text-xs text-gray-500 mt-2">ג</span>
                        </div>
                        <div class="flex-1 flex flex-col items-center">
                            <div class="w-full bg-primary rounded-t-lg transition-all duration-500" style="height: 90%"></div>
                            <span class="text-xs text-gray-500 mt-2">ד</span>
                        </div>
                        <div class="flex-1 flex flex-col items-center">
                            <div class="w-full bg-primary rounded-t-lg transition-all duration-500" style="height: 70%"></div>
                            <span class="text-xs text-gray-500 mt-2">ה</span>
                        </div>
                        <div class="flex-1 flex flex-col items-center">
                            <div class="w-full bg-primary rounded-t-lg transition-all duration-500" style="height: 45%"></div>
                            <span class="text-xs text-gray-500 mt-2">ו</span>
                        </div>
                        <div class="flex-1 flex flex-col items-center">
                            <div class="w-full bg-gray-200 rounded-t-lg transition-all duration-500" style="height: 10%"></div>
                            <span class="text-xs text-gray-500 mt-2">ש</span>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-center gap-6 mt-6">
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-primary rounded-full"></div>
                            <span class="text-sm text-gray-600">נענו אוטומטית</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-gray-200 rounded-full"></div>
                            <span class="text-sm text-gray-600">ללא תשובה</span>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="glass rounded-2xl p-6 opacity-0" id="actions-card">
                    <h3 class="text-lg font-bold text-dark mb-6">פעולות מהירות</h3>
                    
                    <div class="space-y-3">
                        <a href="knowledge.html" class="ripple block w-full gradient-primary text-white text-center py-3 rounded-xl font-medium hover:shadow-lg transition-shadow">
                            <i data-lucide="plus" class="w-4 h-4 inline ml-2"></i>
                            הוסף שאלה למאגר
                        </a>
                        
                        <a href="conversations.html?filter=no_answer" class="ripple block w-full bg-orange-500 text-white text-center py-3 rounded-xl font-medium hover:shadow-lg transition-shadow">
                            <i data-lucide="message-circle" class="w-4 h-4 inline ml-2"></i>
                            צפה בשאלות ללא מענה
                        </a>
                        
                        <a href="settings.html" class="ripple block w-full bg-gray-100 text-dark text-center py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                            <i data-lucide="settings" class="w-4 h-4 inline ml-2"></i>
                            הגדרות הבוט
                        </a>
                    </div>
                    
                    <!-- Bot Status -->
                    <div class="mt-6 p-4 bg-green-50 rounded-xl" id="bot-status">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                <i data-lucide="bot" class="w-5 h-5 text-white"></i>
                            </div>
                            <div>
                                <p class="font-medium text-green-800">הבוט פעיל</p>
                                <p class="text-sm text-green-600">מגיב לכל הודעה חדשה</p>
                            </div>
                        </div>
                    </div>
                </div>
                
            </section>
            
            <!-- Recent Conversations -->
            <section class="glass rounded-2xl p-6 opacity-0" id="recent-section">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-bold text-dark">שיחות אחרונות</h3>
                    <a href="conversations.html" class="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1">
                        צפה בכל השיחות
                        <i data-lucide="arrow-left" class="w-4 h-4"></i>
                    </a>
                </div>
                
                <!-- Conversations List -->
                <div class="space-y-4" id="conversations-list">
                    <!-- Loading Skeleton -->
                    <div class="conversation-skeleton">
                        <div class="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                            <div class="skeleton w-12 h-12 rounded-full"></div>
                            <div class="flex-1">
                                <div class="skeleton h-4 w-32 mb-2 rounded"></div>
                                <div class="skeleton h-3 w-full rounded"></div>
                            </div>
                            <div class="skeleton h-6 w-20 rounded-full"></div>
                        </div>
                    </div>
                    <div class="conversation-skeleton">
                        <div class="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                            <div class="skeleton w-12 h-12 rounded-full"></div>
                            <div class="flex-1">
                                <div class="skeleton h-4 w-32 mb-2 rounded"></div>
                                <div class="skeleton h-3 w-full rounded"></div>
                            </div>
                            <div class="skeleton h-6 w-20 rounded-full"></div>
                        </div>
                    </div>
                    <div class="conversation-skeleton">
                        <div class="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                            <div class="skeleton w-12 h-12 rounded-full"></div>
                            <div class="flex-1">
                                <div class="skeleton h-4 w-32 mb-2 rounded"></div>
                                <div class="skeleton h-3 w-full rounded"></div>
                            </div>
                            <div class="skeleton h-6 w-20 rounded-full"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Empty State -->
                <div class="hidden text-center py-12" id="empty-state">
                    <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <i data-lucide="message-square-off" class="w-10 h-10 text-gray-400"></i>
                    </div>
                    <h4 class="text-lg font-medium text-dark mb-2">עדיין אין שיחות</h4>
                    <p class="text-gray-500">ברגע שלקוחות ישלחו הודעות, הן יופיעו כאן</p>
                </div>
                
            </section>
            
        </main>
    </div>
    
    <script>
        // ============================================
        // Initialize
        // ============================================
        const BUSINESS_ID = getBusinessId();
        
        // Initialize Lucide Icons
        lucide.createIcons();
        
        // Set initial animation states
        gsap.set('#header', { opacity: 0, y: -20 });
        gsap.set('.stat-card', { opacity: 0, y: 20 });
        gsap.set('#chart-card', { opacity: 0, y: 20 });
        gsap.set('#actions-card', { opacity: 0, y: 20 });
        gsap.set('#recent-section', { opacity: 0, y: 20 });
        
        // ============================================
        // Animations
        // ============================================
        function initAnimations() {
            gsap.to('#header', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
            gsap.to('.stat-card', { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.3 });
            gsap.to('#chart-card', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.7 });
            gsap.to('#actions-card', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.8 });
            gsap.to('#recent-section', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.9 });
        }
        
        // ============================================
        // Data Loading
        // ============================================
        async function loadBusinessData() {
            if (isDemoMode()) {
                return DEMO_DATA.business;
            }
            
            try {
                const db = getSupabase();
                const { data, error } = await db
                    .from('businesses')
                    .select('*')
                    .eq('id', BUSINESS_ID)
                    .single();
                
                if (error) throw error;
                return data;
            } catch (error) {
                console.error('Error loading business:', error);
                showToast('שגיאה בטעינת נתוני העסק', 'error');
                return DEMO_DATA.business;
            }
        }
        
        async function loadStats() {
            if (isDemoMode()) {
                return DEMO_DATA.stats;
            }
            
            try {
                const db = getSupabase();
                
                const { count: total } = await db
                    .from('conversations')
                    .select('*', { count: 'exact', head: true })
                    .eq('business_id', BUSINESS_ID);
                
                const { count: answered } = await db
                    .from('conversations')
                    .select('*', { count: 'exact', head: true })
                    .eq('business_id', BUSINESS_ID)
                    .eq('response_type', 'answered');
                
                const { count: pending } = await db
                    .from('conversations')
                    .select('*', { count: 'exact', head: true })
                    .eq('business_id', BUSINESS_ID)
                    .eq('needs_followup', true);
                
                const today = new Date().toISOString().split('T')[0];
                const { count: appointments } = await db
                    .from('appointments')
                    .select('*', { count: 'exact', head: true })
                    .eq('business_id', BUSINESS_ID)
                    .gte('scheduled_time', today)
                    .lt('scheduled_time', today + 'T23:59:59');
                
                return { total: total || 0, answered: answered || 0, pending: pending || 0, appointments: appointments || 0 };
            } catch (error) {
                console.error('Error loading stats:', error);
                return DEMO_DATA.stats;
            }
        }
        
        async function loadRecentConversations() {
            if (isDemoMode()) {
                return DEMO_DATA.conversations;
            }
            
            try {
                const db = getSupabase();
                const { data, error } = await db
                    .from('conversations')
                    .select('*')
                    .eq('business_id', BUSINESS_ID)
                    .order('timestamp', { ascending: false })
                    .limit(5);
                
                if (error) throw error;
                return data || [];
            } catch (error) {
                console.error('Error loading conversations:', error);
                return DEMO_DATA.conversations;
            }
        }
        
        // ============================================
        // Render Functions
        // ============================================
        function renderConversations(conversations) {
            const container = document.getElementById('conversations-list');
            const emptyState = document.getElementById('empty-state');
            
            // Remove skeletons
            container.querySelectorAll('.conversation-skeleton').forEach(el => el.remove());
            
            if (!conversations || conversations.length === 0) {
                emptyState.classList.remove('hidden');
                return;
            }
            
            emptyState.classList.add('hidden');
            
            conversations.forEach((conv, index) => {
                const displayName = conv.customer_name || formatPhone(conv.customer_phone);
                const badge = RESPONSE_TYPE_LABELS[conv.response_type] || RESPONSE_TYPE_LABELS.answered;
                
                const card = document.createElement('div');
                card.className = 'card-hover flex items-center gap-4 p-4 border border-gray-100 rounded-xl cursor-pointer';
                card.style.opacity = '0';
                card.innerHTML = `
                    <div class="w-12 h-12 gradient-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <span class="text-white font-bold">${getInitials(displayName)}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <h4 class="font-medium text-dark">${displayName}</h4>
                            <span class="text-xs text-gray-400">${getTimeAgo(conv.timestamp)}</span>
                            ${!conv.is_read ? '<span class="w-2 h-2 bg-primary rounded-full"></span>' : ''}
                        </div>
                        <p class="text-sm text-gray-600 truncate">${conv.message}</p>
                    </div>
                    <span class="${badge.class} text-xs px-3 py-1 rounded-full flex-shrink-0">${badge.text}</span>
                `;
                
                card.onclick = () => {
                    window.location.href = `conversations.html?id=${conv.id}`;
                };
                
                container.appendChild(card);
                
                // Animate in
                gsap.to(card, { opacity: 1, y: 0, duration: 0.3, delay: index * 0.1, ease: 'power2.out' });
            });
            
            lucide.createIcons();
        }
        
        // ============================================
        // Initialize Dashboard
        // ============================================
        async function init() {
            // Load business data
            const business = await loadBusinessData();
            if (business) {
                document.getElementById('owner-name').textContent = business.owner_name || 'משתמש';
                document.getElementById('business-name').textContent = business.business_name || 'העסק שלי';
                document.getElementById('user-initials').textContent = getInitials(business.owner_name);
                document.getElementById('whatsapp-number').textContent = formatPhone(business.whatsapp_number) || 'לא מחובר';
            }
            
            // Load stats
            const stats = await loadStats();
            document.getElementById('total-conversations').textContent = stats.total.toLocaleString();
            document.getElementById('total-answered').textContent = stats.answered.toLocaleString();
            document.getElementById('pending-review').textContent = stats.pending.toLocaleString();
            document.getElementById('today-appointments').textContent = stats.appointments.toLocaleString();
            document.getElementById('unread-badge').textContent = stats.pending;
            
            // Calculate and display answer rate
            const answerRate = stats.total > 0 ? Math.round((stats.answered / stats.total) * 100) : 0;
            document.getElementById('answer-rate').textContent = `${answerRate}%`;
            
            // Hide notification dot if no pending
            if (stats.pending === 0) {
                document.getElementById('notification-dot').classList.add('hidden');
            }
            
            // Load recent conversations
            const conversations = await loadRecentConversations();
            renderConversations(conversations);
            
            // Start animations
            initAnimations();
            
            // Show welcome toast after a delay
            setTimeout(() => {
                if (isDemoMode()) {
                    showToast('מצב דמו - הנתונים לדוגמה בלבד', 'info');
                } else {
                    showToast('ברוך הבא לדשבורד! 🎉', 'success');
                }
            }, 1500);
        }
        
        // Start the app
        document.addEventListener('DOMContentLoaded', init);
    </script>
    
</body>
</html>
