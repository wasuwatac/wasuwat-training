// Wasuwat Training Webapp - Core Logic & Router (เวอร์ชันสมบูรณ์ 100%)

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
    studentActiveTab: 'dashboard', // 'dashboard', 'courses'
    adminActiveTab: 'students' // 'students', 'reports'
};

// 2. Mock Database Initialization
const DEFAULT_COURSES = [
    {
        id: 'course-cybersecurity',
        title: 'ความปลอดภัยไซเบอร์เบื้องต้น (Cybersecurity Basics)',
        description: 'เรียนรู้เรื่องความปลอดภัยในการใช้งานคอมพิวเตอร์และอินเทอร์เน็ตเบื้องต้น การสังเกตอีเมลฟิชชิ่ง (Phishing) วิธีการตั้งรหัสผ่านที่ปลอดภัย',
        videoUrl: 'https://www.youtube.com/watch?v=z5nc96A19Fs',
        passingScore: 80,
        preQuestions: [
            { question: 'ข้อใดคือรหัสผ่านที่ปลอดภัยที่สุด?', choices: ['12345678', 'password', 'P@ss1234!', 'admin'], correct: 2 },
            { question: 'Phishing คืออะไร?', choices: ['การตกปลาอินเทอร์เน็ต', 'การหลอกลวงออนไลน์เพื่อขโมยข้อมูล', 'ไวรัสคอมพิวเตอร์', 'การแฮกเว็บ'], correct: 1 }
        ],
        postQuestions: [
            { question: 'หากได้รับอีเมลแจ้งว่าคุณชนะรางวัลและให้คลิกลิงก์ ควรทำอย่างไร?', choices: ['คลิกทันที', 'ลบอีเมลทิ้งหรือตรวจสอบผู้ส่งให้แน่ชัดก่อน', 'ส่งต่อให้เพื่อน', 'กรอกข้อมูลส่วนตัว'], correct: 1 },
            { question: 'การยืนยันตัวตนแบบ 2 ปัจจัย (2FA) ช่วยอะไร?', choices: ['ทำให้เน็ตเร็วขึ้น', 'เพิ่มความปลอดภัยอีกหนึ่งชั้น', 'ประหยัดแบตเตอรี่', 'ใช้งานง่ายขึ้น'], correct: 1 }
        ]
    }
];

const DEFAULT_USERS = [
    { username: 'admin', password: 'admin123', name: 'ผู้ดูแลระบบสูงสุด', role: 'admin', avatar: '', position: 'IT Manager', department: 'IT', phone: '02-123-4567', email: 'admin@wasuwat.com' },
    { username: 'student', password: 'student123', name: 'คุณสมชาย เรียนดี', role: 'student', avatar: '', position: 'เจ้าหน้าที่ประสานงาน', department: 'ฝ่ายปฏิบัติการ', phone: '081-234-5678', email: 'somchai@wasuwat.com', progress: { 'course-cybersecurity': { status: 'pre-test', preScore: null, postScore: null, videoWatched: false } } }
];

