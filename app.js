// Wasuwat Training Webapp - Core Logic & Router

// 1. Initial State
const state = {
    currentUser: null,
    currentView: 'login', // 'login', 'student-dashboard', 'course-viewer', 'admin-dashboard'
    activeCourseId: null,
    activeCourseStep: 1, // 1: Pre-test, 2: Video, 3: Post-test
    quizAnswers: {}, // index -> selectedChoiceIndex
    quizResults: null, // { score, total, percentage, passed }
    videoMockPlaying: false,
    videoMockProgress: 0, // 0 to 100 percent
    videoMockTime: 0, // current seconds
    videoMockDuration: 15, // 15 seconds for demonstration mockup
    videoInterval: null,
    adminActiveTab: 'students', // 'students', 'courses', 'reports'
    adminEditingCourseId: null,
    adminCourseFormQuestions: [], // temp store for building questions in modal
    activeAssignmentStudentUser: null, // username of student being edited for course assignment
    activeEditingStudentUser: null // username of student being edited for profile details
};

// 2. Mock Database Initialization
const DEFAULT_COURSES = [
    {
        id: 'course-cybersecurity',
        title: 'ความปลอดภัยไซเบอร์เบื้องต้น (Cybersecurity Basics)',
        description: 'เรียนรู้เรื่องความปลอดภัยในการใช้งานคอมพิวเตอร์และอินเทอร์เน็ตเบื้องต้น การสังเกตอีเมลฟิชชิ่ง (Phishing) วิธีการตั้งรหัสผ่านที่ปลอดภัย และการป้องกันข้อมูลส่วนตัวจากการจู่โจมทางไซเบอร์',
        passingScore: 80, // % passing criteria
        videoUrl: 'https://www.youtube.com/watch?v=z5NC91_W93E', // Sample cybersecurity video
        prerequisiteId: '', // No prerequisite
        preQuestions: [
            {
                question: 'การส่งอีเมลหลอกลวงที่แนบลิงก์ให้กรอกรหัสผ่านเพื่อขโมยข้อมูล เรียกว่ารูปแบบการโจมตีใด?',
                choices: ['มัลแวร์เรียกค่าไถ่ (Ransomware)', 'การฟิชชิ่ง (Phishing)', 'การดักรับข้อมูล (Eavesdropping)', 'สปายแวร์ (Spyware)'],
                correct: 1
            },
            {
                question: 'ข้อใดถือเป็นลักษณะของรหัสผ่านที่แข็งแกร่งและปลอดภัยที่สุด?',
                choices: ['1234567890', 'password_secure', 'P@ssw0rd_2026!#', 'mybirthdate_1998'],
                correct: 2
            },
            {
                question: 'หากคุณได้รับอีเมลจากธนาคารแจ้งว่าบัญชีถูกระงับชั่วคราวและให้คลิกลิงก์ที่แนบมาเพื่อแก้ไขข้อมูล คุณควรทำอย่างไร?',
                choices: ['คลิกทันทีเพราะกังวลเรื่องการเงิน', 'ส่งต่ออีเมลนี้ให้ทุกคนในครอบครัวทดลองกด', 'ลบอีเมลทิ้ง หรือติดต่อสอบถามธนาคารผ่านเบอร์โทรหลักเพื่อตรวจสอบโดยตรง', 'ตอบกลับอีเมลเพื่อถามข้อเท็จจริง'],
                correct: 2
            },
            {
                question: 'มัลแวร์เรียกค่าไถ่ (Ransomware) ส่งผลเสียร้ายแรงที่สุดอย่างไร?',
                choices: ['ทำให้คอมพิวเตอร์เปิดไม่ติดตลอดไป', 'แอบดูหน้าจอและกล้องเว็บแคมของคุณ', 'เปลี่ยนหน้าเว็บที่คุณเข้าบ่อย ๆ', 'ทำการล็อก (เข้ารหัสลับ) ข้อมูลในคอมพิวเตอร์ของคุณแล้วเรียกร้องเงินค่าถอดรหัส'],
                correct: 3
            },
            {
                question: 'การยืนยันตัวตนแบบสองขั้นตอน (Multi-Factor Authentication - MFA) ป้องกันระบบได้อย่างไร?',
                choices: ['บังคับให้ป้อนรหัสผ่านสองคนพร้อมกันเพื่อเข้าสู่ระบบ', 'ช่วยป้องกันบัญชีของคุณถึงแม้ผู้โจมตีจะเดารหัสผ่านของคุณได้แล้วก็ตาม โดยต้องอาศัยรหัสผ่านชั่วคราวอีกชั้นหนึ่ง', 'ทำให้เครื่องคอมพิวเตอร์แฮกเกอร์ดับไปเอง', 'ช่วยลดความยาวของรหัสผ่านหลักลงครึ่งหนึ่ง'],
                correct: 1
            }
        ],
        postQuestions: [
            {
                question: 'การส่งอีเมลหลอกลวงที่แนบลิงก์ให้กรอกรหัสผ่านเพื่อขโมยข้อมูล เรียกว่ารูปแบบการโจมตีใด?',
                choices: ['มัลแวร์เรียกค่าไถ่ (Ransomware)', 'การฟิชชิ่ง (Phishing)', 'การดักรับข้อมูล (Eavesdropping)', 'สปายแวร์ (Spyware)'],
                correct: 1
            },
            {
                question: 'ข้อใดถือเป็นลักษณะของรหัสผ่านที่แข็งแกร่งและปลอดภัยที่สุด?',
                choices: ['1234567890', 'password_secure', 'P@ssw0rd_2026!#', 'mybirthdate_1998'],
                correct: 2
            },
            {
                question: 'หากคุณได้รับอีเมลจากธนาคารแจ้งว่าบัญชีถูกระงับชั่วคราวและให้คลิกลิงก์ที่แนบมาเพื่อแก้ไขข้อมูล คุณควรทำอย่างไร?',
                choices: ['คลิกทันทีเพราะกังวลเรื่องการเงิน', 'ส่งต่ออีเมลนี้ให้ทุกคนในครอบครัวทดลองกด', 'ลบอีเมลทิ้ง หรือติดต่อสอบถามธนาคารผ่านเบอร์โทรหลักเพื่อตรวจสอบโดยตรง', 'ตอบกลับอีเมลเพื่อถามข้อเท็จจริง'],
                correct: 2
            },
            {
                question: 'มัลแวร์เรียกค่าไถ่ (Ransomware) ส่งผลเสียร้ายแรงที่สุดอย่างไร?',
                choices: ['ทำให้คอมพิวเตอร์เปิดไม่ติดตลอดไป', 'แอบดูหน้าจอและกล้องเว็บแคมของคุณ', 'เปลี่ยนหน้าเว็บที่คุณเข้าบ่อย ๆ', 'ทำการล็อก (เข้ารหัสลับ) ข้อมูลในคอมพิวเตอร์ของคุณแล้วเรียกร้องเงินค่าถอดรหัส'],
                correct: 3
            },
            {
                question: 'การยืนยันตัวตนแบบสองขั้นตอน (Multi-Factor Authentication - MFA) ป้องกันระบบได้อย่างไร?',
                choices: ['บังคับให้ป้อนรหัสผ่านสองคนพร้อมกันเพื่อเข้าสู่ระบบ', 'ช่วยป้องกันบัญชีของคุณถึงแม้ผู้โจมตีจะเดารหัสผ่านของคุณได้แล้วก็ตาม โดยต้องอาศัยรหัสผ่านชั่วคราวอีกชั้นหนึ่ง', 'ทำให้เครื่องคอมพิวเตอร์แฮกเกอร์ดับไปเอง', 'ช่วยลดความยาวของรหัสผ่านหลักลงครึ่งหนึ่ง'],
                correct: 1
            }
        ]
    },
    {
        id: 'course-advancednet',
        title: 'ความปลอดภัยเครือข่ายขั้นสูง (Advanced Network Security)',
        description: 'เรียนรู้วิธีการทำงานของไฟร์วอลล์ (Firewall) การเข้ารหัสทราฟฟิกเว็บ ระบบเครือข่ายส่วนตัวเสมือน (VPN) การป้องกันการเจาะระบบ Wi-Fi และวิธีจัดการทราฟฟิกเครือข่ายที่ผิดปกติ',
        passingScore: 80,
        videoUrl: 'https://www.youtube.com/watch?v=FwF_w42b_mU', // Sample network security video
        prerequisiteId: 'course-cybersecurity', // Requires Cybersecurity Basics first!
        preQuestions: [
            {
                question: 'VPN (Virtual Private Network) ทำหน้าที่หลักอย่างไรเพื่อความปลอดภัยบนเครือข่าย?',
                choices: ['ทำให้ความเร็วอินเทอร์เน็ตพุ่งทะยาน', 'ลบไฟล์แคชทั้งหมดออกจากบราวเซอร์ให้อัตโนมัติ', 'เข้ารหัสข้อมูลการรับส่งของคุณและอำพรางตัวตน/ที่อยู่อินเทอร์เน็ตเพื่อความปลอดภัยในการสื่อสาร', 'ป้องกันพนักงานไม่ให้อู้งาน'],
                correct: 2
            },
            {
                question: 'ไฟร์วอลล์ (Firewall) ในระบบคอมพิวเตอร์ทำหน้าที่เปรียบเสมือนอะไร?',
                choices: ['ยามเฝ้าประตูที่คอยตรวจคัดกรองข้อมูลเข้า-ออกเครือข่ายตามเกณฑ์ที่กำหนด', 'โปรแกรมสแกนหาข้อผิดพลาดทางไวยากรณ์ในโค้ด', 'เครื่องปรับอากาศเพื่อระบายความร้อนของเซิร์ฟเวอร์', 'โปรแกรมช่วยพิมพ์ข้อความอย่างรวดเร็ว'],
                correct: 0
            }
        ],
        postQuestions: [
            {
                question: 'VPN (Virtual Private Network) ทำหน้าที่หลักอย่างไรเพื่อความปลอดภัยบนเครือข่าย?',
                choices: ['ทำให้ความเร็วอินเทอร์เน็ตพุ่งทะยาน', 'ลบไฟล์แคชทั้งหมดออกจากบราวเซอร์ให้อัตโนมัติ', 'เข้ารหัสข้อมูลการรับส่งของคุณและอำพรางตัวตน/ที่อยู่อินเทอร์เน็ตเพื่อความปลอดภัยในการสื่อสาร', 'ป้องกันพนักงานไม่ให้อู้งาน'],
                correct: 2
            },
            {
                question: 'ไฟร์วอลล์ (Firewall) ในระบบคอมพิวเตอร์ทำหน้าที่เปรียบเสมือนอะไร?',
                choices: ['ยามเฝ้าประตูที่คอยตรวจคัดกรองข้อมูลเข้า-ออกเครือข่ายตามเกณฑ์ที่กำหนด', 'โปรแกรมสแกนหาข้อผิดพลาดทางไวยากรณ์ในโค้ด', 'เครื่องปรับอากาศเพื่อระบายความร้อนของเซิร์ฟเวอร์', 'โปรแกรมช่วยพิมพ์ข้อความอย่างรวดเร็ว'],
                correct: 0
            }
        ]
    }
];

function initDatabase() {
    if (!localStorage.getItem('smartlearn_users')) {
        const initialUsers = [
            { 
                username: 'admin', 
                password: 'admin123', 
                name: 'ผู้บริหารระบบ (Admin)', 
                role: 'admin',
                avatar: '',
                email: 'admin@wasuwat.com',
                phone: '02-123-4567',
                department: 'สำนักเทคโนโลยีสารสนเทศ',
                position: 'IT Manager',
                bio: 'ยินดีต้อนรับแอดมินทุกท่าน สู่หน้าบริการควบคุมหลังบ้าน'
            },
            { 
                username: 'student', 
                password: 'student123', 
                name: 'สมชาย เรียนดี', 
                role: 'student', 
                assignedCourses: ['course-cybersecurity', 'course-advancednet'], 
                progress: {},
                avatar: '',
                email: 'somchai@wasuwat.com',
                phone: '089-123-4567',
                department: 'ฝ่ายส่งเสริมการขาย',
                position: 'Sales Representative',
                bio: 'ยินดีที่ได้เข้าร่วมอบรมความรู้ทางไอทีครับ'
            }
        ];
        localStorage.setItem('smartlearn_users', JSON.stringify(initialUsers));
    }
    if (!localStorage.getItem('smartlearn_courses')) {
        localStorage.setItem('smartlearn_courses', JSON.stringify(DEFAULT_COURSES));
    }
}

// 3. Database Access Helpers
function getUsers() {
    return JSON.parse(localStorage.getItem('smartlearn_users'));
}

function saveUsers(users) {
    localStorage.setItem('smartlearn_users', JSON.stringify(users));
}

function getCourses() {
    return JSON.parse(localStorage.getItem('smartlearn_courses'));
}

function saveCourses(courses) {
    localStorage.setItem('smartlearn_courses', JSON.stringify(courses));
}

