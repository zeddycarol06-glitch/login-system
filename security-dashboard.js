// ========== ADMIN ACCESS ENFORCEMENT ==========
const ADMIN_EMAIL = "admin@zedtech.com";

function checkAdminAccess() {
    const currentUser = localStorage.getItem("zedtech_current_user");
    const isAdmin = currentUser && JSON.parse(currentUser).email === ADMIN_EMAIL;
    if (!isAdmin) {
        window.location.href = "index.html";
        return false;
    }
    return true;
}

// ========== DATA GENERATORS ==========
const threatTypes = ['Brute Force', 'SQL Injection', 'XSS Attack', 'DDoS', 'Malware', 'Phishing', 'Man-in-the-Middle', 'Ransomware'];
const severities = ['critical', 'high', 'medium', 'low'];
const countries = [
    { flag: '🇷🇺', name: 'Russia', code: 'RU' },
    { flag: '🇨🇳', name: 'China', code: 'CN' },
    { flag: '🇺🇸', name: 'USA', code: 'US' },
    { flag: '🇧🇷', name: 'Brazil', code: 'BR' },
    { flag: '🇮🇳', name: 'India', code: 'IN' },
    { flag: '🇩🇪', name: 'Germany', code: 'DE' },
    { flag: '🇳🇬', name: 'Nigeria', code: 'NG' },
    { flag: '🇰🇵', name: 'North Korea', code: 'KP' },
    { flag: '🇮🇷', name: 'Iran', code: 'IR' },
    { flag: '🇬🇧', name: 'UK', code: 'GB' },
];
const ports = [22, 80, 443, 3306, 5432, 8080, 8443, 21, 25, 110, 143, 3389, 5900, 6379, 27017];

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomIP() { return `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 255)}`; }
function padZero(n) { return n.toString().padStart(2, '0'); }

function getTimeAgo(minutes) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - minutes);
    return `${padZero(now.getHours())}:${padZero(now.getMinutes())}:${padZero(now.getSeconds())}`;
}

function formatTimestamp(date) {
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
}

// ========== SIDEBAR NAVIGATION ==========
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const sidebarClose = document.getElementById('sidebar-close');
const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
const sections = document.querySelectorAll('.dashboard-section');

menuToggle.addEventListener('click', () => sidebar.classList.add('open'));
sidebarClose.addEventListener('click', () => sidebar.classList.remove('open'));

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        if (!section) return;

        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        sections.forEach(s => s.classList.remove('active'));
        document.getElementById(`section-${section}`).classList.add('active');
        sidebar.classList.remove('open');

        if (section === 'network') drawBandwidthChart();
    });
});

// ========== NOTIFICATION PANEL ==========
const notifBtn = document.getElementById('notification-btn');
const notifPanel = document.getElementById('notification-panel');
const notifOverlay = document.getElementById('notif-overlay');
const closeNotifBtn = document.getElementById('close-notif');

notifBtn.addEventListener('click', () => {
    notifPanel.classList.add('open');
    notifOverlay.classList.add('open');
});

[closeNotifBtn, notifOverlay].forEach(el => {
    el.addEventListener('click', () => {
        notifPanel.classList.remove('open');
        notifOverlay.classList.remove('open');
    });
});

// ========== SECURITY SCORE ANIMATION ==========
function animateScore(target) {
    const scoreEl = document.getElementById('security-score');
    const circle = document.getElementById('score-circle');
    const circumference = 2 * Math.PI * 50;
    const offset = circumference - (target / 100) * circumference;
    circle.style.strokeDashoffset = offset;
    scoreEl.textContent = target;

    if (target >= 80) circle.style.stroke = '#22c55e';
    else if (target >= 60) circle.style.stroke = '#f59e0b';
    else circle.style.stroke = '#ef4444';
}