function initDatabase() {
    if (!localStorage.getItem('wt_users')) {
        localStorage.setItem('wt_users', JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem('wt_courses')) {
        localStorage.setItem('wt_courses', JSON.stringify(DEFAULT_COURSES));
    }
}

function getUsers() { return JSON.parse(localStorage.getItem('wt_users')); }
function saveUsers(users) { localStorage.setItem('wt_users', JSON.stringify(users)); }
function getCourses() { return JSON.parse(localStorage.getItem('wt_courses')); }

// 3. Router / View Controller
function navigateTo(view, options = {}) {
    state.currentView = view;
    if (options.courseId) state.activeCourseId = options.courseId;
    if (options.step) state.activeCourseStep = options.step;
    
    if (view !== 'course-viewer') {
        clearInterval(state.videoInterval);
        state.videoMockPlaying = false;
        state.videoMockTime = 0;
        state.videoMockProgress = 0;
        state.quizAnswers = {};
        state.quizResults = null;
    }
    renderView();
}

function renderView() {
    const appContainer = document.getElementById('app');
    if (!appContainer) return;
    
    switch(state.currentView) {
        case 'login': renderLogin(appContainer); break;
        case 'student-dashboard': renderStudentDashboard(appContainer); break;
        case 'course-viewer': renderCourseViewer(appContainer); break;
        case 'admin-dashboard': renderAdminDashboard(appContainer); break;
        default: renderLogin(appContainer);
    }
}

// 4. Toast Notification
function showToast(message, type = 'success') {
    const oldToast = document.querySelector('.toast-notification');
    if (oldToast) oldToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'}"></i> <span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 5. Shared Header Component
function getHeaderHTML() {
    return `
        <header class="main-header">
            <div class="header-container">
                <div class="brand" onclick="state.currentUser.role === 'admin' ? navigateTo('admin-dashboard') : navigateTo('student-dashboard')">
                    <div class="brand-logo"><i class="fa-solid fa-graduation-cap"></i></div>
                    <div class="brand-text">
                        <span class="title">WASUWAT</span>
                        <span class="subtitle">TRAINING SYSTEM</span>
                    </div>
                </div>
                <div class="user-menu-wrapper">
                    <div class="user-profile-trigger">
                        <div class="user-avatar-placeholder">${state.currentUser.name.charAt(0)}</div>
                        <div class="user-meta-info">
                            <span class="user-name">${escapeHtml(state.currentUser.name)}</span>
                            <span class="user-role-badge ${state.currentUser.role}">${state.currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้เรียน'}</span>
                        </div>
                    </div>
                    <button class="logout-btn" id="logout-action-btn" title="ออกจากระบบ"><i class="fa-solid fa-right-from-bracket"></i></button>
                </div>
            </div>
        </header>
    `;
}

function bindHeaderEvents() {
    const logoutBtn = document.getElementById('logout-action-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            state.currentUser = null;
            showToast('ออกจากระบบสำเร็จแล้ว', 'success');
            navigateTo('login');
        });
    }
}