// Toast Notification Helper
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Image processing and Canvas compressor for LocalStorage optimization
function handleAvatarUpload(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Resize and crop image to 150x150 square
            const canvas = document.createElement('canvas');
            const size = 150;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            // Calculate cropping coords (center square)
            const minSide = Math.min(img.width, img.height);
            const sx = (img.width - minSide) / 2;
            const sy = (img.height - minSide) / 2;
            
            ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
            
            // Convert to high-performance small Base64 JPEG string (~6KB)
            const base64 = canvas.toDataURL('image/jpeg', 0.75);
            callback(base64);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 4. View Router & Navigation
function navigateTo(view) {
    state.currentView = view;
    if (view !== 'course-viewer' || state.activeCourseStep !== 2) {
        clearInterval(state.videoInterval);
        state.videoMockPlaying = false;
        state.videoMockProgress = 0;
        state.videoMockTime = 0;
    }
    
    // Refresh state.currentUser details from database before rendering
    if (state.currentUser) {
        const dbUsers = getUsers();
        const freshUser = dbUsers.find(u => u.username === state.currentUser.username);
        if (freshUser) {
            state.currentUser = freshUser;
        }
    }
    
    renderView();
}

function renderView() {
    const appEl = document.getElementById('app');
    
    if (state.currentView !== 'login' && !state.currentUser) {
        state.currentView = 'login';
    }

    switch (state.currentView) {
        case 'login':
            renderLogin(appEl);
            break;
        case 'student-dashboard':
            renderStudentDashboard(appEl);
            break;
        case 'course-viewer':
            renderCourseViewer(appEl);
            break;
        case 'admin-dashboard':
            renderAdminDashboard(appEl);
            break;
        default:
            renderLogin(appEl);
    }
}

// Render Navigation Header with Avatar
function getHeaderHTML() {
    if (!state.currentUser) return '';
    const isAdmin = state.currentUser.role === 'admin';
    const roleText = isAdmin ? 'ผู้ดูแลระบบ' : 'ผู้เรียน';
    const roleClass = isAdmin ? 'admin' : 'student';
    
    // Check if user has avatar
    let avatarHTML = '';
    if (state.currentUser.avatar && state.currentUser.avatar.trim() !== '') {
        avatarHTML = `<img class="navbar-avatar" src="${state.currentUser.avatar}" alt="profile">`;
    } else {
        const initial = state.currentUser.name ? state.currentUser.name.charAt(0).toUpperCase() : 'U';
        avatarHTML = `<div class="navbar-avatar-placeholder">${initial}</div>`;
    }
    
    return `
        <header class="navbar">
            <div class="container navbar-container">
                <a href="#" class="navbar-logo" id="nav-logo-btn">
                    <i class="fa-solid fa-graduation-cap logo-icon"></i>
                    <span>Wasuwat Training</span>
                </a>
                <div class="navbar-profile">
                    <div class="user-badge">
                        ${avatarHTML}
                        <span class="user-name-span">${state.currentUser.name}</span>
                        <span class="role-badge ${roleClass}">${roleText}</span>
                    </div>
                    ${isAdmin ? `
                        <button class="btn btn-secondary logout-btn" id="nav-dashboard-btn" style="padding: 8px 12px;">
                            <i class="fa-solid fa-gear"></i> จัดการหลังบ้าน
                        </button>
                    ` : ''}
                    <button class="logout-btn" id="logout-btn">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i> ออกจากระบบ
                    </button>
                </div>
            </div>
        </header>
    `;
}

// Register Global Event Listeners for Header Actions
function bindHeaderEvents() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            state.currentUser = null;
            navigateTo('login');
            showToast('ออกจากระบบเรียบร้อยแล้ว', 'success');
        });
    }

    const logoBtn = document.getElementById('nav-logo-btn');
    if (logoBtn) {
        logoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (state.currentUser.role === 'admin') {
                navigateTo('admin-dashboard');
            } else {
                navigateTo('student-dashboard');
            }
        });
    }

    const adminDashboardBtn = document.getElementById('nav-dashboard-btn');
    if (adminDashboardBtn) {
        adminDashboardBtn.addEventListener('click', () => {
            navigateTo('admin-dashboard');
        });
    }
}

// 5. LOGIN VIEW RENDERER
function renderLogin(container) {
    container.innerHTML = `
        <div class="login-view fade-in">
            <div class="login-card glass-panel">
                <div class="login-header">
                    <div class="logo">
                        <i class="fa-solid fa-graduation-cap logo-icon"></i>
                        <span>Wasuwat Training</span>
                    </div>
                    <p>ระบบการอบรมและแบบทดสอบออนไลน์</p>
                </div>
                <div class="login-error" id="login-error">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span id="error-msg">ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง</span>
                </div>
                <form id="login-form">
                    <div class="form-group">
                        <label for="username">ชื่อผู้ใช้งาน (Username)</label>
                        <div class="input-container">
                            <input type="text" id="username" class="input-field" placeholder="กรอกชื่อผู้ใช้งาน..." required>
                            <i class="fa-solid fa-user"></i>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="password">รหัสผ่าน (Password)</label>
                        <div class="input-container">
                            <input type="password" id="password" class="input-field" placeholder="กรอกรหัสผ่าน..." required>
                            <i class="fa-solid fa-lock"></i>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary login-btn">
                        เข้าสู่ระบบ <i class="fa-solid fa-arrow-right-to-bracket"></i>
                    </button>
                </form>
            </div>
        </div>
    `;

    const form = document.getElementById('login-form');
    const errorEl = document.getElementById('login-error');
    const errorMsgEl = document.getElementById('error-msg');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value;

        const users = getUsers();
        const foundUser = users.find(u => u.username.toLowerCase() === usernameInput.toLowerCase() && u.password === passwordInput);

        if (foundUser) {
            state.currentUser = foundUser;
            showToast(`ยินดีต้อนรับคุณ ${foundUser.name}`, 'success');
            if (foundUser.role === 'admin') {
                navigateTo('admin-dashboard');
            } else {
                navigateTo('student-dashboard');
            }
        } else {
            errorEl.style.display = 'flex';
            errorMsgEl.textContent = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        }
    });
}

// 6. STUDENT DASHBOARD VIEW RENDERER
function renderStudentDashboard(container) {
    const courses = getCourses();
    const users = getUsers();
    const dbUser = users.find(u => u.username === state.currentUser.username);
    
    // Safely verify arrays exist on older databases
    if (!dbUser.assignedCourses) dbUser.assignedCourses = courses.map(c => c.id);
    const assignedCoursesIds = dbUser.assignedCourses;
    const progress = dbUser.progress || {};

    // Filter to only display courses assigned to THIS user
    const assignedCourses = courses.filter(c => assignedCoursesIds.includes(c.id));

    // Calculate Statistics
    const totalCourses = assignedCourses.length;
    let completedCount = 0;
    let inProgressCount = 0;

    assignedCourses.forEach(c => {
        const prog = progress[c.id];
        if (prog) {
            if (prog.status === 'completed') completedCount++;
            else inProgressCount++;
        }
    });

    let coursesHTML = '';
    if (assignedCourses.length === 0) {
        coursesHTML = `
            <div class="glass-panel" style="padding: 40px; text-align: center; color: var(--text-muted);">
                <i class="fa-solid fa-circle-info" style="font-size: 3rem; margin-bottom: 16px; color: var(--text-dark);"></i>
                <p style="font-size: 1.1rem; font-weight:600; margin-bottom:6px;">ยังไม่พบบทเรียนที่ได้รับมอบหมาย</p>
                <p style="font-size: 0.9rem;">คุณยังไม่ได้รับมอบหมายวิชาเรียนใด ๆ ในระบบขณะนี้ กรุณาแจ้งผู้บริหารระบบ (Admin)</p>
            </div>
        `;
    } else {
        coursesHTML = `
            <div class="course-grid">
                ${assignedCourses.map(course => {
                    const prog = progress[course.id];
                    let status = 'notstarted';
                    let statusLabel = 'ยังไม่เริ่มเรียน';
                    let btnLabel = 'เริ่มอบรมกันเลย';
                    let badgeClass = 'badge-notstarted';

                    if (prog) {
                        if (prog.status === 'completed') {
                            status = 'completed';
                            statusLabel = 'ผ่านหลักสูตรแล้ว';
                            btnLabel = 'เข้าทบทวนบทเรียน';
                            badgeClass = 'badge-completed';
                        } else {
                            status = 'inprogress';
                            statusLabel = 'กำลังเรียนอยู่';
                            btnLabel = 'เรียนต่อจากเดิม';
                            badgeClass = 'badge-inprogress';
                        }
                    }

                    // CHECK FOR PRE-REQUISITE locks
                    let isLocked = false;
                    let prereqCourse = null;
                    
                    if (course.prerequisiteId) {
                        prereqCourse = courses.find(c => c.id === course.prerequisiteId);
                        const isPrereqAssigned = assignedCoursesIds.includes(course.prerequisiteId);
                        const isPrereqCompleted = progress[course.prerequisiteId]?.status === 'completed';
                        
                        if (isPrereqAssigned && !isPrereqCompleted) {
                            isLocked = true;
                        }
                    }

                    if (isLocked) {
                        statusLabel = 'ถูกล็อก (Locked)';
                        badgeClass = 'badge-locked';
                        btnLabel = 'ยังไม่เปิดสิทธิ์';
                    }

                    return `
                        <div class="course-card glass-panel fade-in ${isLocked ? 'locked-sequence' : ''}">
                            <div class="course-header">
                                <span class="course-badge ${badgeClass}">
                                    ${isLocked ? '<i class="fa-solid fa-lock" style="margin-right:4px;"></i>' : ''} ${statusLabel}
                                </span>
                                <h2>${course.title}</h2>
                            </div>
                            <div class="course-body">
                                <p class="course-desc">${course.description}</p>
                                
                                ${isLocked ? `
                                    <div class="prereq-alert">
                                        <i class="fa-solid fa-circle-exclamation"></i>
                                        <span>จำเป็นต้องเรียนผ่านวิชา <strong>"${prereqCourse ? prereqCourse.title : 'วิชาก่อนหน้า'}"</strong> ก่อนเข้าเรียนคอร์สนี้</span>
                                    </div>
                                ` : `
                                    <div class="course-meta">
                                        <span><i class="fa-solid fa-video"></i> 1 วิดีโอ</span>
                                        <span><i class="fa-solid fa-clipboard-question"></i> แบบทดสอบ 2 ชุด</span>
                                        <span><i class="fa-solid fa-circle-check"></i> เกณฑ์ผ่าน ${course.passingScore}%</span>
                                    </div>
                                `}
                            </div>
                            <div class="course-footer">
                                <button class="btn btn-primary start-course-btn" data-id="${course.id}" ${isLocked ? 'disabled' : ''}>
                                    ${isLocked ? 'กรุณาผ่านวิชาก่อนหน้า' : btnLabel} <i class="fa-solid fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Prepare profile picture container HTML
    let profilePicHTML = '';
    if (dbUser.avatar && dbUser.avatar.trim() !== '') {
        profilePicHTML = `<img class="avatar-image-preview" id="stud-avatar-preview" src="${dbUser.avatar}" alt="avatar">`;
    } else {
        const initial = dbUser.name ? dbUser.name.charAt(0).toUpperCase() : 'U';
        profilePicHTML = `
            <div class="avatar-image-preview" id="stud-avatar-preview" style="background:var(--bg-primary); display:flex; align-items:center; justify-content:center; font-size:3rem; font-weight:700; color:var(--primary);">
                ${initial}
            </div>
        `;
    }

    container.innerHTML = `
        ${getHeaderHTML()}
        <main class="container student-layout fade-in">
            <div class="page-title-section">
                <div>
                    <h1>แผงข้อมูลผู้เรียน (Learning Dashboard)</h1>
                    <p>ระบบการฝึกอบรมระดับพรีเมียมส่วนบุคคลของคุณ</p>
                </div>
            </div>

            <!-- Stats Bar -->
            <div class="dashboard-stats">
                <div class="glass-panel stat-card">
                    <div class="stat-icon"><i class="fa-solid fa-book-open"></i></div>
                    <div class="stat-info">
                        <h3>${totalCourses}</h3>
                        <p>บทเรียนที่คุณต้องเรียน</p>
                    </div>
                </div>
                <div class="glass-panel stat-card">
                    <div class="stat-icon" style="background: var(--accent-glow); color: var(--accent);"><i class="fa-solid fa-spinner"></i></div>
                    <div class="stat-info">
                        <h3>${inProgressCount}</h3>
                        <p>กำลังศึกษาอยู่</p>
                    </div>
                </div>
                <div class="glass-panel stat-card completed">
                    <div class="stat-icon"><i class="fa-solid fa-circle-check"></i></div>
                    <div class="stat-info">
                        <h3>${completedCount}</h3>
                        <p>สำเร็จการอบรมแล้ว</p>
                    </div>
                </div>
            </div>

            <!-- Courses Section -->
            <div>
                <h3 class="course-section-title">
                    <i class="fa-solid fa-graduation-cap" style="color: var(--primary);"></i>
                    วิชาเรียนที่ได้รับมอบหมาย
                </h3>
                ${coursesHTML}
            </div>

            <!-- Personal Profile Section -->
            <div class="glass-panel profile-section-card">
                <h2><i class="fa-solid fa-address-card"></i> จัดการโปรไฟล์ผู้ใช้งาน</h2>
                
                <div class="profile-layout">
                    <!-- Column 1: Avatar -->
                    <div class="profile-avatar-col">
                        <div class="avatar-upload-frame" id="avatar-frame-btn">
                            ${profilePicHTML}
                            <div class="avatar-upload-overlay">
                                <i class="fa-solid fa-camera"></i>
                                <span>คลิกเปลี่ยนรูปภาพ</span>
                            </div>
                        </div>
                        <input type="file" id="profile-avatar-input" class="hidden-file-input" accept="image/*">
                        <span class="avatar-label-info">
                            * รูปสี่เหลี่ยมจัตุรัสจะแสดงผลดีที่สุด <br>
                            (ระบบรองรับไฟล์ JPG, PNG และ JPEG)
                        </span>
                    </div>

                    <!-- Column 2: Personal fields form -->
                    <form id="save-profile-form" style="width: 100%;">
                        <div class="profile-form-grid">
                            <div class="form-group">
                                <label for="prof-name">ชื่อ-นามสกุลจริง</label>
                                <input type="text" id="prof-name" class="input-field" style="padding-left:14px;" value="${escapeHtml(dbUser.name)}" required>
                            </div>
                            <div class="form-group">
                                <label for="prof-email">ที่อยู่อีเมล (Email)</label>
                                <input type="email" id="prof-email" class="input-field" style="padding-left:14px;" value="${escapeHtml(dbUser.email || '')}" placeholder="เช่น somchai@wasuwat.com">
                            </div>
                            <div class="form-group">
                                <label for="prof-phone">เบอร์โทรศัพท์ติดต่อ</label>
                                <input type="tel" id="prof-phone" class="input-field" style="padding-left:14px;" value="${escapeHtml(dbUser.phone || '')}" placeholder="เช่น 089-123-4567">
                            </div>
                            <div class="form-group">
                                <label for="prof-dept">ฝ่าย / แผนกงาน</label>
                                <input type="text" id="prof-dept" class="input-field" style="padding-left:14px;" value="${escapeHtml(dbUser.department || '')}" placeholder="เช่น ฝ่ายการตลาด (Marketing)">
                            </div>
                            <div class="form-group">
                                <label for="prof-pos">ตำแหน่งหน้าที่</label>
                                <input type="text" id="prof-pos" class="input-field" style="padding-left:14px;" value="${escapeHtml(dbUser.position || '')}" placeholder="เช่น Senior Sales Executive">
                            </div>
                            <div class="form-group">
                                <label for="prof-bio">ข้อมูลแนะตัวย่อ (Bio)</label>
                                <input type="text" id="prof-bio" class="input-field" style="padding-left:14px;" value="${escapeHtml(dbUser.bio || '')}" placeholder="คำคมแนะนำตัวเองสั้น ๆ...">
                            </div>
                        </div>
                        <div style="text-align: right; margin-top: 10px;">
                            <button type="submit" class="btn btn-primary">
                                บันทึกข้อมูลโปรไฟล์ <i class="fa-solid fa-circle-check"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Account Security Section -->
            <div class="glass-panel settings-section">
                <h2><i class="fa-solid fa-shield-halved"></i> ความปลอดภัยและการเปลี่ยนรหัสผ่าน</h2>
                <form id="change-pwd-form">
                    <div class="form-group">
                        <label for="curr-pwd">รหัสผ่านปัจจุบัน (Current Password)</label>
                        <div class="input-container">
                            <input type="password" id="curr-pwd" class="input-field" placeholder="กรอกรหัสผ่านเดิม..." required>
                            <i class="fa-solid fa-unlock"></i>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="new-pwd">รหัสผ่านใหม่ (New Password)</label>
                        <div class="input-container">
                            <input type="password" id="new-pwd" class="input-field" placeholder="กรอกรหัสผ่านใหม่..." required>
                            <i class="fa-solid fa-lock"></i>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="confirm-pwd">ยืนยันรหัสผ่านใหม่ (Confirm Password)</label>
                        <div class="input-container">
                            <input type="password" id="confirm-pwd" class="input-field" placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง..." required>
                            <i class="fa-solid fa-circle-check"></i>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        บันทึกรหัสผ่านใหม่ <i class="fa-solid fa-key"></i>
                    </button>
                </form>
            </div>
        </main>
    `;

    bindHeaderEvents();

    // Bind Course Start buttons
    const startBtns = document.querySelectorAll('.start-course-btn');
    startBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const courseId = btn.getAttribute('data-id');
            startCourse(courseId);
        });
    });

    // Profile photo upload click bindings
    const avatarFrameBtn = document.getElementById('avatar-frame-btn');
    const fileInput = document.getElementById('profile-avatar-input');
    
    if (avatarFrameBtn && fileInput) {
        avatarFrameBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    showToast('ขนาดภาพต้องไม่เกิน 2MB', 'error');
                    return;
                }

                // Call canvas compressor helper
                handleAvatarUpload(file, (base64Data) => {
                    const allUsers = getUsers();
                    const index = allUsers.findIndex(u => u.username === state.currentUser.username);
                    if (index !== -1) {
                        allUsers[index].avatar = base64Data;
                        saveUsers(allUsers);
                        state.currentUser.avatar = base64Data;
                        
                        // Update UI images instantly
                        const previewEl = document.getElementById('stud-avatar-preview');
                        if (previewEl) {
                            if (previewEl.tagName === 'IMG') {
                                previewEl.src = base64Data;
                            } else {
                                // Replace text placeholder with image element
                                const newImg = document.createElement('img');
                                newImg.className = 'avatar-image-preview';
                                newImg.id = 'stud-avatar-preview';
                                newImg.src = base64Data;
                                previewEl.replaceWith(newImg);
                            }
                        }

                        // Also update navbar logo avatar if visible
                        const navBadge = document.querySelector('.user-badge');
                        if (navBadge) {
                            const navbarAvatar = navBadge.querySelector('.navbar-avatar') || navBadge.querySelector('.navbar-avatar-placeholder');
                            if (navbarAvatar) {
                                const newNavImg = document.createElement('img');
                                newNavImg.className = 'navbar-avatar';
                                newNavImg.src = base64Data;
                                navbarAvatar.replaceWith(newNavImg);
                            }
                        }
                        
                        showToast('อัปโหลดรูปภาพโปรไฟล์เรียบร้อยแล้ว', 'success');
                    }
                });
            }
        });
    }

    // Save profile form submission
    const saveProfileForm = document.getElementById('save-profile-form');
    saveProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameVal = document.getElementById('prof-name').value.trim();
        const emailVal = document.getElementById('prof-email').value.trim();
        const phoneVal = document.getElementById('prof-phone').value.trim();
        const deptVal = document.getElementById('prof-dept').value.trim();
        const posVal = document.getElementById('prof-pos').value.trim();
        const bioVal = document.getElementById('prof-bio').value.trim();

        if (!nameVal) {
            showToast('กรุณากรอกชื่อจริง-นามสกุล', 'error');
            return;
        }

        const allUsers = getUsers();
        const index = allUsers.findIndex(u => u.username === state.currentUser.username);

        if (index !== -1) {
            allUsers[index].name = nameVal;
            allUsers[index].email = emailVal;
            allUsers[index].phone = phoneVal;
            allUsers[index].department = deptVal;
            allUsers[index].position = posVal;
            allUsers[index].bio = bioVal;

            saveUsers(allUsers);
            state.currentUser = allUsers[index]; // Update session details

            // Update Name in Navbar Badge immediately
            const nameSpan = document.querySelector('.user-name-span');
            if (nameSpan) nameSpan.textContent = nameVal;

            showToast('บันทึกข้อมูลส่วนตัวของโปรไฟล์เรียบร้อยแล้ว', 'success');
        }
    });

    // Password change submission
    const pwdForm = document.getElementById('change-pwd-form');
    pwdForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currPwd = document.getElementById('curr-pwd').value;
        const newPwd = document.getElementById('new-pwd').value;
        const confirmPwd = document.getElementById('confirm-pwd').value;

        const allUsers = getUsers();
        const index = allUsers.findIndex(u => u.username === state.currentUser.username);

        if (index === -1) return;

        if (allUsers[index].password !== currPwd) {
            showToast('รหัสผ่านปัจจุบันไม่ถูกต้อง', 'error');
            return;
        }

        if (newPwd.length < 4) {
            showToast('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร', 'error');
            return;
        }

        if (newPwd !== confirmPwd) {
            showToast('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน', 'error');
            return;
        }

        allUsers[index].password = newPwd;
        saveUsers(allUsers);
        state.currentUser.password = newPwd;

        showToast('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว แอดมินจะสามารถอ้างอิงรหัสผ่านใหม่นี้ได้ทันที', 'success');
        pwdForm.reset();
    });
}