// ========== THREAT CHART (Canvas) ==========
function drawThreatChart() {
    const canvas = document.getElementById('threat-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 35, left: 45 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Generate 24h data
    const hours = 24;
    const blocked = [];
    const detected = [];
    const critical = [];
    for (let i = 0; i < hours; i++) {
        blocked.push(randomInt(30, 80));
        detected.push(randomInt(10, 40));
        critical.push(randomInt(0, 12));
    }

    const maxVal = Math.max(...blocked, ...detected, ...critical) + 10;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartH / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '10px Poppins';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxVal - (maxVal / 5) * i), padding.left - 8, y + 4);
    }

    // X-axis labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Poppins';
    ctx.textAlign = 'center';
    for (let i = 0; i < hours; i += 3) {
        const x = padding.left + (chartW / (hours - 1)) * i;
        ctx.fillText(`${padZero(i)}:00`, x, h - 8);
    }

    function drawLine(data, color, fill) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        for (let i = 0; i < data.length; i++) {
            const x = padding.left + (chartW / (data.length - 1)) * i;
            const y = padding.top + chartH - (data[i] / maxVal) * chartH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        if (fill) {
            const lastX = padding.left + chartW;
            const firstX = padding.left;
            ctx.lineTo(lastX, padding.top + chartH);
            ctx.lineTo(firstX, padding.top + chartH);
            ctx.closePath();
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    drawLine(blocked, '#22c55e', '#22c55e');
    drawLine(detected, '#3b82f6', '#3b82f6');
    drawLine(critical, '#ef4444', '#ef4444');

    // Data points
    function drawDots(data, color) {
        ctx.fillStyle = color;
        for (let i = 0; i < data.length; i++) {
            const x = padding.left + (chartW / (data.length - 1)) * i;
            const y = padding.top + chartH - (data[i] / maxVal) * chartH;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawDots(blocked, '#22c55e');
    drawDots(detected, '#3b82f6');
    drawDots(critical, '#ef4444');
}

// ========== THREAT TYPES DONUT CHART ==========
function drawThreatTypesChart() {
    const canvas = document.getElementById('threat-types-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - 20;
    const innerRadius = radius * 0.6;

    const data = [423, 312, 198, 156, 89, 69];
    const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e', '#64748b'];
    const total = data.reduce((a, b) => a + b, 0);

    ctx.clearRect(0, 0, w, h);

    let startAngle = -Math.PI / 2;
    data.forEach((val, i) => {
        const sliceAngle = (val / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(cx + innerRadius * Math.cos(startAngle), cy + innerRadius * Math.sin(startAngle));
        ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
        ctx.arc(cx, cy, innerRadius, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = colors[i];
        ctx.fill();

        startAngle += sliceAngle;
    });

    // Center text
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 22px Poppins';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toLocaleString(), cx, cy - 6);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Poppins';
    ctx.fillText('Total Threats', cx, cy + 14);
}

// ========== BANDWIDTH CHART ==========
function drawBandwidthChart() {
    const canvas = document.getElementById('bandwidth-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 30, left: 45 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const points = 30;
    const incoming = [];
    const outgoing = [];
    for (let i = 0; i < points; i++) {
        incoming.push(randomInt(20, 100));
        outgoing.push(randomInt(10, 60));
    }
    const maxVal = Math.max(...incoming, ...outgoing) + 10;

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Poppins';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxVal - (maxVal / 4) * i) + ' Mbps', padding.left - 8, y + 4);
    }

    // Bars
    const barWidth = (chartW / points) * 0.6;
    const gap = (chartW / points) * 0.4;

    incoming.forEach((val, i) => {
        const x = padding.left + (chartW / points) * i + gap / 2;
        const barH = (val / maxVal) * chartH;
        ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
        ctx.beginPath();
        ctx.roundRect(x, padding.top + chartH - barH, barWidth / 2 - 1, barH, [2, 2, 0, 0]);
        ctx.fill();
    });

    outgoing.forEach((val, i) => {
        const x = padding.left + (chartW / points) * i + gap / 2;
        const barH = (val / maxVal) * chartH;
        ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.beginPath();
        ctx.roundRect(x + barWidth / 2 + 1, padding.top + chartH - barH, barWidth / 2 - 1, barH, [2, 2, 0, 0]);
        ctx.fill();
    });

    // X labels
    ctx.fillStyle = '#64748b';
    ctx.font = '9px Poppins';
    ctx.textAlign = 'center';
    for (let i = 0; i < points; i += 5) {
        const x = padding.left + (chartW / points) * i + barWidth / 2;
        ctx.fillText(`-${points - i}s`, x, h - 8);
    }
}

// ========== LIVE FEED ==========
const liveFeed = document.getElementById('live-feed');
const feedIcons = {
    'Brute Force': { icon: 'key', class: 'danger' },
    'SQL Injection': { icon: 'data_object', class: 'danger' },
    'XSS Attack': { icon: 'code', class: 'warning' },
    'DDoS': { icon: 'cloud_off', class: 'danger' },
    'Malware': { icon: 'bug_report', class: 'danger' },
    'Phishing': { icon: 'phishing', class: 'warning' },
    'Man-in-the-Middle': { icon: 'sync_alt', class: 'info' },
    'Ransomware': { icon: 'lock', class: 'danger' },
};

function createFeedItem() {
    const type = randomFrom(threatTypes);
    const severity = randomFrom(severities);
    const ip = randomIP();
    const iconInfo = feedIcons[type] || { icon: 'warning', class: 'info' };

    const item = document.createElement('div');
    item.className = `feed-item ${severity}`;
    item.innerHTML = `
        <span class="feed-time">${getTimeAgo(0)}</span>
        <div class="feed-icon ${iconInfo.class}">
            <span class="material-symbols-rounded">${iconInfo.icon}</span>
        </div>
        <div class="feed-text"><strong>${type}</strong> from ${ip}</div>
    `;

    liveFeed.prepend(item);
    if (liveFeed.children.length > 50) liveFeed.lastChild.remove();
}

// ========== IP LIST ==========
function renderIPList() {
    const ipList = document.getElementById('ip-list');
    const ips = [];
    for (let i = 0; i < 8; i++) {
        const country = randomFrom(countries);
        const attacks = randomInt(10, 500);
        ips.push({ ip: randomIP(), flag: country.flag, country: country.name, attacks });
    }
    ips.sort((a, b) => b.attacks - a.attacks);

    const maxAttacks = ips[0].attacks;
    ipList.innerHTML = ips.map(ip => {
        const severity = ip.attacks > 300 ? 'high' : ip.attacks > 100 ? 'medium' : 'low';
        const color = ip.attacks > 300 ? '#ef4444' : ip.attacks > 100 ? '#f59e0b' : '#64748b';
        const width = (ip.attacks / maxAttacks) * 100;
        return `
            <div class="ip-item">
                <span class="ip-flag">${ip.flag}</span>
                <span class="ip-address">${ip.ip}</span>
                <span class="ip-attacks ${severity}">${ip.attacks} attacks</span>
                <div class="ip-bar">
                    <div class="ip-bar-fill" style="width:${width}%;background:${color}"></div>
                </div>
            </div>
        `;
    }).join('');
}

// ========== THREAT TABLE ==========
function renderThreatTable() {
    const tbody = document.getElementById('threat-table-body');
    const rows = [];
    for (let i = 0; i < 20; i++) {
        const type = randomFrom(threatTypes);
        const severity = randomFrom(severities);
        const ip = randomIP();
        const target = randomFrom(['/api/login', '/admin', '/dashboard', '/api/users', '/uploads', '/api/data', '/config', '/.env']);
        const statuses = ['blocked', 'blocked', 'blocked', 'detected', 'investigating'];
        const status = randomFrom(statuses);
        const date = new Date();
        date.setMinutes(date.getMinutes() - randomInt(1, 1440));

        rows.push({ type, severity, ip, target, status, date });
    }
    rows.sort((a, b) => b.date - a.date);

    tbody.innerHTML = rows.map(r => `
        <tr>
            <td style="font-family:'Courier New',monospace;font-size:0.78rem">${formatTimestamp(r.date)}</td>
            <td>${r.type}</td>
            <td style="font-family:'Courier New',monospace;font-size:0.82rem">${r.ip}</td>
            <td style="font-family:'Courier New',monospace;font-size:0.82rem;color:#3b82f6">${r.target}</td>
            <td><span class="severity-badge ${r.severity}">${r.severity}</span></td>
            <td><span class="status-badge ${r.status}">${r.status}</span></td>
            <td><button class="action-btn">Block IP</button></td>
        </tr>
    `).join('');
}

// ========== ACTIVITY LOG ==========
function renderActivityLog() {
    const timeline = document.getElementById('activity-timeline');
    const actions = [
        { type: 'login', title: 'User Login Successful', desc: 'Logged in from Chrome on Windows', ip: randomIP() },
        { type: 'failed', title: 'Failed Login Attempt', desc: 'Invalid password entered 3 times', ip: randomIP() },
        { type: 'logout', title: 'User Logged Out', desc: 'Session expired after 30 minutes of inactivity', ip: randomIP() },
        { type: 'login', title: 'Admin Login', desc: 'Admin access granted from trusted device', ip: randomIP() },
        { type: 'settings', title: 'Security Settings Updated', desc: 'Two-factor authentication enabled for all accounts', ip: randomIP() },
        { type: 'failed', title: 'Unauthorized Access Attempt', desc: 'Attempted to access /admin without permissions', ip: randomIP() },
        { type: 'login', title: 'New Device Login', desc: 'First-time login detected from iPhone 15', ip: randomIP() },
        { type: 'settings', title: 'Password Changed', desc: 'User password updated successfully', ip: randomIP() },
        { type: 'failed', title: 'Brute Force Detected', desc: '50+ attempts from same IP in 5 minutes', ip: randomIP() },
        { type: 'logout', title: 'Forced Logout', desc: 'Session terminated due to suspicious activity', ip: randomIP() },
    ];

    timeline.innerHTML = actions.map((a, i) => `
        <div class="activity-item">
            <div class="activity-dot ${a.type}"></div>
            <div class="activity-content">
                <div class="activity-header">
                    <span class="activity-title">${a.title}</span>
                    <span class="activity-time">${getTimeAgo(i * 12 + randomInt(1, 10))}</span>
                </div>
                <div class="activity-desc">${a.desc}</div>
                <div class="activity-ip">IP: ${a.ip}</div>
            </div>
        </div>
    `).join('');
}

// ========== NETWORK CONNECTIONS ==========
function renderConnections() {
    const list = document.getElementById('connections-list');
    const statuses = ['active', 'active', 'active', 'idle', 'closed'];
    const protocols = ['HTTPS', 'HTTP', 'SSH', 'FTP', 'TCP', 'UDP'];

    let html = '';
    for (let i = 0; i < 12; i++) {
        const status = randomFrom(statuses);
        html += `
            <div class="connection-item">
                <span class="connection-status ${status}"></span>
                <span class="connection-ip">${randomIP()}</span>
                <span class="connection-port">:${randomFrom(ports)}</span>
                <span class="connection-protocol">${randomFrom(protocols)}</span>
            </div>
        `;
    }
    list.innerHTML = html;
}

// ========== PORT SCAN DETECTIONS ==========
function renderPortScans() {
    const list = document.getElementById('port-scan-list');
    const scans = [];
    for (let i = 0; i < 6; i++) {
        const type = randomFrom(['safe', 'safe', 'warning']);
        const scannedPorts = [];
        const count = randomInt(3, 8);
        for (let j = 0; j < count; j++) scannedPorts.push(randomFrom(ports));
        scans.push({
            ip: randomIP(),
            ports: [...new Set(scannedPorts)].sort((a, b) => a - b).join(', '),
            type,
            time: getTimeAgo(randomInt(5, 120))
        });
    }

    list.innerHTML = scans.map(s => `
        <div class="port-scan-item ${s.type}">
            <span class="port-scan-ip">${s.ip}</span>
            <span class="port-scan-ports">Ports: ${s.ports}</span>
            <span class="port-scan-time">${s.time}</span>
        </div>
    `).join('');
}

// ========== GEO MAP ==========
function renderGeoMap() {
    const map = document.getElementById('geo-map');
    const geoCounts = countries.slice(0, 9).map(c => ({
        ...c,
        count: randomInt(10, 800)
    })).sort((a, b) => b.count - a.count);

    map.innerHTML = geoCounts.map(g => `
        <div class="geo-item">
            <div class="geo-flag">${g.flag}</div>
            <div class="geo-country">${g.name}</div>
            <div class="geo-count">${g.count} threats</div>
        </div>
    `).join('');
}

// ========== ALERTS ==========
const alertsData = [
    { type: 'critical', title: 'Brute Force Attack Detected', desc: 'Multiple failed login attempts detected from IP 192.168.1.45. Account lockout recommended.', time: '2 min ago' },
    { type: 'warning', title: 'SSL Certificate Expiring', desc: 'SSL certificate for api.zedtech.com will expire in 14 days. Renewal required.', time: '15 min ago' },
    { type: 'critical', title: 'SQL Injection Attempt Blocked', desc: 'Malicious query detected in login form input. Attack source has been blocked.', time: '32 min ago' },
    { type: 'info', title: 'System Update Available', desc: 'Security patch v2.4.1 available for installation. Includes critical vulnerability fixes.', time: '1 hr ago' },
    { type: 'warning', title: 'Unusual Traffic Spike', desc: 'Network traffic increased 340% above normal baseline. Possible DDoS in progress.', time: '2 hr ago' },
    { type: 'info', title: 'New Admin User Created', desc: 'Account admin@zedtech.com has been granted administrator privileges.', time: '3 hr ago' },
    { type: 'warning', title: 'Failed Backup Attempt', desc: 'Automated database backup failed. Manual intervention may be required.', time: '5 hr ago' },
];

function renderAlerts() {
    const container = document.getElementById('alerts-container');
    const icons = { critical: 'error', warning: 'warning', info: 'info' };

    container.innerHTML = alertsData.map((a, i) => `
        <div class="alert-card ${a.type}" data-index="${i}">
            <div class="alert-icon">
                <span class="material-symbols-rounded">${icons[a.type]}</span>
            </div>
            <div class="alert-content">
                <div class="alert-title">${a.title}</div>
                <div class="alert-desc">${a.desc}</div>
                <div class="alert-time">${a.time}</div>
            </div>
            <button class="alert-dismiss" onclick="dismissAlert(${i})">
                <span class="material-symbols-rounded">close</span>
            </button>
        </div>
    `).join('');
}

function dismissAlert(index) {
    const card = document.querySelector(`.alert-card[data-index="${index}"]`);
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateX(20px)';
        setTimeout(() => card.remove(), 300);
    }
    const badge = document.getElementById('alert-badge');
    const remaining = document.querySelectorAll('.alert-card').length - 1;
    badge.textContent = Math.max(0, remaining);
}

document.getElementById('clear-alerts-btn').addEventListener('click', () => {
    const container = document.getElementById('alerts-container');
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)"><span class="material-symbols-rounded" style="font-size:3rem;display:block;margin-bottom:10px">check_circle</span>No alerts to display</div>';
    document.getElementById('alert-badge').textContent = '0';
});

// ========== NOTIFICATIONS ==========
function renderNotifications() {
    const notifList = document.getElementById('notif-list');
    const notifs = [
        { type: 'danger', title: 'Critical: Brute Force Attack', desc: 'IP 103.45.67.89 attempted 127 failed logins', time: '1 min ago' },
        { type: 'warning', title: 'Suspicious File Upload', desc: 'User uploaded executable file to uploads directory', time: '8 min ago' },
        { type: 'success', title: 'Firewall Rule Updated', desc: 'New rule added to block traffic from flagged IPs', time: '22 min ago' },
        { type: 'info', title: 'Security Scan Complete', desc: 'Full system scan found 0 new vulnerabilities', time: '1 hr ago' },
        { type: 'danger', title: 'XSS Payload Detected', desc: 'Malicious script blocked in search parameter', time: '2 hr ago' },
    ];

    const iconMap = { danger: 'shield', warning: 'warning', success: 'check_circle', info: 'info' };

    notifList.innerHTML = notifs.map(n => `
        <div class="notif-item">
            <div class="notif-item-icon ${n.type}">
                <span class="material-symbols-rounded">${iconMap[n.type]}</span>
            </div>
            <div class="notif-item-content">
                <div class="notif-item-title">${n.title}</div>
                <div class="notif-item-desc">${n.desc}</div>
                <div class="notif-item-time">${n.time}</div>
            </div>
        </div>
    `).join('');
}

// ========== LOGIN LOGS ==========
function renderLoginLogs() {
    const tbody = document.getElementById('login-logs-body');
    if (!tbody) return;
    const logs = JSON.parse(localStorage.getItem("zedtech_login_logs") || "[]");

    if (logs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">
                    <span class="material-symbols-rounded" style="font-size:2.5rem;display:block;margin-bottom:8px">group_off</span>
                    No login activity recorded yet
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = logs.map(log => `
        <tr>
            <td style="font-family:'Courier New',monospace;font-size:0.78rem">${log.displayTime || new Date(log.timestamp).toLocaleString()}</td>
            <td>${log.email}</td>
            <td style="font-family:'Courier New',monospace;font-size:0.82rem">${log.ip || 'Unknown'}</td>
            <td>${log.browser || 'Unknown'}</td>
            <td>${log.os || 'Unknown'}</td>
            <td><span class="login-status-badge ${log.success ? 'success' : 'failed'}">${log.success ? 'success' : 'failed'}</span></td>
        </tr>
    `).join('');
}

// ========== METRICS COUNTER ANIMATION ==========
function animateCounter(elementId, target, duration) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * eased);
        el.textContent = current.toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

// ========== INITIALIZE ==========
function init() {
    if (!checkAdminAccess()) return;

    animateScore(87);
    drawThreatChart();
    drawThreatTypesChart();
    renderIPList();
    renderThreatTable();
    renderActivityLog();
    renderConnections();
    renderPortScans();
    renderGeoMap();
    renderAlerts();
    renderNotifications();
    renderLoginLogs();

    const loginLogs = JSON.parse(localStorage.getItem("zedtech_login_logs") || "[]");
    animateCounter('login-attempts', Math.max(loginLogs.length, 1), 1200);

    // Seed initial feed items
    for (let i = 0; i < 8; i++) createFeedItem();

    // Live feed updates
    setInterval(createFeedItem, 3000);

    // Update metrics periodically
    setInterval(() => {
        const threats = document.getElementById('total-threats');
        const blocked = document.getElementById('blocked-attacks');
        if (threats) threats.textContent = (parseInt(threats.textContent.replace(/,/g, '')) + randomInt(1, 5)).toLocaleString();
        if (blocked) blocked.textContent = (parseInt(blocked.textContent.replace(/,/g, '')) + randomInt(1, 4)).toLocaleString();
    }, 5000);

    // Redraw charts on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            drawThreatChart();
            drawThreatTypesChart();
            drawBandwidthChart();
        }, 200);
    });
}

// ========== LOGIN STATUS FILTER ==========
document.addEventListener('DOMContentLoaded', () => {
    const filter = document.getElementById('login-status-filter');
    if (filter) {
        filter.addEventListener('change', () => {
            const value = filter.value;
            const rows = document.querySelectorAll('#login-logs-body tr');
            rows.forEach(row => {
                if (value === 'all') {
                    row.style.display = '';
                } else if (row.querySelector('.login-status-badge')) {
                    const status = row.querySelector('.login-status-badge').textContent;
                    row.style.display = status === value ? '' : 'none';
                }
            });
        });
    }
});

// Handle roundRect polyfill for older browsers
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
        const r = Array.isArray(radii) ? radii[0] || 0 : radii || 0;
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
    };
}

document.addEventListener('DOMContentLoaded', init);