// 6. LOGIN VIEW RENDERER
function renderLogin(container) {
    container.innerHTML = `
        <div class="login-wrapper fade-in">
            <div class="login-card-panel">
                <div class="login-brand-section">
                    <div class="login-logo-icon"><i class="fa-solid fa-graduation-cap"></i></div>
                    <h2>WASUWAT TRAINING</h2>
                    <p>ระบบพัฒนาบุคลากรและฝึกอบรมออนไลน์พรีเมียม</p>
                </div>
                <form id="login-form-element">
                    <div class="form-group-block">
                        <label><i class="fa-solid fa-user"></i> ชื่อบัญชีผู้ใช้งาน (Username)</label>
                        <input type="text" id="login-username-input" class="form-field-control" placeholder="ระบุไอดีผู้ใช้ของคุณ" required autocomplete="username">
                    </div>
                    <div class="form-group-block">
                        <label><i class="fa-solid fa-lock"></i> รหัสผ่านความปลอดภัย (Password)</label>
                        <input type="password" id="login-password-input" class="form-field-control" placeholder="ระบุรหัสผ่านเข้าใช้งาน" required autocomplete="current-password">
                    </div>
                    <button type="submit" class="btn btn-primary login-submit-action-btn">เข้าสู่ระบบการใช้งาน <i class="fa-solid fa-arrow-right-to-bracket"></i></button>
                </form>
                <div class="login-system-footer">
                    <p>สิทธิ์ทดสอบระบบผู้เรียน: <code>student</code> / <code>student123</code></p>
                    <p>สิทธิ์ทดสอบระบบแอดมิน: <code>admin</code> / <code>admin123</code></p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('login-form-element').addEventListener('submit', (e) => {
        e.preventDefault();
        const uInput = document.getElementById('login-username-input').value.trim();
        const pInput = document.getElementById('login-password-input').value;
        const users = getUsers();
        const found = users.find(u => u.username === uInput && u.password === pInput);

        if (found) {
            state.currentUser = found;
            showToast(`ยินดีต้อนรับคุณ ${found.name}`, 'success');
            if (found.role === 'admin') navigateTo('admin-dashboard');
            else navigateTo('student-dashboard');
        } else {
            showToast('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!', 'error');
        }
    });
}

// 7. STUDENT DASHBOARD VIEW RENDERER
function renderStudentDashboard(container) {
    const courses = getCourses();
    const users = getUsers();
    const currentDbUser = users.find(u => u.username === state.currentUser.username);
    if (!currentDbUser.progress) currentDbUser.progress = {};

    container.innerHTML = `
        ${getHeaderHTML()}
        <main class="container student-layout-grid fade-in">
            <aside class="sidebar-navigation">
                <button class="nav-item-link ${state.studentActiveTab === 'dashboard' ? 'active' : ''}" id="nav-dash-btn"><i class="fa-solid fa-chart-pie"></i> ภาพรวมของฉัน</button>
                <button class="nav-item-link ${state.studentActiveTab === 'courses' ? 'active' : ''}" id="nav-courses-btn"><i class="fa-solid fa-book-open"></i> หลักสูตรอบรมทั้งหมด</button>
            </aside>
            <section class="main-dashboard-content">
                ${state.studentActiveTab === 'dashboard' ? `
                    <div class="page-title-section">
                        <h1>แผงควบคุมการเรียนรู้ (Overview)</h1>
                        <p>ยินดีต้อนรับกลับมาเรียนรู้อีกครั้งในวันนี้</p>
                    </div>
                    <div class="glass-panel stud-profile-mini">
                        <div class="stud-profile-mini-avatar">${currentDbUser.name.charAt(0)}</div>
                        <div class="stud-profile-mini-info">
                            <h3>${escapeHtml(currentDbUser.name)}</h3>
                            <p>แผนก: ${escapeHtml(currentDbUser.department || 'ทั่วไป')} | ตำแหน่ง: ${escapeHtml(currentDbUser.position || 'ทั่วไป')}</p>
                        </div>
                    </div>
                ` : `
                    <div class="page-title-section">
                        <h1>วิชาอบรมประจำปีพนักงาน</h1>
                        <p>เลือกบทเรียนด้านล่างเพื่อเริ่มกระบวนการทำแบบทดสอบและศึกษา</p>
                    </div>
                    <div class="courses-catalog-grid">
                        ${courses.map(course => {
                            if (!currentDbUser.progress[course.id]) {
                                currentDbUser.progress[course.id] = { status: 'pre-test', preScore: null, postScore: null, videoWatched: false };
                            }
                            const prog = currentDbUser.progress[course.id];
                            let statusText = 'ยังไม่ได้เริ่ม';
                            let statusClass = 'not-started';
                            if (prog.status === 'video') { statusText = 'กำลังเรียน (ดูวิดีโอ)'; statusClass = 'learning'; }
                            else if (prog.status === 'post-test') { statusText = 'รอทำข้อสอบหลังเรียน'; statusClass = 'testing'; }
                            else if (prog.status === 'completed') { statusText = 'อบรมสำเร็จแล้ว'; statusClass = 'completed'; }

                            return `
                                <div class="glass-panel course-item-card">
                                    <div class="card-badge-status ${statusClass}">${statusText}</div>
                                    <h3 class="course-card-title">${escapeHtml(course.title)}</h3>
                                    <p class="course-card-desc">${escapeHtml(course.description)}</p>
                                    <div class="course-card-footer">
                                        <button class="btn btn-primary" onclick="navigateTo('course-viewer', { courseId: '${course.id}', step: ${prog.status === 'completed' ? 3 : (prog.status === 'video' ? 2 : (prog.status === 'post-test' ? 3 : 1))} })">
                                            ${prog.status === 'completed' ? 'ดูผลการเรียนอบรม' : 'เข้าสู่บทเรียน <i class="fa-solid fa-chevron-right"></i>'}
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </section>
        </main>
    `;
    saveUsers(users);
    bindHeaderEvents();

    document.getElementById('nav-dash-btn').addEventListener('click', () => { state.studentActiveTab = 'dashboard'; renderStudentDashboard(container); });
    document.getElementById('nav-courses-btn').addEventListener('click', () => { state.studentActiveTab = 'courses'; renderStudentDashboard(container); });
}

// 8. COURSE LEARNING VIEWER (Pre-test -> Video -> Post-test)
function renderCourseViewer(container) {
    const course = getCourses().find(c => c.id === state.activeCourseId);
    const users = getUsers();
    const dbUser = users.find(u => u.username === state.currentUser.username);
    const prog = dbUser.progress[course.id];

    container.innerHTML = `
        ${getHeaderHTML()}
        <main class="container viewer-layout-grid fade-in">
            <aside class="viewer-sidebar-panel">
                <button class="btn btn-secondary" id="back-dashboard-btn" style="margin-bottom:20px; width:100%;"><i class="fa-solid fa-arrow-left"></i> กลับแผงควบคุม</button>
                <div class="viewer-steps-timeline-list">
                    <div class="step-item-node ${state.activeCourseStep === 1 ? 'active' : ''} ${prog.preScore !== null ? 'done' : ''}" id="step-1-btn">
                        <div class="node-indicator">1</div>
                        <div class="node-text"><strong>ขั้นตอนที่ 1</strong><br>แบบทดสอบก่อนเรียน</div>
                    </div>
                    <div class="step-item-node ${state.activeCourseStep === 2 ? 'active' : ''} ${prog.videoWatched ? 'done' : ''} ${prog.preScore === null ? 'locked' : ''}" id="step-2-btn">
                        <div class="node-indicator">2</div>
                        <div class="node-text"><strong>ขั้นตอนที่ 2</strong><br>รับชมสื่อการสอนวิดีโอ</div>
                    </div>
                    <div class="step-item-node ${state.activeCourseStep === 3 ? 'active' : ''} ${prog.status === 'completed' ? 'done' : ''} ${!prog.videoWatched ? 'locked' : ''}" id="step-3-btn">
                        <div class="node-indicator">3</div>
                        <div class="node-text"><strong>ขั้นตอนที่ 3</strong><br>แบบทดสอบวัดผลหลังเรียน</div>
                    </div>
                </div>
            </aside>
            <section class="viewer-content-arena glass-panel">
                ${state.activeCourseStep === 1 ? getPreTestHTML(course, prog) : (state.activeCourseStep === 2 ? getVideoHTML(course, prog) : getPostTestHTML(course, prog))}
            </section>
        </main>
    `;
    bindHeaderEvents();
    bindCourseViewerEvents(course, prog);
}

function bindCourseViewerEvents(course, prog) {
    document.getElementById('step-1-btn').addEventListener('click', () => { state.activeCourseStep = 1; renderCourseViewer(document.getElementById('app')); });
    if (prog.preScore !== null) {
        document.getElementById('step-2-btn').addEventListener('click', () => { state.activeCourseStep = 2; renderCourseViewer(document.getElementById('app')); });
    }
    if (prog.videoWatched) {
        document.getElementById('step-3-btn').addEventListener('click', () => { state.activeCourseStep = 3; renderCourseViewer(document.getElementById('app')); });
    }
    document.getElementById('back-dashboard-btn').addEventListener('click', () => { navigateTo('student-dashboard'); });

    const quizForm = document.getElementById('quiz-form');
    if (quizForm) {
        document.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', () => {
                const qIndex = card.getAttribute('data-q');
                const cIndex = parseInt(card.getAttribute('data-c'));
                document.querySelectorAll(`.option-card[data-q="${qIndex}"]`).forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                state.quizAnswers[qIndex] = cIndex;
            });
        });

        quizForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const questions = state.activeCourseStep === 1 ? course.preQuestions : course.postQuestions;
            if (Object.keys(state.quizAnswers).length < questions.length) { showToast('กรุณาตอบคำถามให้ครบทุกข้อ', 'error'); return; }

            let score = 0;
            questions.forEach((q, idx) => { if (state.quizAnswers[idx] === q.correct) score++; });
            const total = questions.length;
            const percentage = Math.round((score / total) * 100);
            const passed = percentage >= course.passingScore;
            state.quizResults = { score, total, percentage, passed };

            const users = getUsers();
            const dbUser = users.find(u => u.username === state.currentUser.username);
            if (state.activeCourseStep === 1) {
                dbUser.progress[course.id].preScore = score;
                if (dbUser.progress[course.id].status === 'pre-test') dbUser.progress[course.id].status = 'video';
                showToast('ส่งแบบทดสอบก่อนเรียนเรียบร้อยแล้ว', 'success');
            } else {
                dbUser.progress[course.id].postScore = score;
                if (passed) { dbUser.progress[course.id].status = 'completed'; showToast('ยินดีด้วย! คุณผ่านหลักสูตรนี้แล้ว', 'success'); }
                else { showToast('คะแนนของคุณยังไม่ผ่านเกณฑ์ กรุณาทำแบบทดสอบใหม่อีกครั้ง', 'error'); }
            }
            saveUsers(users);
            renderCourseViewer(document.getElementById('app'));
        });
    }

    const playOverlay = document.getElementById('video-play-overlay');
    if (playOverlay) { playOverlay.addEventListener('click', () => { playOverlay.style.display = 'none'; toggleVideoMock(course); }); }
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) { playPauseBtn.addEventListener('click', () => toggleVideoMock(course)); }
    const finishVideoBtn = document.getElementById('finish-video-btn');
    if (finishVideoBtn) {
        finishVideoBtn.addEventListener('click', () => {
            const users = getUsers();
            const dbUser = users.find(u => u.username === state.currentUser.username);
            dbUser.progress[course.id].videoWatched = true;
            if (dbUser.progress[course.id].status === 'video') dbUser.progress[course.id].status = 'post-test';
            saveUsers(users);
            showToast('รับชมวิดีโอจบแล้ว สามารถทำแบบทดสอบหลังเรียนได้ทันที', 'success');
            state.activeCourseStep = 3;
            renderCourseViewer(document.getElementById('app'));
        });
    }
}

function toggleVideoMock(course) {
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (!playPauseBtn) return;
    if (state.videoMockPlaying) { clearInterval(state.videoInterval); state.videoMockPlaying = false; playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>'; }
    else {
        state.videoMockPlaying = true; playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        state.videoInterval = setInterval(() => {
            state.videoMockTime++; state.videoMockProgress = Math.min((state.videoMockTime / state.videoMockDuration) * 100, 100);
            const progressFill = document.getElementById('progress-fill');
            const timeEl = document.getElementById('video-time-display');
            if (progressFill) progressFill.style.width = `${state.videoMockProgress}%`;
            if (timeEl) timeEl.textContent = `00:${String(state.videoMockTime).padStart(2, '0')} / 00:${state.videoMockDuration}`;
            if (state.videoMockTime >= state.videoMockDuration) {
                clearInterval(state.videoInterval);
                const finishBtn = document.getElementById('finish-video-btn'); if (finishBtn) finishBtn.disabled = false;
                const statusMsg = document.getElementById('video-status-msg'); if (statusMsg) { statusMsg.className = 'video-status-msg watched'; statusMsg.innerHTML = '<i class="fa-solid fa-circle-check"></i> รับชมเสร็จสิ้น! สามารถกดถัดไปได้'; }
            }
        }, 1000);
    }
}

function getPreTestHTML(course, prog) {
    if (prog.preScore !== null && !state.quizResults) {
        return `<div class="result-card"><div class="result-badge pass"><i class="fa-solid fa-square-poll-vertical"></i></div><h3>คุณได้ทำแบบทดสอบก่อนเรียนแล้ว</h3><div class="result-score">${prog.preScore} <span>/ ${course.preQuestions.length} คะแนน</span></div><p class="result-desc">การทดสอบก่อนเรียนมีวัตถุประสงค์เพื่อวัดความรู้พื้นฐานเท่านั้น ลำดับถัดไปโปรดเข้าศึกษาจากวิดีโอ</p><button class="btn btn-primary" onclick="state.activeCourseStep = 2; renderCourseViewer(document.getElementById('app'));">ไปสู่ขั้นตอนการดูวิดีโอ <i class="fa-solid fa-arrow-right"></i></button></div>`;
    }
    if (state.quizResults) { return renderQuizResultHTML('ผลการทดสอบก่อนเรียน', state.quizResults, () => { state.quizResults = null; state.activeCourseStep = 2; renderCourseViewer(document.getElementById('app')); }, 'ไปดูวิดีโออบรม'); }
    return renderQuizFormHTML('แบบทดสอบก่อนเรียน (Pre-test)', course.preQuestions);
}

function getVideoHTML(course, prog) {
    return `<div class="step-header"><h2>สื่อวิดีโอเพื่อการเรียนรู้</h2><p>วิชา: ${course.title}</p></div><div class="video-wrapper">${prog.videoWatched ? `<iframe class="video-iframe" src="${course.videoUrl.replace('watch?v=', 'embed/')}" allowfullscreen></iframe>` : `<div class="video-play-overlay" id="video-play-overlay"><div class="play-circle"><i class="fa-solid fa-play"></i></div><p>คลิกเพื่อเล่นวิดีโอการอบรม (จำลองเวลาเรียน ${state.videoMockDuration} วินาที)</p></div><div class="video-mockup"><div class="video-mockup-body"><i class="fa-solid fa-display"></i><h4>กำลังสตรีมวิดีโอการสอนจากระบบภายนอก...</h4></div><div class="video-controls"><button class="control-btn" id="play-pause-btn"><i class="fa-solid fa-play"></i></button><div class="progress-bar-container"><div class="progress-fill" id="progress-fill" style="width: 0%;"></div></div><span class="video-time" id="video-time-display">00:00 / 00:${state.videoMockDuration}</span></div></div>`}</div><div class="video-actions"><div class="video-status-msg ${prog.videoWatched ? 'watched' : 'unwatched'}" id="video-status-msg">${prog.videoWatched ? '<i class="fa-solid fa-circle-check"></i> รับชมสำเร็จแล้ว' : '<i class="fa-solid fa-circle-play"></i> โปรดดูวิดีโอให้จบตามเวลาระบบ เพื่อปลดล็อกข้อสอบถัดไป'}</div><button class="btn btn-primary" id="finish-video-btn" ${prog.videoWatched ? '' : 'disabled'}>ไปยังแบบทดสอบหลังเรียน <i class="fa-solid fa-arrow-right"></i></button></div>`;
}

function getPostTestHTML(course, prog) {
    if (state.quizResults) {
        const isPassed = state.quizResults.passed;
        return renderQuizResultHTML('ผลการทดสอบหลังเรียน', state.quizResults, () => { state.quizResults = null; if (isPassed) navigateTo('student-dashboard'); else { state.quizAnswers = {}; renderCourseViewer(document.getElementById('app')); } }, isPassed ? 'กลับแผงควบคุมหลัก' : 'ลองทำแบบทดสอบอีกครั้ง');
    }
    if (prog.status === 'completed') { return `<div class="result-card"><div class="result-badge pass"><i class="fa-solid fa-award"></i></div><h3>คุณผ่านหลักสูตรวิชานี้เรียบร้อยแล้ว</h3><div class="result-score">${prog.postScore} <span>/ ${course.postQuestions.length} คะแนน</span></div><p class="result-desc">ยินดีด้วยคุณได้ผ่านเกณฑ์ชี้วัดขั้นต่ำ ${course.passingScore}% เรียบร้อยแล้ว</p><button class="btn btn-secondary" onclick="navigateTo('student-dashboard')"><i class="fa-solid fa-house"></i> กลับสู่หน้าหลักผู้เรียน</button></div>`; }
    return renderQuizFormHTML('แบบทดสอบหลังเรียน (Post-test)เพื่อจบหลักสูตร', course.postQuestions);
}

function renderQuizFormHTML(title, questions) {
    return `<div class="step-header"><h2>${title}</h2><p>กรุณาตอบคำถามให้ถูกต้องครบทุกข้อก่อนกดส่งผลสอบ</p></div><form id="quiz-form">${questions.map((q, qIdx) => `<div class="question-block"><div class="question-title"><span class="question-num">ข้อที่ ${qIdx + 1}.</span><span>${escapeHtml(q.question)}</span></div><div class="options-list">${q.choices.map((choice, cIdx) => `<div class="option-card ${state.quizAnswers[qIdx] === cIdx ? 'selected' : ''}" data-q="${qIdx}" data-c="${cIdx}"><div class="option-circle"></div><div class="option-text">${escapeHtml(choice)}</div></div>`).join('')}</div></div>`).join('')}<div style="text-align: right; margin-top: 40px;"><button type="submit" class="btn btn-success" style="padding: 14px 32px;">ส่งคำตอบและตรวจคะแนน <i class="fa-solid fa-paper-plane"></i></button></div></form>`;
}

function renderQuizResultHTML(title, results, callbackTarget, btnText) {
    setTimeout(() => { const btn = document.getElementById('result-action-btn'); if (btn) btn.addEventListener('click', callbackTarget); }, 50);
    return `<div class="result-card"><div class="result-badge ${results.passed ? 'pass' : 'fail'}"><i class="fa-solid ${results.passed ? 'fa-circle-check' : 'fa-circle-xmark'}"></i></div><h3>${title}</h3><div class="result-score">${results.score} <span>/ ${results.total} คะแนน</span></div><p class="result-desc">คิดเป็นเปอร์เซ็นต์ได้: <strong>${results.percentage}%</strong><br>สถานะผลการวัดระดับ: <strong style="color:${results.passed ? 'var(--success)' : 'var(--error)'}">${results.passed ? 'ผ่านเกณฑ์วัดผล (PASS)' : 'ไม่ผ่านเกณฑ์วัดผล (FAILED)'}</strong></p><button class="btn btn-primary" id="result-action-btn" style="width:100%;">${btnText} <i class="fa-solid fa-arrow-right"></i></button></div>`;
}

// 9. ADMIN DASHBOARD VIEW RENDERER
function renderAdminDashboard(container) {
    const users = getUsers(); const courses = getCourses(); const students = users.filter(u => u.role === 'student');
    container.innerHTML = `
        ${getHeaderHTML()}
        <main class="container admin-layout fade-in">
            <div class="page-title-section"><div><h1>ระบบการจัดการสำหรับผู้ดูแลหลังบ้าน</h1><p>จัดการผู้เรียน ข้อมูลหลักสูตร และสรุปประเมินรายงานการพิมพ์</p></div></div>
            <div class="tabs-header">
                <button class="tab-btn ${state.adminActiveTab === 'students' ? 'active' : ''}" id="tab-students-btn">จัดการรายชื่อผู้เรียน</button>
                <button class="tab-btn ${state.adminActiveTab === 'reports' ? 'active' : ''}" id="tab-reports-btn">รายงานผลการอบรม (Print/PDF)</button>
            </div>
            <div class="admin-section ${state.adminActiveTab === 'students' ? 'active' : ''}" id="sec-students">
                <div class="section-header"><h2>สมาชิกทั้งหมดในระบบฝึกอบรม (${students.length} คน)</h2></div>
                <div class="table-wrapper">
                    <table class="admin-table">
                        <thead><tr><th>ชื่อผู้เรียน</th><th>ชื่อบัญชีผู้ใช้</th><th>รหัสผ่านส่องดู</th><th>ตำแหน่ง/แผนก</th><th>เบอร์โทร/อีเมล</th></tr></thead>
                        <tbody>${students.map(st => `<tr><td><div class="table-user-cell">${st.avatar ? `<img src="${st.avatar}" class="table-avatar">` : `<div class="table-avatar-placeholder">${st.name.charAt(0)}</div>`}<strong>${escapeHtml(st.name)}</strong></div></td><td><code>${escapeHtml(st.username)}</code></td><td><span class="pwd-col">${escapeHtml(st.password)}</span></td><td><span style="font-size:0.85rem;">${escapeHtml(st.position || 'ทั่วไป')}</span><br><small style="color:var(--text-muted);">${escapeHtml(st.department || '-')}</small></td><td><span style="font-size:0.85rem;">${escapeHtml(st.phone || '-')}</span><br><small style="color:var(--text-muted);">${escapeHtml(st.email || '-')}</small></td></tr>`).join('')}</tbody>
                    </table>
                </div>
            </div>
            <div class="admin-section ${state.adminActiveTab === 'reports' ? 'active' : ''}" id="sec-reports">
                <div class="section-header"><h2>รายงานวิเคราะห์ผลคะแนนสอบประมวลสรุปผล</h2><button class="btn btn-primary" onclick="window.print()"><i class="fa-solid fa-print"></i> พิมพ์รายงานใบสรุป (Print to PDF)</button></div>
                ${courses.map(course => {
                    const completedStudents = []; const inProgressStudents = []; const notStartedStudents = [];
                    students.forEach(st => {
                        const prog = st.progress ? st.progress[course.id] : null;
                        if (prog) {
                            if (prog.status === 'completed') completedStudents.push({ name: st.name, score: prog.postScore, pre: prog.preScore });
                            else inProgressStudents.push({ name: st.name });
                        } else { notStartedStudents.push({ name: st.name }); }
                    });
                    const totalAssigned = completedStudents.length + inProgressStudents.length + notStartedStudents.length;
                    const completionRate = totalAssigned > 0 ? Math.round((completedStudents.length / totalAssigned) * 100) : 0;
                    return `<div class="glass-panel report-course-card"><div class="report-course-header"><h3>${course.title}</h3><span class="completion-percentage-badge">อบรมสำเร็จแล้ว ${completionRate}%</span></div><div class="report-progress-bar-container"><div class="report-progress-bar-fill" style="width: ${completionRate}%;"></div></div><div class="report-groups-grid"><div class="report-group-col completed"><h5><i class="fa-solid fa-circle-check"></i> สำเร็จหลักสูตรแล้ว (${completedStudents.length})</h5><div class="report-student-list">${completedStudents.length > 0 ? completedStudents.map(s => `<div class="report-student-badge"><span>${escapeHtml(s.name)}</span><span class="score">ก่อน:${s.pre} | หลัง:${s.score} คะแนน</span></div>`).join('') : '<p style="color:var(--text-dark);font-size:0.8rem;text-align:center;">ยังไม่มีผู้ผ่านเกณฑ์</p>'}</div></div><div class="report-group-col inprogress"><h5><i class="fa-solid fa-spinner"></i> อยู่ระหว่างศึกษาอยู่ (${inProgressStudents.length})</h5><div class="report-student-list">${inProgressStudents.length > 0 ? inProgressStudents.map(s => `<div class="report-student-badge"><span>${escapeHtml(s.name)}</span></div>`).join('') : '<p style="color:var(--text-dark);font-size:0.8rem;text-align:center;">ไม่มีนักเรียนค้างคา</p>'}</div></div><div class="report-group-col notstarted"><h5><i class="fa-solid fa-hourglass-start"></i> ยังไม่เข้าทำแบบทดสอบ (${notStartedStudents.length})</h5><div class="report-student-list">${notStartedStudents.length > 0 ? notStartedStudents.map(s => `<div class="report-student-badge"><span>${escapeHtml(s.name)}</span></div>`).join('') : '<p style="color:var(--text-dark);font-size:0.8rem;text-align:center;">ไม่มีผู้ค้างหลงเหลือ</p>'}</div></div></div></div>`;
                }).join('')}
            </div>
        </main>
    `;
    bindHeaderEvents();
    document.getElementById('tab-students-btn').addEventListener('click', () => { state.adminActiveTab = 'students'; renderAdminDashboard(container); });
    document.getElementById('tab-reports-btn').addEventListener('click', () => { state.adminActiveTab = 'reports'; renderAdminDashboard(container); });
}

function escapeHtml(text) { if (!text) return ''; return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }

// 10. APP ENTRYPOINT INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
    initDatabase();
    setTimeout(() => {
        state.currentUser = null;
        renderView();
    }, 600);
});