// 7. COURSE LEARNING VIEWER ENGINE
function startCourse(courseId) {
    const courses = getCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    state.activeCourseId = courseId;
    
    // Find current progress
    const users = getUsers();
    const dbUser = users.find(u => u.username === state.currentUser.username);
    const progress = dbUser.progress || {};
    const prog = progress[courseId];

    if (!prog) {
        progress[courseId] = {
            status: 'pre-test', // 'pre-test', 'video', 'post-test', 'completed'
            preScore: null,
            postScore: null,
            videoWatched: false
        };
        dbUser.progress = progress;
        saveUsers(users);
        state.activeCourseStep = 1;
    } else {
        if (prog.status === 'pre-test') state.activeCourseStep = 1;
        else if (prog.status === 'video') state.activeCourseStep = 2;
        else if (prog.status === 'post-test') state.activeCourseStep = 3;
        else if (prog.status === 'completed') state.activeCourseStep = 1; // reset/let review
    }

    state.quizAnswers = {};
    state.quizResults = null;
    navigateTo('course-viewer');
}

function renderCourseViewer(container) {
    const courses = getCourses();
    const course = courses.find(c => c.id === state.activeCourseId);
    if (!course) return;

    const users = getUsers();
    const dbUser = users.find(u => u.username === state.currentUser.username);
    const progress = dbUser.progress || {};
    const prog = progress[course.id] || { status: 'pre-test' };

    const isStep2Locked = prog.status === 'pre-test';
    const isStep3Locked = prog.status === 'pre-test' || prog.status === 'video';

    let contentHTML = '';

    if (state.activeCourseStep === 1) {
        contentHTML = getPreTestHTML(course, prog);
    } else if (state.activeCourseStep === 2) {
        contentHTML = getVideoHTML(course, prog);
    } else if (state.activeCourseStep === 3) {
        contentHTML = getPostTestHTML(course, prog);
    }

    container.innerHTML = `
        ${getHeaderHTML()}
        <main class="container learn-layout fade-in">
            <!-- Sidebar: Steps Tracker -->
            <div class="glass-panel learn-sidebar">
                <div class="sidebar-title">ความคืบหน้าของบทเรียน</div>
                <div class="steps-list">
                    <!-- Step 1 -->
                    <div class="step-item ${state.activeCourseStep === 1 ? 'active' : ''} ${prog.preScore !== null ? 'completed' : ''}" id="step-1-btn">
                        <div class="step-indicator-num">
                            ${prog.preScore !== null ? '<i class="fa-solid fa-check"></i>' : '1'}
                        </div>
                        <div class="step-item-info">
                            <h4>ขั้นตอนที่ 1: แบบทดสอบก่อนเรียน</h4>
                            <p>${prog.preScore !== null ? `เรียบร้อย (${prog.preScore}/${course.preQuestions.length} คะแนน)` : 'ยังไม่ดำเนินการ'}</p>
                        </div>
                    </div>

                    <!-- Step 2 -->
                    <div class="step-item ${state.activeCourseStep === 2 ? 'active' : ''} ${isStep2Locked ? 'locked' : ''} ${prog.videoWatched ? 'completed' : ''}" id="step-2-btn">
                        <div class="step-indicator-num">
                            ${prog.videoWatched ? '<i class="fa-solid fa-check"></i>' : (isStep2Locked ? '<i class="fa-solid fa-lock"></i>' : '2')}
                        </div>
                        <div class="step-item-info">
                            <h4>ขั้นตอนที่ 2: วิดีโอการอบรม</h4>
                            <p>${prog.videoWatched ? 'รับชมเสร็จสมบูรณ์' : (isStep2Locked ? 'กรุณาผ่านแบบทดสอบก่อนเรียน' : 'กำลังรอรับชม')}</p>
                        </div>
                    </div>

                    <!-- Step 3 -->
                    <div class="step-item ${state.activeCourseStep === 3 ? 'active' : ''} ${isStep3Locked ? 'locked' : ''} ${prog.status === 'completed' ? 'completed' : ''}" id="step-3-btn">
                        <div class="step-indicator-num">
                            ${prog.status === 'completed' ? '<i class="fa-solid fa-medal"></i>' : (isStep3Locked ? '<i class="fa-solid fa-lock"></i>' : '3')}
                        </div>
                        <div class="step-item-info">
                            <h4>ขั้นตอนที่ 3: แบบทดสอบหลังเรียน</h4>
                            <p>${prog.status === 'completed' ? `ผ่านเกณฑ์ (${prog.postScore}/${course.postQuestions.length} คะแนน)` : (isStep3Locked ? 'กรุณารับชมวิดีโอจนจบ' : 'รอดำเนินการวัดผล')}</p>
                        </div>
                    </div>
                </div>

                <button class="btn btn-secondary" id="back-dashboard-btn" style="margin-top: 32px; width: 100%;">
                    <i class="fa-solid fa-arrow-left"></i> กลับแผงควบคุมหลัก
                </button>
            </div>

            <!-- Content Area -->
            <div class="glass-panel learn-content fade-in" id="learn-content-pane">
                ${contentHTML}
            </div>
        </main>
    `;

    bindHeaderEvents();
    bindCourseViewerEvents(course, prog);
}

function bindCourseViewerEvents(course, prog) {
    const backBtn = document.getElementById('back-dashboard-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            navigateTo('student-dashboard');
        });
    }

    const isStep2Locked = prog.status === 'pre-test';
    const isStep3Locked = prog.status === 'pre-test' || prog.status === 'video';

    document.getElementById('step-1-btn').addEventListener('click', () => {
        state.activeCourseStep = 1;
        state.quizAnswers = {};
        state.quizResults = null;
        renderCourseViewer(document.getElementById('app'));
    });

    if (!isStep2Locked) {
        document.getElementById('step-2-btn').addEventListener('click', () => {
            state.activeCourseStep = 2;
            renderCourseViewer(document.getElementById('app'));
        });
    }

    if (!isStep3Locked) {
        document.getElementById('step-3-btn').addEventListener('click', () => {
            state.activeCourseStep = 3;
            state.quizAnswers = {};
            state.quizResults = null;
            renderCourseViewer(document.getElementById('app'));
        });
    }

    if (state.activeCourseStep === 1 || state.activeCourseStep === 3) {
        const questions = state.activeCourseStep === 1 ? course.preQuestions : course.postQuestions;
        
        const optionCards = document.querySelectorAll('.option-card');
        optionCards.forEach(card => {
            card.addEventListener('click', () => {
                const qIdx = parseInt(card.getAttribute('data-q'));
                const cIdx = parseInt(card.getAttribute('data-c'));
                
                state.quizAnswers[qIdx] = cIdx;
                
                document.querySelectorAll(`.option-card[data-q="${qIdx}"]`).forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                const submitBtn = document.getElementById('submit-quiz-btn');
                if (submitBtn) {
                    const answeredCount = Object.keys(state.quizAnswers).length;
                    submitBtn.disabled = answeredCount < questions.length;
                }
            });
        });

        const quizForm = document.getElementById('quiz-form');
        if (quizForm) {
            quizForm.addEventListener('submit', (e) => {
                e.preventDefault();
                submitQuiz(course);
            });
        }

        const retryBtn = document.getElementById('retry-quiz-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                state.quizAnswers = {};
                state.quizResults = null;
                renderCourseViewer(document.getElementById('app'));
            });
        }
    }

    if (state.activeCourseStep === 2) {
        const markWatchedBtn = document.getElementById('mark-watched-btn');
        if (markWatchedBtn) {
            markWatchedBtn.addEventListener('click', () => {
                completeVideoStep(course);
            });
        }

        const playOverlay = document.getElementById('video-overlay');
        const playBtn = document.getElementById('video-play-btn');
        
        const togglePlay = () => {
            if (state.videoMockPlaying) {
                state.videoMockPlaying = false;
                if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                clearInterval(state.videoInterval);
            } else {
                state.videoMockPlaying = true;
                if (playOverlay) playOverlay.style.display = 'none';
                if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                
                state.videoInterval = setInterval(() => {
                    state.videoMockTime++;
                    state.videoMockProgress = Math.min((state.videoMockTime / state.videoMockDuration) * 100, 100);
                    
                    const progressFill = document.getElementById('video-progress-fill');
                    if (progressFill) progressFill.style.width = `${state.videoMockProgress}%`;
                    
                    const timeEl = document.getElementById('video-time-display');
                    if (timeEl) {
                        const curMin = Math.floor(state.videoMockTime / 60);
                        const curSec = state.videoMockTime % 60;
                        const durMin = Math.floor(state.videoMockDuration / 60);
                        const durSec = state.videoMockDuration % 60;
                        timeEl.textContent = `${curMin}:${curSec.toString().padStart(2, '0')} / ${durMin}:${durSec.toString().padStart(2, '0')}`;
                    }

                    if (state.videoMockTime >= state.videoMockDuration) {
                        clearInterval(state.videoInterval);
                        state.videoMockPlaying = false;
                        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                        completeVideoStep(course);
                    }
                }, 1000);
            }
        };

        if (playOverlay) playOverlay.addEventListener('click', togglePlay);
        if (playBtn) playBtn.addEventListener('click', togglePlay);
    }
}

function getYouTubeEmbedUrl(url) {
    if (!url) return '';
    url = url.trim();
    
    if (url.includes('youtube.com/embed/')) {
        return url;
    }
    
    let videoId = '';
    
    if (url.includes('youtu.be/')) {
        const parts = url.split('youtu.be/');
        if (parts[1]) {
            videoId = parts[1].split('?')[0].split('&')[0];
        }
    } 
    else if (url.includes('youtube.com/watch')) {
        try {
            const urlObj = new URL(url);
            videoId = urlObj.searchParams.get('v');
        } catch (e) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            if (match && match[2].length === 11) {
                videoId = match[2];
            }
        }
    }
    else if (url.includes('youtube.com/shorts/')) {
        const parts = url.split('youtube.com/shorts/');
        if (parts[1]) {
            videoId = parts[1].split('?')[0].split('&')[0];
        }
    }
    else {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            videoId = match[2];
        }
    }
    
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return url;
}

function getVideoHTML(course, prog) {
    const embedUrl = getYouTubeEmbedUrl(course.videoUrl);
    const isYouTube = embedUrl && (embedUrl.includes('youtube.com/embed/') || embedUrl.includes('youtube.com') || embedUrl.includes('youtu.be'));
    let playerHTML = '';

    if (isYouTube) {
        playerHTML = `
            <div class="video-wrapper">
                <iframe class="video-iframe" src="${embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        `;
    } else {
        playerHTML = `
            <div class="video-wrapper">
                <div class="video-play-overlay" id="video-overlay" style="${state.videoMockTime > 0 ? 'display:none;' : ''}">
                    <div class="play-circle"><i class="fa-solid fa-play"></i></div>
                    <p>คลิกเพื่อเล่นวิดีโออบรมความยาว ${state.videoMockDuration} วินาที</p>
                </div>
                <div class="video-mockup">
                    <div class="video-mockup-body">
                        <i class="fa-solid fa-graduation-cap"></i>
                        <h4>กำลังฉายสไลด์ประกอบการอบรมบรรยาย</h4>
                        <p style="color: var(--text-muted); text-align:center;">${course.title}</p>
                    </div>
                    <div class="video-controls">
                        <button class="control-btn" id="video-play-btn"><i class="fa-solid fa-play"></i></button>
                        <div class="progress-bar-container">
                            <div class="progress-fill" id="video-progress-fill" style="width: ${state.videoMockProgress}%">
                                <div class="progress-knob"></div>
                            </div>
                        </div>
                        <div class="video-time" id="video-time-display">0:00 / 0:15</div>
                    </div>
                </div>
            </div>
        `;
    }

    return `
        <div class="step-header">
            <h2>ขั้นตอนที่ 2: สื่อการฝึกอบรมวิดีโอ (Video Instruction)</h2>
            <p>${course.title}</p>
        </div>
        <div class="quiz-instructions" style="border-left-color: var(--accent)">
            <h5>คำแนะนำในการรับชม</h5>
            <p>กรุณารับชมวิดีโอด้านล่างจนสิ้นสุด เพื่อทำความเข้าใจก่อนทำแบบทดสอบวัดผลหลังเรียน</p>
        </div>

        ${playerHTML}

        <div class="video-actions">
            <div class="video-status-msg ${prog.videoWatched ? 'watched' : 'unwatched'}">
                <i class="fa-solid ${prog.videoWatched ? 'fa-circle-check' : 'fa-clock'}"></i>
                <span>สถานะ: ${prog.videoWatched ? 'รับชมผ่านเกณฑ์แล้ว' : 'ยังรับชมไม่ผ่านเกณฑ์'}</span>
            </div>
            
            <button class="btn ${prog.videoWatched ? 'btn-secondary' : 'btn-success'}" id="mark-watched-btn">
                ${prog.videoWatched ? 'รับชมแล้วเรียบร้อย' : 'ทำเครื่องหมายว่าดูจบแล้ว <i class="fa-solid fa-check-double"></i>'}
            </button>
        </div>
    `;
}

function getPreTestHTML(course, prog) {
    if (prog.preScore !== null) {
        return `
            <div class="step-header">
                <h2>ขั้นตอนที่ 1: แบบทดสอบก่อนเรียน</h2>
                <p>${course.title}</p>
            </div>
            <div class="result-card glass-panel">
                <div class="result-badge pass"><i class="fa-solid fa-circle-check"></i></div>
                <h3>คุณทำแบบทดสอบก่อนเรียนเสร็จสิ้นแล้ว</h3>
                <div class="result-score">
                    ${prog.preScore} <span>/ ${course.preQuestions.length} คะแนน</span>
                </div>
                <p class="result-desc">
                    ระบบได้บันทึกคะแนนสอบก่อนเรียนของคุณเรียบร้อยแล้ว เพื่อใช้เปรียบเทียบวัดผลหลังจากการอบรมเสร็จสิ้น
                </p>
                <button class="btn btn-primary" id="btn-goto-video" onclick="state.activeCourseStep = 2; renderCourseViewer(document.getElementById('app'));">
                    ไปขั้นตอนถัดไป (รับชมวิดีโอ) <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;
    }

    return `
        <div class="step-header">
            <h2>ขั้นตอนที่ 1: แบบทดสอบก่อนเรียน (Pre-test)</h2>
            <p>${course.title}</p>
        </div>
        <div class="quiz-instructions">
            <h5>คำชี้แจง</h5>
            <p>กรุณาทำข้อสอบประเมินพื้นฐานความรู้เดิมเพื่อทำการปลดล็อกวิดีโออบรมในขั้นถัดไป (คะแนนในขั้นตอนนี้จะไม่ถูกนำมานับเกณฑ์ผ่าน)</p>
        </div>
        <form id="quiz-form">
            ${course.preQuestions.map((q, qIdx) => `
                <div class="question-block">
                    <div class="question-title">
                        <span class="question-num">ข้อที่ ${qIdx + 1}.</span>
                        <span>${q.question}</span>
                    </div>
                    <div class="options-list">
                        ${q.choices.map((c, cIdx) => `
                            <div class="option-card" data-q="${qIdx}" data-c="${cIdx}">
                                <div class="option-circle"></div>
                                <div class="option-text">${c}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
            <div style="text-align: right; margin-top: 40px; border-top: 1px solid var(--border-color); padding-top: 24px;">
                <button type="submit" class="btn btn-primary" id="submit-quiz-btn" disabled>
                    ส่งคำตอบแบบทดสอบ <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </form>
    `;
}

function getPostTestHTML(course, prog) {
    if (state.quizResults) {
        const isPass = state.quizResults.passed;
        const badgeClass = isPass ? 'pass' : 'fail';
        const iconClass = isPass ? 'fa-medal' : 'fa-face-frown';
        const titleText = isPass ? 'ยินดีด้วย! คุณผ่านเกณฑ์ทดสอบ' : 'ผลการสอบยังไม่ผ่านเกณฑ์';
        const descText = isPass 
            ? `คุณทำคะแนนผ่านเกณฑ์ที่กำหนดไว้ (${course.passingScore}%) เรียบร้อยแล้ว หลักสูตรนี้เปลี่ยนสถานะเป็น "เสร็จสมบูรณ์" เรียบร้อย` 
            : `คะแนนของคุณยังไม่ถึงเกณฑ์ขั้นต่ำ ${course.passingScore}% สำหรับการผ่านหลักสูตรนี้ กรุณาทำการทดสอบอีกครั้งเพื่อปรับคะแนน`;

        return `
            <div class="step-header">
                <h2>ผลการทดสอบหลังเรียน (Post-test Result)</h2>
                <p>${course.title}</p>
            </div>
            <div class="result-card glass-panel">
                <div class="result-badge ${badgeClass}"><i class="fa-solid ${iconClass}"></i></div>
                <h3>${titleText}</h3>
                <div class="result-score">
                    ${state.quizResults.score} <span>/ ${course.postQuestions.length} คะแนน (${state.quizResults.percentage}%)</span>
                </div>
                <p class="result-desc">${descText}</p>
                <div style="display:flex; gap:16px; justify-content:center;">
                    ${isPass ? `
                        <button class="btn btn-primary" onclick="navigateTo('student-dashboard');">
                            <i class="fa-solid fa-house"></i> กลับสู่แผงควบคุมหลัก
                        </button>
                    ` : `
                        <button class="btn btn-danger" id="retry-quiz-btn">
                            <i class="fa-solid fa-rotate-left"></i> ทำแบบทดสอบอีกครั้ง
                        </button>
                        <button class="btn btn-secondary" onclick="navigateTo('student-dashboard');">
                            <i class="fa-solid fa-house"></i> กลับสู่หน้าหลัก
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    if (prog.status === 'completed') {
        return `
            <div class="step-header">
                <h2>ขั้นตอนที่ 3: แบบทดสอบหลังเรียน (Post-test)</h2>
                <p>${course.title}</p>
            </div>
            <div class="result-card glass-panel">
                <div class="result-badge pass"><i class="fa-solid fa-medal"></i></div>
                <h3>คุณสำเร็จหลักสูตรนี้เรียบร้อยแล้ว!</h3>
                <div class="result-score">
                    ${prog.postScore} <span>/ ${course.postQuestions.length} คะแนน</span>
                </div>
                <p class="result-desc">
                    คุณได้ผ่านเกณฑ์วัดผลของบทเรียนนี้เรียบร้อยแล้วและทำคะแนนได้ดีมาก สามารถเข้าทำทดสอบทบทวนใหม่ได้ตลอดเวลา
                </p>
                <button class="btn btn-primary" id="retry-quiz-btn">
                    ทำแบบทดสอบทดลองอีกครั้ง <i class="fa-solid fa-arrow-right-rotate"></i>
                </button>
            </div>
        `;
    }

    return `
        <div class="step-header">
            <h2>ขั้นตอนที่ 3: แบบทดสอบหลังเรียน (Post-test)</h2>
            <p>${course.title}</p>
        </div>
        <div class="quiz-instructions" style="border-left-color: var(--success)">
            <h5>คำชี้แจงก่อนทำแบบทดสอบ</h5>
            <p>แบบประเมินนี้ใช้เพื่อการผ่านหลักสูตร โดยมีเกณฑ์การประเมินคะแนนผ่านอย่างน้อย <strong>${course.passingScore}%</strong> หากคุณสอบไม่ผ่านเกณฑ์จะสามารถกดเพื่อทำการทดสอบใหม่ได้ไม่จำกัดจำนวนครั้ง</p>
        </div>
        <form id="quiz-form">
            ${course.postQuestions.map((q, qIdx) => `
                <div class="question-block">
                    <div class="question-title">
                        <span class="question-num">ข้อที่ ${qIdx + 1}.</span>
                        <span>${q.question}</span>
                    </div>
                    <div class="options-list">
                        ${q.choices.map((c, cIdx) => `
                            <div class="option-card" data-q="${qIdx}" data-c="${cIdx}">
                                <div class="option-circle"></div>
                                <div class="option-text">${c}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
            <div style="text-align: right; margin-top: 40px; border-top: 1px solid var(--border-color); padding-top: 24px;">
                <button type="submit" class="btn btn-primary" id="submit-quiz-btn" disabled>
                    ส่งกระดาษคำตอบประเมินผล <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </form>
    `;
}

function completeVideoStep(course) {
    const users = getUsers();
    const dbUser = users.find(u => u.username === state.currentUser.username);
    
    if (dbUser.progress && dbUser.progress[course.id]) {
        dbUser.progress[course.id].videoWatched = true;
        if (dbUser.progress[course.id].status === 'video') {
            dbUser.progress[course.id].status = 'post-test';
        }
        saveUsers(users);
        showToast('เรียนรู้วิดีโอสำเร็จ ปลดล็อกแบบทดสอบหลังเรียนแล้ว!', 'success');
        
        state.activeCourseStep = 3;
        state.quizAnswers = {};
        state.quizResults = null;
        renderCourseViewer(document.getElementById('app'));
    }
}

function submitQuiz(course) {
    const questions = state.activeCourseStep === 1 ? course.preQuestions : course.postQuestions;
    let score = 0;

    questions.forEach((q, idx) => {
        if (state.quizAnswers[idx] === q.correct) {
            score++;
        }
    });

    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= course.passingScore;

    const users = getUsers();
    const dbUser = users.find(u => u.username === state.currentUser.username);
    const progress = dbUser.progress || {};
    const prog = progress[course.id] || {};

    if (state.activeCourseStep === 1) {
        prog.preScore = score;
        prog.status = 'video';
        progress[course.id] = prog;
        dbUser.progress = progress;
        saveUsers(users);
        
        showToast('ส่งคะแนนก่อนเรียนสำเร็จ ปลดล็อกวิดีโออบรมแล้ว!', 'success');
        
        state.activeCourseStep = 2;
        renderCourseViewer(document.getElementById('app'));
    } else {
        prog.postScore = score;
        if (passed) {
            prog.status = 'completed';
        }
        progress[course.id] = prog;
        dbUser.progress = progress;
        saveUsers(users);

        state.quizResults = {
            score,
            total: questions.length,
            percentage,
            passed
        };

        if (passed) {
            showToast('ยินดีด้วย! คุณสอบผ่านเกณฑ์เรียบร้อยแล้ว', 'success');
        } else {
            showToast('ผลการสอบไม่ผ่านเกณฑ์ ลองใหม่อีกครั้งนะ!', 'error');
        }
        renderCourseViewer(document.getElementById('app'));
    }
}

// 8. ADMIN DASHBOARD VIEW RENDERER
function renderAdminDashboard(container) {
    const students = getUsers().filter(u => u.role === 'student');
    const courses = getCourses();

    let studentRows = students.map(student => {
        const progKeys = Object.keys(student.progress || {});
        const assignedIds = student.assignedCourses || [];
        
        let progressDetailHTML = '';
        
        if (assignedIds.length === 0) {
            progressDetailHTML = '<span style="color: var(--text-dark);">ไม่ได้มอบหมายวิชาใด ๆ</span>';
        } else {
            progressDetailHTML = assignedIds.map(cid => {
                const c = courses.find(course => course.id === cid);
                if (!c) return '';
                const prog = student.progress[cid] || { status: 'notstarted', preScore: null, postScore: null };
                
                let scoreText = '';
                if (prog.preScore !== null) scoreText += `ก่อนเรียน: ${prog.preScore}/${c.preQuestions.length}`;
                if (prog.postScore !== null) scoreText += `, หลังเรียน: ${prog.postScore}/${c.postQuestions.length}`;
                
                let statusColor = 'var(--text-muted)';
                let statusLabelText = 'ยังไม่เริ่ม';
                if (prog.status === 'completed') {
                    statusColor = 'var(--success)';
                    statusLabelText = 'จบการอบรม';
                } else if (prog.status === 'video' || prog.status === 'post-test') {
                    statusColor = 'var(--warning)';
                    statusLabelText = 'กำลังเรียน';
                }

                let isSequenceLocked = false;
                if (c.prerequisiteId) {
                    const isPrereqAssigned = assignedIds.includes(c.prerequisiteId);
                    const isPrereqCompleted = student.progress[c.prerequisiteId]?.status === 'completed';
                    if (isPrereqAssigned && !isPrereqCompleted) {
                        isSequenceLocked = true;
                    }
                }
                
                return `
                    <div style="font-size:0.85rem; margin-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.02); padding-bottom: 4px;">
                        <strong>${c.title}</strong> ${isSequenceLocked ? '<i class="fa-solid fa-lock" style="color:var(--error); font-size:0.75rem;" title="ติดวิชาบังคับก่อนหน้า"></i>' : ''}<br>
                        สถานะ: <span style="color: ${statusColor}">${statusLabelText}</span> (${scoreText || 'ไม่มีคะแนน'})
                    </div>
                `;
            }).join('');
        }

        // Render mini avatar in table
        let tableAvatarHTML = '';
        if (student.avatar && student.avatar.trim() !== '') {
            tableAvatarHTML = `<img class="table-avatar" src="${student.avatar}" alt="avatar">`;
        } else {
            const initial = student.name ? student.name.charAt(0).toUpperCase() : 'U';
            tableAvatarHTML = `<div class="table-avatar-placeholder">${initial}</div>`;
        }

        return `
            <tr>
                <td>
                    <div class="table-user-cell">
                        ${tableAvatarHTML}
                        <div>
                            <strong>${student.name}</strong><br>
                            <small style="color:var(--text-muted); font-size:0.75rem;">${student.position || 'ผู้เรียน'} | ${student.department || 'ไม่ระบุแผนก'}</small>
                        </div>
                    </div>
                </td>
                <td><strong style="color:var(--primary); font-family:monospace;">${student.username}</strong></td>
                <td>
                    <span class="pwd-col">${student.password}</span>
                </td>
                <td>
                    <div style="font-size: 0.85rem;">
                        <i class="fa-solid fa-envelope" style="color:var(--text-dark); margin-right:4px;"></i> ${student.email || '-'}<br>
                        <i class="fa-solid fa-phone" style="color:var(--text-dark); margin-right:4px;"></i> ${student.phone || '-'}
                    </div>
                </td>
                <td>${progressDetailHTML}</td>
                <td>
                    <div style="display:flex; flex-direction:column; gap:6px;">
                        <button class="btn btn-secondary edit-student-btn" data-username="${student.username}" style="padding: 6px 12px; font-size: 0.8rem; justify-content: flex-start; width: 100%;">
                            <i class="fa-solid fa-user-pen"></i> แก้ไขข้อมูลผู้เรียน
                        </button>
                        <button class="btn btn-secondary assign-courses-btn" data-username="${student.username}" style="padding: 6px 12px; font-size: 0.8rem; justify-content: flex-start; width: 100%;">
                            <i class="fa-solid fa-list-check"></i> มอบหมายวิชา
                        </button>
                        <button class="btn btn-secondary btn-danger delete-student-btn" data-username="${student.username}" style="padding: 6px 12px; font-size: 0.8rem; justify-content: flex-start; width: 100%;">
                            <i class="fa-solid fa-trash-can"></i> ลบผู้เรียน
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    let courseRows = courses.map(course => {
        let prereqName = 'ไม่มี (เรียนอันไหนก่อนก็ได้)';
        if (course.prerequisiteId) {
            const preC = courses.find(c => c.id === course.prerequisiteId);
            prereqName = preC ? `<span style="color:var(--error); font-weight:600;"><i class="fa-solid fa-circle-exclamation"></i> ${preC.title}</span>` : 'วิชาที่ถูกลบ';
        }

        return `
            <tr>
                <td>
                    <strong>${course.title}</strong>
                    <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">
                        ${course.description.substring(0, 100)}${course.description.length > 100 ? '...' : ''}
                    </div>
                </td>
                <td>
                    <span style="font-size:0.85rem;">
                        ก่อนเรียน: ${course.preQuestions.length} ข้อ<br>
                        หลังเรียน: ${course.postQuestions.length} ข้อ
                    </span>
                </td>
                <td>
                    <span style="color:var(--accent); font-weight:600;">${course.passingScore}%</span>
                </td>
                <td>
                    <div style="font-size:0.85rem;">${prereqName}</div>
                </td>
                <td>
                    <div style="display:flex; gap:8px;">
                        <button class="btn btn-secondary edit-course-btn" data-id="${course.id}" style="padding: 6px 12px; font-size: 0.8rem;">
                            <i class="fa-solid fa-pen-to-square"></i> แก้ไข
                        </button>
                        <button class="btn btn-secondary btn-danger delete-course-btn" data-id="${course.id}" style="padding: 6px 12px; font-size: 0.8rem;">
                            <i class="fa-solid fa-trash-can"></i> ลบ
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Generate progress reports html
    let reportsHTML = getReportsTabHTML(students, courses);

    // Prepare Admin Profile Picture HTML
    const dbAdmin = getUsers().find(u => u.username === state.currentUser.username) || state.currentUser;
    let adminPicHTML = '';
    if (dbAdmin.avatar && dbAdmin.avatar.trim() !== '') {
        adminPicHTML = `<img class="avatar-image-preview" id="admin-avatar-preview" src="${dbAdmin.avatar}" alt="avatar">`;
    } else {
        const initial = dbAdmin.name ? dbAdmin.name.charAt(0).toUpperCase() : 'A';
        adminPicHTML = `
            <div class="avatar-image-preview" id="admin-avatar-preview" style="background:var(--bg-primary); display:flex; align-items:center; justify-content:center; font-size:3rem; font-weight:700; color:var(--primary);">
                ${initial}
            </div>
        `;
    }

    container.innerHTML = `
        ${getHeaderHTML()}
        <main class="container admin-layout fade-in">
            <div class="page-title-section">
                <div>
                    <h1>ระบบจัดการข้อมูลหลังบ้าน (Admin Panel)</h1>
                    <p>จัดการผู้เรียน หลักสูตรการสอน มอบหมายวิชาเฉพาะบุคคล และติดตามรายงานความก้าวหน้าการเรียน</p>
                </div>
            </div>

            <!-- Tab Headers -->
            <div class="tabs-header">
                <button class="tab-btn ${state.adminActiveTab === 'students' ? 'active' : ''}" id="tab-students-btn">
                    <i class="fa-solid fa-users"></i> ทะเบียนผู้เรียน
                </button>
                <button class="tab-btn ${state.adminActiveTab === 'courses' ? 'active' : ''}" id="tab-courses-btn">
                    <i class="fa-solid fa-book"></i> คอร์สเรียนและข้อสอบ
                </button>
                <button class="tab-btn ${state.adminActiveTab === 'reports' ? 'active' : ''}" id="tab-reports-btn">
                    <i class="fa-solid fa-chart-line"></i> รายงานความก้าวหน้า
                </button>
            </div>

            <!-- TAB 1: Students Management -->
            <div class="admin-section ${state.adminActiveTab === 'students' ? 'active' : ''}" id="sec-students">
                <div class="section-header">
                    <h2>รายชื่อผู้เรียนและระดับความคืบหน้า</h2>
                    <button class="btn btn-primary" id="btn-add-student">
                        <i class="fa-solid fa-user-plus"></i> เพิ่มผู้เรียนใหม่
                    </button>
                </div>
                <div class="table-wrapper">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>ชื่อ-นามสกุล / ตำแหน่ง</th>
                                <th>Username</th>
                                <th>รหัสผ่าน</th>
                                <th>ข้อมูลติดต่อ</th>
                                <th>วิชาที่ต้องเรียนและผลคะแนน</th>
                                <th>การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${studentRows || '<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">ไม่มีบัญชีผู้เรียนในระบบขณะนี้</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- TAB 2: Courses Management -->
            <div class="admin-section ${state.adminActiveTab === 'courses' ? 'active' : ''}" id="sec-courses">
                <div class="section-header">
                    <h2>หลักสูตรอบรมที่มีในระบบ</h2>
                    <button class="btn btn-primary" id="btn-add-course">
                        <i class="fa-solid fa-folder-plus"></i> สร้างหลักสูตรใหม่
                    </button>
                </div>
                <div class="table-wrapper">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>ชื่อหลักสูตร / รายละเอียด</th>
                                <th>จำนวนข้อสอบ</th>
                                <th>เกณฑ์ผ่าน</th>
                                <th>วิชาบังคับก่อนหน้า (Prerequisite)</th>
                                <th>การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${courseRows || '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">ไม่มีหลักสูตรการสอนในระบบขณะนี้</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- TAB 3: Reports Dashboard -->
            <div class="admin-section ${state.adminActiveTab === 'reports' ? 'active' : ''}" id="sec-reports">
                ${reportsHTML}
            </div>

            <!-- Admin Profile Settings Card (Always visible at bottom for admin comfort) -->
            <div class="glass-panel profile-section-card" style="margin-top:20px;">
                <h2><i class="fa-solid fa-user-gear"></i> ข้อมูลโปรไฟล์ผู้ดูแลระบบ (My Admin Profile)</h2>
                <div class="profile-layout">
                    <div class="profile-avatar-col">
                        <div class="avatar-upload-frame" id="admin-avatar-frame-btn">
                            ${adminPicHTML}
                            <div class="avatar-upload-overlay">
                                <i class="fa-solid fa-camera"></i>
                                <span>เปลี่ยนรูปภาพ</span>
                            </div>
                        </div>
                        <input type="file" id="admin-profile-avatar-input" class="hidden-file-input" accept="image/*">
                    </div>
                    <form id="save-admin-profile-form" style="width: 100%;">
                        <div class="profile-form-grid">
                            <div class="form-group">
                                <label for="adm-prof-name">ชื่อจริง-นามสกุลผู้บริหารระบบ</label>
                                <input type="text" id="adm-prof-name" class="input-field" style="padding-left:14px;" value="${escapeHtml(dbAdmin.name)}" required>
                            </div>
                            <div class="form-group">
                                <label for="adm-prof-email">ที่อยู่อีเมลหลัก</label>
                                <input type="email" id="adm-prof-email" class="input-field" style="padding-left:14px;" value="${escapeHtml(dbAdmin.email || '')}" placeholder="เช่น admin@wasuwat.com">
                            </div>
                            <div class="form-group">
                                <label for="adm-prof-phone">เบอร์โทรศัพท์สายตรง</label>
                                <input type="tel" id="adm-prof-phone" class="input-field" style="padding-left:14px;" value="${escapeHtml(dbAdmin.phone || '')}" placeholder="เช่น 02-123-4567">
                            </div>
                            <div class="form-group">
                                <label for="adm-prof-dept">สำนัก / ฝ่ายงาน</label>
                                <input type="text" id="adm-prof-dept" class="input-field" style="padding-left:14px;" value="${escapeHtml(dbAdmin.department || '')}">
                            </div>
                        </div>
                        <div style="text-align: right; margin-top: 10px;">
                            <button type="submit" class="btn btn-primary">
                                บันทึกโปรไฟล์แอดมิน <i class="fa-solid fa-circle-check"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>

        <!-- ADD STUDENT MODAL -->
        <div class="modal-overlay" id="student-modal">
            <div class="modal-content large glass-panel">
                <button class="modal-close" id="student-modal-close"><i class="fa-solid fa-xmark"></i></button>
                <div class="modal-title"><i class="fa-solid fa-user-plus" style="color:var(--primary);margin-right:8px;"></i>เพิ่มโปรไฟล์ผู้เรียนใหม่</div>
                <form id="add-student-form">
                    <!-- Avatar Upload Row -->
                    <div class="add-stud-avatar-row">
                        <div class="add-stud-avatar-wrap" id="add-stud-avatar-frame">
                            <div class="add-stud-avatar-placeholder" id="add-stud-avatar-preview-wrap">
                                <i class="fa-solid fa-user" style="font-size:2.2rem; color:var(--primary);"></i>
                            </div>
                            <div class="avatar-upload-overlay">
                                <i class="fa-solid fa-camera"></i>
                                <span>เพิ่มรูป</span>
                            </div>
                        </div>
                        <input type="file" id="add-stud-avatar-input" class="hidden-file-input" accept="image/*">
                        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:6px; text-align:center;">คลิกเพื่ออัปโหลดรูปโปรไฟล์<br>(ไม่บังคับ)</div>
                    </div>

                    <!-- Account Fields -->
                    <div class="modal-section-label"><i class="fa-solid fa-lock"></i> ข้อมูลบัญชีผู้ใช้</div>
                    <div class="profile-form-grid">
                        <div class="form-group">
                            <label for="new-stud-name">ชื่อ-นามสกุลจริง <span style="color:var(--error)">*</span></label>
                            <div class="input-container">
                                <input type="text" id="new-stud-name" class="input-field" placeholder="ตัวอย่าง: สมเกียรติ มั่นคง" required>
                                <i class="fa-solid fa-font"></i>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="new-stud-user">Username สำหรับ Login <span style="color:var(--error)">*</span></label>
                            <div class="input-container">
                                <input type="text" id="new-stud-user" class="input-field" placeholder="ตัวอย่าง: somkiat" required>
                                <i class="fa-solid fa-user-tag"></i>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="new-stud-pwd">รหัสผ่านเริ่มต้น <span style="color:var(--error)">*</span></label>
                            <div class="input-container">
                                <input type="text" id="new-stud-pwd" class="input-field" placeholder="ตัวอย่าง: pass123" required>
                                <i class="fa-solid fa-key"></i>
                            </div>
                            <p style="font-size:0.75rem; color:var(--primary); margin-top:6px; cursor:pointer;" id="btn-generate-pwd">
                                <i class="fa-solid fa-dice"></i> สุ่มรหัสผ่านอัตโนมัติ
                            </p>
                        </div>
                    </div>

                    <!-- Profile Fields -->
                    <div class="modal-section-label" style="margin-top:8px;"><i class="fa-solid fa-address-card"></i> ข้อมูลโปรไฟล์ส่วนตัว</div>
                    <div class="profile-form-grid">
                        <div class="form-group">
                            <label for="new-stud-email">ที่อยู่อีเมล</label>
                            <input type="email" id="new-stud-email" class="input-field" style="padding-left:14px;" placeholder="เช่น somkiat@wasuwat.com">
                        </div>
                        <div class="form-group">
                            <label for="new-stud-phone">เบอร์โทรศัพท์</label>
                            <input type="tel" id="new-stud-phone" class="input-field" style="padding-left:14px;" placeholder="เช่น 089-xxx-xxxx">
                        </div>
                        <div class="form-group">
                            <label for="new-stud-dept">ฝ่าย / แผนกงาน</label>
                            <input type="text" id="new-stud-dept" class="input-field" style="padding-left:14px;" placeholder="เช่น ฝ่ายการตลาด">
                        </div>
                        <div class="form-group">
                            <label for="new-stud-pos">ตำแหน่งหน้าที่</label>
                            <input type="text" id="new-stud-pos" class="input-field" style="padding-left:14px;" placeholder="เช่น Sales Executive">
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label for="new-stud-bio">แนะนำตัวย่อ (Bio)</label>
                            <input type="text" id="new-stud-bio" class="input-field" style="padding-left:14px;" placeholder="คำแนะนำตัวสั้น ๆ...">
                        </div>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px; border-top:1px solid var(--border-color); padding-top:16px;">
                        <button type="button" class="btn btn-secondary" id="btn-cancel-student">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-user-plus"></i> สร้างโปรไฟล์ผู้เรียน</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- EDIT STUDENT INFO MODAL (ADMIN ONLY) -->
        <div class="modal-overlay" id="edit-student-modal">
            <div class="modal-content large glass-panel" style="max-width: 680px;">
                <button class="modal-close" id="edit-student-modal-close"><i class="fa-solid fa-xmark"></i></button>
                <div class="modal-title"><i class="fa-solid fa-user-pen" style="color:var(--primary);margin-right:8px;"></i>แก้ไขข้อมูลและโปรไฟล์ผู้เรียน</div>
                
                <!-- Avatar Upload Section -->
                <div class="add-stud-avatar-row" style="margin-bottom:20px;">
                    <div class="add-stud-avatar-wrap" id="edit-stud-avatar-frame">
                        <div class="add-stud-avatar-placeholder" id="edit-stud-avatar-preview-wrap">
                            <i class="fa-solid fa-user" style="font-size:2.2rem; color:var(--primary);"></i>
                        </div>
                        <div class="avatar-upload-overlay">
                            <i class="fa-solid fa-camera"></i>
                            <span>เปลี่ยนรูป</span>
                        </div>
                    </div>
                    <input type="file" id="edit-stud-avatar-input" class="hidden-file-input" accept="image/*">
                    <div style="font-size:0.8rem; color:var(--text-muted); margin-top:6px; text-align:center;">คลิกเพื่อเปลี่ยนรูปโปรไฟล์</div>
                </div>

                <form id="edit-student-form">
                    <!-- Account Fields -->
                    <div class="modal-section-label"><i class="fa-solid fa-lock"></i> ข้อมูลบัญชีผู้ใช้</div>
                    <div class="profile-form-grid">
                        <div class="form-group">
                            <label for="edit-stud-name">ชื่อ-นามสกุลจริง <span style="color:var(--error)">*</span></label>
                            <input type="text" id="edit-stud-name" class="input-field" style="padding-left:14px;" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-stud-user">Username (แก้ไขไม่ได้)</label>
                            <input type="text" id="edit-stud-user" class="input-field" style="padding-left:14px; opacity:0.5; cursor:not-allowed;" readonly>
                        </div>
                        <div class="form-group">
                            <label for="edit-stud-pwd">รหัสผ่าน <span style="color:var(--error)">*</span></label>
                            <input type="text" id="edit-stud-pwd" class="input-field" style="padding-left:14px;" required>
                        </div>
                    </div>

                    <!-- Profile Fields -->
                    <div class="modal-section-label" style="margin-top:8px;"><i class="fa-solid fa-address-card"></i> ข้อมูลโปรไฟล์ส่วนตัว</div>
                    <div class="profile-form-grid">
                        <div class="form-group">
                            <label for="edit-stud-email">อีเมล</label>
                            <input type="email" id="edit-stud-email" class="input-field" style="padding-left:14px;" placeholder="เช่น sales@wasuwat.com">
                        </div>
                        <div class="form-group">
                            <label for="edit-stud-phone">เบอร์โทรศัพท์</label>
                            <input type="tel" id="edit-stud-phone" class="input-field" style="padding-left:14px;" placeholder="เช่น 089-xxx-xxxx">
                        </div>
                        <div class="form-group">
                            <label for="edit-stud-dept">ฝ่าย / แผนกงาน</label>
                            <input type="text" id="edit-stud-dept" class="input-field" style="padding-left:14px;">
                        </div>
                        <div class="form-group">
                            <label for="edit-stud-pos">ตำแหน่งหน้าที่</label>
                            <input type="text" id="edit-stud-pos" class="input-field" style="padding-left:14px;">
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label for="edit-stud-bio">แนะนำตัวย่อ (Bio)</label>
                            <input type="text" id="edit-stud-bio" class="input-field" style="padding-left:14px;">
                        </div>
                    </div>

                    <!-- Danger Zone -->
                    <div class="modal-section-label danger-zone-label" style="margin-top:8px;"><i class="fa-solid fa-triangle-exclamation"></i> โซนอันตราย (Danger Zone)</div>
                    <div style="background: var(--error-glow); border: 1px solid rgba(244,63,94,0.2); border-radius: var(--border-radius-sm); padding: 14px 16px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
                        <div>
                            <p style="font-size:0.85rem; font-weight:600; color:var(--error);">รีเซ็ตข้อมูลความคืบหน้าการเรียน</p>
                            <p style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">ลบคะแนนสอบและสถานะการเรียนทั้งหมดของผู้เรียนคนนี้</p>
                        </div>
                        <button type="button" class="btn btn-secondary btn-danger" id="btn-reset-student-progress" style="padding:8px 14px; font-size:0.8rem; white-space:nowrap; flex-shrink:0;">
                            <i class="fa-solid fa-rotate-left"></i> รีเซ็ตความคืบหน้า
                        </button>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px; border-top: 1px solid var(--border-color); padding-top:16px;">
                        <button type="button" class="btn btn-secondary" id="btn-cancel-edit-student">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-circle-check"></i> บันทึกการเปลี่ยนแปลง</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- COURSE ASSIGNMENTS CHECKLIST MODAL -->
        <div class="modal-overlay" id="assignment-modal">
            <div class="modal-content glass-panel">
                <button class="modal-close" id="assignment-modal-close"><i class="fa-solid fa-xmark"></i></button>
                <div class="modal-title">มอบหมายบทเรียนรายบุคคล</div>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 20px;" id="assignment-modal-subtitle">
                    กรุณาเลือกวิชาที่ผู้เรียนต้องเรียน
                </p>
                <form id="assignment-form">
                    <div class="assignment-list" id="assignment-checkboxes-root">
                        <!-- Checkboxes will render dynamically -->
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px;">
                        <button type="button" class="btn btn-secondary" id="btn-cancel-assignment">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary">บันทึกการมอบหมาย</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- COURSE & QUIZ BUILDER MODAL (LARGE) -->
        <div class="modal-overlay" id="course-modal">
            <div class="modal-content large glass-panel">
                <button class="modal-close" id="course-modal-close"><i class="fa-solid fa-xmark"></i></button>
                <div class="modal-title" id="course-modal-title">สร้างหลักสูตรและชุดข้อสอบการสอน</div>
                <form id="course-builder-form">
                    <div class="builder-steps-container">
                        
                        <div class="builder-section-card">
                            <h4>ข้อมูลเนื้อหาหลักสูตรทั่วไป</h4>
                            <div class="form-group">
                                <label for="c-title">ชื่อวิชา / หลักสูตร</label>
                                <input type="text" id="c-title" class="input-field" style="padding-left:14px;" placeholder="เช่น พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA)" required>
                            </div>
                            <div class="form-group">
                                <label for="c-desc">คำอธิบายรายละเอียด</label>
                                <textarea id="c-desc" class="input-field" style="padding-left:14px; min-height:80px; font-family:inherit;" placeholder="เนื้อหารายละเอียดโดยย่อของคอร์สเรียนนี้..." required></textarea>
                            </div>
                            <div class="form-group">
                                <label for="c-video">ลิงก์ฝังวิดีโอ YouTube (Embed URL) หรือเว้นว่างไว้ใช้เครื่องมือวิดีโอจำลอง</label>
                                <input type="url" id="c-video" class="input-field" style="padding-left:14px;" placeholder="เช่น https://www.youtube.com/embed/z5NC91_W93E">
                            </div>
                            
                            <div class="form-group">
                                <label for="c-prereq">วิชาบังคับก่อนหน้า (Prerequisite Course)</label>
                                <select id="c-prereq" class="select-field">
                                    <option value="">-- ไม่มี (สามารถเปิดเรียนได้อิสระ) --</option>
                                    ${courses.map(c => `
                                        <option value="${c.id}">${c.title}</option>
                                    `).join('')}
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="c-passing">เกณฑ์คะแนนสอบหลังเรียนที่ผ่านหลักสูตร (%)</label>
                                <input type="number" id="c-passing" class="input-field" style="padding-left:14px;" value="80" min="10" max="100" required>
                            </div>
                        </div>

                        <div class="builder-section-card">
                            <h4>
                                ข้อสอบและคำถามประเมินผล (ปรนัย 4 ตัวเลือก)
                                <button type="button" class="btn btn-secondary" id="btn-add-builder-q" style="padding:6px 12px; font-size:0.8rem;">
                                    <i class="fa-solid fa-plus"></i> เพิ่มโจทย์คำถาม
                                </button>
                            </h4>
                            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:16px;">
                                * เพื่อความรวดเร็ว ระบบจะใช้คำถามชุดเดียวกันนี้ทั้งก่อนเรียน (Pre-test) และหลังเรียน (Post-test) 
                            </p>
                            
                            <div class="questions-builder-list" id="builder-questions-list-root">
                                <!-- Question items will render here dynamically -->
                            </div>
                        </div>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:32px; border-top:1px solid var(--border-color); padding-top:20px;">
                        <button type="button" class="btn btn-secondary" id="btn-cancel-course">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary" id="btn-save-course-submit">บันทึกวิชาเรียน</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    bindHeaderEvents();
    bindAdminDashboardEvents();
}

function bindAdminDashboardEvents() {
    document.getElementById('tab-students-btn').addEventListener('click', () => {
        state.adminActiveTab = 'students';
        renderAdminDashboard(document.getElementById('app'));
    });
    
    document.getElementById('tab-courses-btn').addEventListener('click', () => {
        state.adminActiveTab = 'courses';
        renderAdminDashboard(document.getElementById('app'));
    });

    document.getElementById('tab-reports-btn').addEventListener('click', () => {
        state.adminActiveTab = 'reports';
        renderAdminDashboard(document.getElementById('app'));
    });

    // --- STUDENT REGISTRATION LOGIC ---
    const studModal = document.getElementById('student-modal');
    
    document.getElementById('btn-add-student').addEventListener('click', () => {
        document.getElementById('add-student-form').reset();
        generateRandomPassword();
        studModal.classList.add('show');
    });

    document.getElementById('student-modal-close').addEventListener('click', () => studModal.classList.remove('show'));
    document.getElementById('btn-cancel-student').addEventListener('click', () => studModal.classList.remove('show'));
    document.getElementById('btn-generate-pwd').addEventListener('click', generateRandomPassword);

    // Avatar upload for Add Student modal
    const addAvatarFrame = document.getElementById('add-stud-avatar-frame');
    const addAvatarInput = document.getElementById('add-stud-avatar-input');
    let pendingNewStudentAvatar = '';

    if (addAvatarFrame && addAvatarInput) {
        addAvatarFrame.addEventListener('click', () => addAvatarInput.click());
        addAvatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) { showToast('ขนาดภาพต้องไม่เกิน 2MB', 'error'); return; }
            handleAvatarUpload(file, (base64Data) => {
                pendingNewStudentAvatar = base64Data;
                const wrap = document.getElementById('add-stud-avatar-preview-wrap');
                if (wrap) {
                    wrap.innerHTML = `<img src="${base64Data}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
                }
                showToast('โหลดรูปโปรไฟล์แล้ว', 'success');
            });
        });
    }

    function generateRandomPassword() {
        const rand = 'pwd_' + Math.floor(1000 + Math.random() * 9000);
        document.getElementById('new-stud-pwd').value = rand;
    }

    document.getElementById('add-student-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-stud-name').value.trim();
        const username = document.getElementById('new-stud-user').value.trim().toLowerCase();
        const password = document.getElementById('new-stud-pwd').value;
        const email = document.getElementById('new-stud-email').value.trim();
        const phone = document.getElementById('new-stud-phone').value.trim();
        const department = document.getElementById('new-stud-dept').value.trim();
        const position = document.getElementById('new-stud-pos').value.trim();
        const bio = document.getElementById('new-stud-bio').value.trim();

        const users = getUsers();
        const courses = getCourses();

        if (users.some(u => u.username.toLowerCase() === username)) {
            showToast('มีชื่อผู้ใช้งานนี้อยู่ในระบบแล้ว', 'error');
            return;
        }

        users.push({
            username,
            password,
            name,
            role: 'student',
            assignedCourses: courses.map(c => c.id),
            progress: {},
            avatar: pendingNewStudentAvatar || '',
            email,
            phone,
            department,
            position,
            bio
        });

        saveUsers(users);
        pendingNewStudentAvatar = '';
        showToast(`สร้างโปรไฟล์ผู้เรียน "${name}" เรียบร้อยแล้ว`, 'success');
        studModal.classList.remove('show');
        renderAdminDashboard(document.getElementById('app'));
    });

    const deleteStudBtns = document.querySelectorAll('.delete-student-btn');
    deleteStudBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const username = btn.getAttribute('data-username');
            if (confirm(`คุณต้องการลบบัญชีผู้เรียน "${username}" ใช่หรือไม่?`)) {
                let users = getUsers();
                users = users.filter(u => u.username !== username);
                saveUsers(users);
                showToast('ลบบัญชีเรียบร้อยแล้ว', 'success');
                renderAdminDashboard(document.getElementById('app'));
            }
        });
    });

    // --- EDIT STUDENT INFO LOGIC (ADMIN MODAL) ---
    const editStudModal = document.getElementById('edit-student-modal');
    const editStudBtns = document.querySelectorAll('.edit-student-btn');
    let pendingEditStudentAvatar = null; // null = no change, string = new base64

    editStudBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const username = btn.getAttribute('data-username');
            state.activeEditingStudentUser = username;
            pendingEditStudentAvatar = null;

            const users = getUsers();
            const student = users.find(u => u.username === username);
            if (!student) return;

            // Pre-populate modal fields
            document.getElementById('edit-stud-name').value = student.name;
            document.getElementById('edit-stud-user').value = student.username;
            document.getElementById('edit-stud-pwd').value = student.password;
            document.getElementById('edit-stud-email').value = student.email || '';
            document.getElementById('edit-stud-phone').value = student.phone || '';
            document.getElementById('edit-stud-dept').value = student.department || '';
            document.getElementById('edit-stud-pos').value = student.position || '';
            document.getElementById('edit-stud-bio').value = student.bio || '';

            // Populate avatar preview in edit modal
            const avatarWrap = document.getElementById('edit-stud-avatar-preview-wrap');
            if (avatarWrap) {
                if (student.avatar && student.avatar.trim() !== '') {
                    avatarWrap.innerHTML = `<img src="${student.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
                } else {
                    const initial = student.name ? student.name.charAt(0).toUpperCase() : 'U';
                    avatarWrap.innerHTML = `<span style="font-size:2rem; font-weight:700; color:var(--primary);">${initial}</span>`;
                }
            }

            editStudModal.classList.add('show');
        });
    });

    // Avatar upload binding for Edit Student modal
    const editAvatarFrame = document.getElementById('edit-stud-avatar-frame');
    const editAvatarInput = document.getElementById('edit-stud-avatar-input');

    if (editAvatarFrame && editAvatarInput) {
        editAvatarFrame.addEventListener('click', () => editAvatarInput.click());
        editAvatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) { showToast('ขนาดภาพต้องไม่เกิน 2MB', 'error'); return; }
            handleAvatarUpload(file, (base64Data) => {
                pendingEditStudentAvatar = base64Data;
                const wrap = document.getElementById('edit-stud-avatar-preview-wrap');
                if (wrap) {
                    wrap.innerHTML = `<img src="${base64Data}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
                }
                showToast('โหลดรูปโปรไฟล์ใหม่แล้ว', 'success');
            });
        });
    }

    document.getElementById('edit-student-modal-close').addEventListener('click', () => editStudModal.classList.remove('show'));
    document.getElementById('btn-cancel-edit-student').addEventListener('click', () => editStudModal.classList.remove('show'));

    // Reset progress button
    document.getElementById('btn-reset-student-progress').addEventListener('click', () => {
        const username = state.activeEditingStudentUser;
        if (!username) return;
        if (confirm(`รีเซ็ตข้อมูลความคืบหน้าการเรียนทั้งหมดของ "${username}" ใช่หรือไม่?\nคะแนนสอบและสถานะเรียนทั้งหมดจะถูกลบออก`)) {
            const users = getUsers();
            const index = users.findIndex(u => u.username === username);
            if (index !== -1) {
                users[index].progress = {};
                saveUsers(users);
                showToast(`รีเซ็ตความคืบหน้าของ "${username}" เรียบร้อยแล้ว`, 'success');
            }
        }
    });

    document.getElementById('edit-student-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const nameVal = document.getElementById('edit-stud-name').value.trim();
        const pwdVal = document.getElementById('edit-stud-pwd').value;
        const emailVal = document.getElementById('edit-stud-email').value.trim();
        const phoneVal = document.getElementById('edit-stud-phone').value.trim();
        const deptVal = document.getElementById('edit-stud-dept').value.trim();
        const posVal = document.getElementById('edit-stud-pos').value.trim();
        const bioVal = document.getElementById('edit-stud-bio').value.trim();

        if (!nameVal || !pwdVal) {
            showToast('กรุณากรอกข้อมูลชื่อจริงและรหัสผ่านให้ครบ', 'error');
            return;
        }

        const users = getUsers();
        const index = users.findIndex(u => u.username === state.activeEditingStudentUser);

        if (index !== -1) {
            users[index].name = nameVal;
            users[index].password = pwdVal;
            users[index].email = emailVal;
            users[index].phone = phoneVal;
            users[index].department = deptVal;
            users[index].position = posVal;
            users[index].bio = bioVal;
            if (pendingEditStudentAvatar !== null) {
                users[index].avatar = pendingEditStudentAvatar;
            }

            saveUsers(users);
            showToast('แก้ไขข้อมูลประวัติผู้เรียนเรียบร้อยแล้ว', 'success');
            editStudModal.classList.remove('show');
            renderAdminDashboard(document.getElementById('app'));
        }
    });

    // --- COURSE ASSIGNMENTS LOGIC (INDIVIDUAL ASSIGN) ---
    const assignModal = document.getElementById('assignment-modal');
    const assignBtns = document.querySelectorAll('.assign-courses-btn');
    
    assignBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const username = btn.getAttribute('data-username');
            state.activeAssignmentStudentUser = username;
            
            const users = getUsers();
            const student = users.find(u => u.username === username);
            if (!student) return;

            const courses = getCourses();
            if (!student.assignedCourses) student.assignedCourses = courses.map(c => c.id);

            document.getElementById('assignment-modal-subtitle').innerHTML = `มอบหมายวิชาเรียนให้คุณ <strong>${student.name} (${student.username})</strong>`;
            
            const checkboxContainer = document.getElementById('assignment-checkboxes-root');
            checkboxContainer.innerHTML = courses.map(course => {
                const isChecked = student.assignedCourses.includes(course.id);
                return `
                    <label class="assignment-item">
                        <input type="checkbox" class="assignment-checkbox" data-course-id="${course.id}" ${isChecked ? 'checked' : ''}>
                        <div class="assignment-details">
                            <h5>${course.title}</h5>
                            <p style="font-size:0.75rem; color:var(--text-muted);">${course.description.substring(0, 70)}...</p>
                        </div>
                    </label>
                `;
            }).join('');

            assignModal.classList.add('show');
        });
    });

    document.getElementById('assignment-modal-close').addEventListener('click', () => assignModal.classList.remove('show'));
    document.getElementById('btn-cancel-assignment').addEventListener('click', () => assignModal.classList.remove('show'));

    document.getElementById('assignment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const checkedBoxes = document.querySelectorAll('.assignment-checkbox:checked');
        const assignedIds = Array.from(checkedBoxes).map(box => box.getAttribute('data-course-id'));

        const users = getUsers();
        const idx = users.findIndex(u => u.username === state.activeAssignmentStudentUser);
        
        if (idx !== -1) {
            users[idx].assignedCourses = assignedIds;
            if (users[idx].progress) {
                Object.keys(users[idx].progress).forEach(cid => {
                    if (!assignedIds.includes(cid)) {
                        delete users[idx].progress[cid];
                    }
                });
            }

            saveUsers(users);
            showToast('บันทึกการมอบหมายวิชาเรียนเรียบร้อยแล้ว', 'success');
            assignModal.classList.remove('show');
            renderAdminDashboard(document.getElementById('app'));
        }
    });


    // --- COURSE BUILDER LOGIC ---
    const courseModal = document.getElementById('course-modal');
    
    document.getElementById('btn-add-course').addEventListener('click', () => {
        state.adminEditingCourseId = null;
        document.getElementById('course-builder-form').reset();
        document.getElementById('course-modal-title').textContent = 'สร้างหลักสูตรและชุดข้อสอบใหม่';
        
        populatePrereqDropdown("");

        state.adminCourseFormQuestions = [
            { question: 'คำถามที่ 1?', choices: ['ข้อ ก', 'ข้อ ข', 'ข้อ ค', 'ข้อ ง'], correct: 0 },
            { question: 'คำถามที่ 2?', choices: ['ข้อ ก', 'ข้อ ข', 'ข้อ ค', 'ข้อ ง'], correct: 0 }
        ];
        renderBuilderQuestions();
        courseModal.classList.add('show');
    });

    document.getElementById('btn-add-builder-q').addEventListener('click', () => {
        state.adminCourseFormQuestions.push({
            question: '',
            choices: ['', '', '', ''],
            correct: 0
        });
        renderBuilderQuestions();
        const modalContent = courseModal.querySelector('.modal-content');
        modalContent.scrollTop = modalContent.scrollHeight;
    });

    document.getElementById('course-modal-close').addEventListener('click', () => courseModal.classList.remove('show'));
    document.getElementById('btn-cancel-course').addEventListener('click', () => courseModal.classList.remove('show'));

    const editCourseBtns = document.querySelectorAll('.edit-course-btn');
    editCourseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const courses = getCourses();
            const course = courses.find(c => c.id === id);
            if (!course) return;

            state.adminEditingCourseId = id;
            document.getElementById('course-modal-title').textContent = `แก้ไขหลักสูตร: ${course.title}`;
            
            document.getElementById('c-title').value = course.title;
            document.getElementById('c-desc').value = course.description;
            document.getElementById('c-video').value = course.videoUrl || '';
            document.getElementById('c-passing').value = course.passingScore;

            populatePrereqDropdown(course.prerequisiteId, course.id);

            state.adminCourseFormQuestions = JSON.parse(JSON.stringify(course.preQuestions || []));
            if (state.adminCourseFormQuestions.length === 0) {
                state.adminCourseFormQuestions = [{ question: '', choices: ['', '', '', ''], correct: 0 }];
            }

            renderBuilderQuestions();
            courseModal.classList.add('show');
        });
    });

    const deleteCourseBtns = document.querySelectorAll('.delete-course-btn');
    deleteCourseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            if (confirm('คุณต้องการลบหลักสูตรนี้ใช่หรือไม่?')) {
                let courses = getCourses();
                courses = courses.filter(c => c.id !== id);
                saveCourses(courses);

                const users = getUsers();
                users.forEach(u => {
                    if (u.assignedCourses) {
                        u.assignedCourses = u.assignedCourses.filter(cid => cid !== id);
                    }
                    if (u.progress && u.progress[id]) {
                        delete u.progress[id];
                    }
                });
                saveUsers(users);

                showToast('ลบหลักสูตรสำเร็จแล้ว', 'success');
                renderAdminDashboard(document.getElementById('app'));
            }
        });
    });

    document.getElementById('course-builder-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('c-title').value.trim();
        const description = document.getElementById('c-desc').value.trim();
        const videoUrl = document.getElementById('c-video').value.trim();
        const passingScore = parseInt(document.getElementById('c-passing').value);
        const prerequisiteId = document.getElementById('c-prereq').value;

        const questionsList = [];
        const qElements = document.querySelectorAll('.question-builder-item');
        let valid = true;

        qElements.forEach((qEl, idx) => {
            const qTextInput = qEl.querySelector(`.q-text-input`).value.trim();
            const choiceInputs = qEl.querySelectorAll(`.c-input`);
            const correctSelect = parseInt(qEl.querySelector(`.c-select`).value);

            const choices = [];
            choiceInputs.forEach(inp => choices.push(inp.value.trim()));

            if (!qTextInput) {
                showToast(`กรุณากรอกหัวข้อคำถามข้อที่ ${idx + 1}`, 'error');
                valid = false;
                return;
            }

            if (choices.some(c => !c)) {
                showToast(`กรุณากรอกตัวเลือกให้ครบทั้ง 4 ข้อในคำถามที่ ${idx + 1}`, 'error');
                valid = false;
                return;
            }

            questionsList.push({
                question: qTextInput,
                choices,
                correct: correctSelect
            });
        });

        if (!valid) return;
        if (questionsList.length === 0) {
            showToast('กรุณาสร้างคำถามอย่างน้อย 1 ข้อ', 'error');
            return;
        }

        const courses = getCourses();

        if (state.adminEditingCourseId) {
            const index = courses.findIndex(c => c.id === state.adminEditingCourseId);
            if (index !== -1) {
                courses[index].title = title;
                courses[index].description = description;
                courses[index].videoUrl = videoUrl;
                courses[index].passingScore = passingScore;
                courses[index].prerequisiteId = prerequisiteId;
                courses[index].preQuestions = questionsList;
                courses[index].postQuestions = JSON.parse(JSON.stringify(questionsList));
            }
            showToast('อัปเดตหลักสูตรสำเร็จ', 'success');
        } else {
            const newId = 'course-' + Date.now();
            courses.push({
                id: newId,
                title,
                description,
                videoUrl,
                passingScore,
                prerequisiteId,
                preQuestions: questionsList,
                postQuestions: JSON.parse(JSON.stringify(questionsList))
            });

            const users = getUsers();
            users.forEach(u => {
                if (u.role === 'student') {
                    if (!u.assignedCourses) u.assignedCourses = [];
                    u.assignedCourses.push(newId);
                }
            });
            saveUsers(users);

            showToast('สร้างหลักสูตรใหม่สำเร็จ', 'success');
        }

        saveCourses(courses);
        courseModal.classList.remove('show');
        renderAdminDashboard(document.getElementById('app'));
    });

    // --- ADMIN OWN PROFILE PICTURE UPLOAD ---
    const adminAvatarBtn = document.getElementById('admin-avatar-frame-btn');
    const adminFileInput = document.getElementById('admin-profile-avatar-input');
    
    if (adminAvatarBtn && adminFileInput) {
        adminAvatarBtn.addEventListener('click', () => {
            adminFileInput.click();
        });

        adminFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    showToast('ขนาดภาพต้องไม่เกิน 2MB', 'error');
                    return;
                }

                handleAvatarUpload(file, (base64Data) => {
                    const allUsers = getUsers();
                    const index = allUsers.findIndex(u => u.username === state.currentUser.username);
                    if (index !== -1) {
                        allUsers[index].avatar = base64Data;
                        saveUsers(allUsers);
                        state.currentUser.avatar = base64Data;
                        
                        // Update Admin UI preview image
                        const previewEl = document.getElementById('admin-avatar-preview');
                        if (previewEl) {
                            if (previewEl.tagName === 'IMG') {
                                previewEl.src = base64Data;
                            } else {
                                const newImg = document.createElement('img');
                                newImg.className = 'avatar-image-preview';
                                newImg.id = 'admin-avatar-preview';
                                newImg.src = base64Data;
                                previewEl.replaceWith(newImg);
                            }
                        }

                        // Update Navbar image
                        const navBadge = document.querySelector('.user-badge');
                        if (navBadge) {
                            const navbarAvatar = navBadge.querySelector('.navbar-avatar') || navBadge.querySelector('.navbar-avatar-placeholder');
                            if (navbarAvatar) {
                                const newNavImg = document.createElement('img');
                                newNavImg.className = 'navbar-avatar';
                                newNavImg.src = base64Data;
                                navbarAvatar.replaceWith(newNavImg);
                            }
                        }
                        
                        showToast('อัปโหลดรูปภาพโปรไฟล์แอดมินแล้ว', 'success');
                    }
                });
            }
        });
    }

    // Save Admin Profile Form
    const saveAdminProfileForm = document.getElementById('save-admin-profile-form');
    saveAdminProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameVal = document.getElementById('adm-prof-name').value.trim();
        const emailVal = document.getElementById('adm-prof-email').value.trim();
        const phoneVal = document.getElementById('adm-prof-phone').value.trim();
        const deptVal = document.getElementById('adm-prof-dept').value.trim();

        if (!nameVal) {
            showToast('กรุณากรอกชื่อจริงผู้บริหารระบบ', 'error');
            return;
        }

        const allUsers = getUsers();
        const index = allUsers.findIndex(u => u.username === state.currentUser.username);

        if (index !== -1) {
            allUsers[index].name = nameVal;
            allUsers[index].email = emailVal;
            allUsers[index].phone = phoneVal;
            allUsers[index].department = deptVal;

            saveUsers(allUsers);
            state.currentUser = allUsers[index];

            const nameSpan = document.querySelector('.user-name-span');
            if (nameSpan) nameSpan.textContent = nameVal;

            showToast('บันทึกข้อมูลส่วนตัวแอดมินเรียบร้อยแล้ว', 'success');
        }
    });

    // --- PROGRESS REPORT ACTIONS ---
    const printBtn = document.getElementById('btn-print-reports');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
}

function populatePrereqDropdown(selectedId, excludeCourseId = "") {
    const courses = getCourses();
    const selectEl = document.getElementById('c-prereq');
    if (!selectEl) return;

    let options = `<option value="">-- ไม่มี (สามารถเปิดเรียนได้อิสระ) --</option>`;
    courses.forEach(c => {
        if (c.id !== excludeCourseId) {
            const selectedStr = c.id === selectedId ? 'selected' : '';
            options += `<option value="${c.id}" ${selectedStr}>${c.title}</option>`;
        }
    });

    selectEl.innerHTML = options;
}

// 9. PROGRESS REPORT TAB MARKUP GENERATOR
function getReportsTabHTML(students, courses) {
    if (courses.length === 0) {
        return `
            <div class="glass-panel" style="padding: 40px; text-align: center; color: var(--text-muted);">
                <i class="fa-solid fa-chart-bar" style="font-size: 3rem; margin-bottom: 16px;"></i>
                <p>ไม่พบวิชาเรียนในระบบสำหรับการรายงานผล</p>
            </div>
        `;
    }

    let totalAssignmentsCount = 0;
    let completedAssignmentsCount = 0;
    let totalScoreSum = 0;
    let scoreCount = 0;

    students.forEach(student => {
        const assigned = student.assignedCourses || [];
        assigned.forEach(cid => {
            totalAssignmentsCount++;
            const prog = student.progress[cid];
            if (prog) {
                if (prog.status === 'completed') completedAssignmentsCount++;
                if (prog.postScore !== null) {
                    const c = courses.find(course => course.id === cid);
                    if (c) {
                        const scorePercent = (prog.postScore / c.postQuestions.length) * 100;
                        totalScoreSum += scorePercent;
                        scoreCount++;
                    }
                }
            }
        });
    });

    const completionRate = totalAssignmentsCount > 0 ? Math.round((completedAssignmentsCount / totalAssignmentsCount) * 100) : 0;
    const avgScore = scoreCount > 0 ? Math.round(totalScoreSum / scoreCount) : 0;

    let coursesReportHTML = courses.map(course => {
        let courseAssignedStudents = [];
        let completed = [];
        let inProgress = [];
        let notStarted = [];

        students.forEach(student => {
            const assigned = student.assignedCourses || [];
            if (assigned.includes(course.id)) {
                courseAssignedStudents.push(student);
                const prog = student.progress[course.id];
                if (prog) {
                    if (prog.status === 'completed') completed.push({ s: student, p: prog });
                    else inProgress.push({ s: student, p: prog });
                } else {
                    notStarted.push(student);
                }
            }
        });

        const totalAssigned = courseAssignedStudents.length;
        const compPercent = totalAssigned > 0 ? Math.round((completed.length / totalAssigned) * 100) : 0;

        return `
            <div class="glass-panel report-course-card fade-in">
                <div class="report-course-header">
                    <h3>${course.title}</h3>
                    <span class="completion-percentage-badge">อัตราเรียนจบ: ${compPercent}%</span>
                </div>
                
                <div class="report-progress-bar-container">
                    <div class="report-progress-bar-fill" style="width: ${compPercent}%"></div>
                </div>

                <div class="report-groups-grid">
                    <div class="report-group-col completed">
                        <h5><i class="fa-solid fa-circle-check"></i> เรียนผ่านแล้ว (${completed.length})</h5>
                        <div class="report-student-list">
                            ${completed.map(item => `
                                <div class="report-student-badge">
                                    <span>${item.s.name}</span>
                                    <span class="score">หลังเรียน: ${item.p.postScore}/${course.postQuestions.length}</span>
                                </div>
                            `).join('') || '<p style="color:var(--text-dark); font-size:0.8rem; text-align:center;">ยังไม่มีผู้เรียนผ่าน</p>'}
                        </div>
                    </div>

                    <div class="report-group-col inprogress">
                        <h5><i class="fa-solid fa-spinner"></i> กำลังเรียน (${inProgress.length})</h5>
                        <div class="report-student-list">
                            ${inProgress.map(item => {
                                const stepLabels = { 'pre-test': 'สอบก่อนเรียน', 'video': 'รับชมวิดีโอ', 'post-test': 'สอบหลังเรียน' };
                                return `
                                    <div class="report-student-badge">
                                        <span>${item.s.name}</span>
                                        <span class="score" style="color:var(--warning); font-size:0.75rem;">
                                            ขั้น: ${stepLabels[item.p.status] || 'ดูวิดีโอ'}
                                        </span>
                                    </div>
                                `;
                            }).join('') || '<p style="color:var(--text-dark); font-size:0.8rem; text-align:center;">ไม่มีคนกำลังเรียน</p>'}
                        </div>
                    </div>

                    <div class="report-group-col notstarted">
                        <h5><i class="fa-solid fa-clock"></i> ยังไม่เริ่ม (${notStarted.length})</h5>
                        <div class="report-student-list">
                            ${notStarted.map(student => `
                                <div class="report-student-badge">
                                    <span>${student.name}</span>
                                    <span class="score" style="font-size:0.75rem; color:var(--text-dark);">ยังไม่เรียน</span>
                                </div>
                            `).join('') || '<p style="color:var(--text-dark); font-size:0.8rem; text-align:center;">ไม่มีคนค้างเรียน</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="report-layout fade-in">
            <div class="section-header">
                <h2>รายงานความคืบหน้าการศึกษาและฝึกอบรม</h2>
                <button class="btn btn-primary" id="btn-print-reports">
                    <i class="fa-solid fa-print"></i> พิมพ์รายงานสรุป (Print/PDF)
                </button>
            </div>

            <!-- Global summary cards -->
            <div class="dashboard-stats" style="margin-bottom: 24px;">
                <div class="glass-panel stat-card" style="border-left: 4px solid var(--primary);">
                    <div class="stat-icon"><i class="fa-solid fa-chart-pie"></i></div>
                    <div class="stat-info">
                        <h3>${completionRate}%</h3>
                        <p>ความสำเร็จเฉลี่ยของระบบ</p>
                    </div>
                </div>
                <div class="glass-panel stat-card" style="border-left: 4px solid var(--success);">
                    <div class="stat-icon completed"><i class="fa-solid fa-clipboard-check"></i></div>
                    <div class="stat-info">
                        <h3>${completedAssignmentsCount} <span>/ ${totalAssignmentsCount}</span></h3>
                        <p>จำนวนที่สอบผ่านเกณฑ์แล้ว</p>
                    </div>
                </div>
                <div class="glass-panel stat-card" style="border-left: 4px solid var(--accent);">
                    <div class="stat-icon" style="background:var(--accent-glow); color:var(--accent);"><i class="fa-solid fa-award"></i></div>
                    <div class="stat-info">
                        <h3>${avgScore}%</h3>
                        <p>คะแนนสอบเฉลี่ยของระบบ</p>
                    </div>
                </div>
            </div>

            <!-- List by Courses -->
            <div>
                <h4 style="font-size:1.1rem; font-weight:600; margin-bottom: 16px; color:var(--text-muted);">
                    <i class="fa-solid fa-book-bookmark"></i> สถิติความก้าวหน้าแบ่งตามรายวิชา
                </h4>
                ${coursesReportHTML}
            </div>
        </div>
    `;
}

// Render dynamic list of questions inside the builder modal
function renderBuilderQuestions() {
    const container = document.getElementById('builder-questions-list-root');
    if (!container) return;

    container.innerHTML = state.adminCourseFormQuestions.map((q, idx) => {
        return `
            <div class="question-builder-item fade-in" data-idx="${idx}">
                <button type="button" class="btn-remove-question delete-q-builder-btn" data-idx="${idx}" title="ลบคำถามข้อนี้">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
                <div class="form-group" style="margin-bottom: 12px; padding-right: 30px;">
                    <label>คำถามข้อที่ ${idx + 1}</label>
                    <input type="text" class="input-field q-text-input" style="padding-left:14px;" placeholder="ระบุโจทย์คำถาม..." value="${escapeHtml(q.question)}" required>
                </div>
                
                <div class="choices-grid">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label>ตัวเลือกที่ 1 (ก)</label>
                        <input type="text" class="input-field c-input" style="padding-left:14px;" placeholder="ตัวเลือก ก..." value="${escapeHtml(q.choices[0] || '')}" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label>ตัวเลือกที่ 2 (ข)</label>
                        <input type="text" class="input-field c-input" style="padding-left:14px;" placeholder="ตัวเลือก ข..." value="${escapeHtml(q.choices[1] || '')}" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label>ตัวเลือกที่ 3 (ค)</label>
                        <input type="text" class="input-field c-input" style="padding-left:14px;" placeholder="ตัวเลือก ค..." value="${escapeHtml(q.choices[2] || '')}" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label>ตัวเลือกที่ 4 (ง)</label>
                        <input type="text" class="input-field c-input" style="padding-left:14px;" placeholder="ตัวเลือก ง..." value="${escapeHtml(q.choices[3] || '')}" required>
                    </div>
                </div>

                <div class="form-group correct-ans-select">
                    <label>ข้อเฉลยที่ถูกต้อง</label>
                    <select class="select-field c-select">
                        <option value="0" ${q.correct === 0 ? 'selected' : ''}>ตัวเลือกที่ 1 (ก)</option>
                        <option value="1" ${q.correct === 1 ? 'selected' : ''}>ตัวเลือกที่ 2 (ข)</option>
                        <option value="2" ${q.correct === 2 ? 'selected' : ''}>ตัวเลือกที่ 3 (ค)</option>
                        <option value="3" ${q.correct === 3 ? 'selected' : ''}>ตัวเลือกที่ 4 (ง)</option>
                    </select>
                </div>
            </div>
        `;
    }).join('');

    const delBtns = container.querySelectorAll('.delete-q-builder-btn');
    delBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            syncBuilderInputsState();
            state.adminCourseFormQuestions.splice(idx, 1);
            renderBuilderQuestions();
        });
    });
}

function syncBuilderInputsState() {
    const qElements = document.querySelectorAll('.question-builder-item');
    qElements.forEach((qEl, idx) => {
        const qTextInput = qEl.querySelector(`.q-text-input`).value;
        const choiceInputs = qEl.querySelectorAll(`.c-input`);
        const correctSelect = parseInt(qEl.querySelector(`.c-select`).value);

        const choices = [];
        choiceInputs.forEach(inp => choices.push(inp.value));

        if (state.adminCourseFormQuestions[idx]) {
            state.adminCourseFormQuestions[idx].question = qTextInput;
            state.adminCourseFormQuestions[idx].choices = choices;
            state.adminCourseFormQuestions[idx].correct = correctSelect;
        }
    });
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 10. APP ENTRYPOINT INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initDatabase();
        navigateTo('login');
    }, 800);
});
