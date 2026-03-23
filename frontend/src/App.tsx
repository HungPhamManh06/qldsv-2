<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Portal Sinh Viên - UTT</title>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --primary: #2d4a9e;
    --primary-dark: #1e3a7e;
    --primary-light: #e8edf8;
    --sidebar-bg: #2d3a6b;
    --sidebar-hover: #3d4f8a;
    --sidebar-active-bg: rgba(255,255,255,0.12);
    --sidebar-active-color: #f97316;
    --text-dark: #1a202c;
    --text-mid: #4a5568;
    --text-light: #718096;
    --border: #e2e8f0;
    --bg: #f0f2f8;
    --white: #ffffff;
    --success: #38a169;
    --warning: #d69e2e;
    --danger: #e53e3e;
    --shadow: 0 2px 12px rgba(0,0,0,0.08);
    --radius: 10px;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Be Vietnam Pro', sans-serif; background: var(--bg); color: var(--text-dark); display: flex; min-height: 100vh; font-size: 14px; }

  /* LOGIN */
  .login-page { display: flex; min-height: 100vh; width: 100%; background: linear-gradient(135deg, #2d3a6b 0%, #2d4a9e 100%); align-items: center; justify-content: center; padding: 20px; }
  .login-box { background: white; border-radius: 16px; padding: 40px; width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
  .login-logo { text-align: center; margin-bottom: 28px; }
  .login-logo-icon { width: 64px; height: 64px; background: var(--primary); border-radius: 14px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 30px; }
  .login-logo h1 { font-size: 20px; font-weight: 700; color: var(--text-dark); }
  .login-logo p { font-size: 12px; color: var(--text-light); margin-top: 3px; }
  .form-group { margin-bottom: 14px; }
  .form-label { display: block; font-size: 12px; font-weight: 600; color: var(--text-mid); margin-bottom: 5px; }
  .form-input { width: 100%; padding: 10px 13px; border: 1.5px solid var(--border); border-radius: 8px; font-family: inherit; font-size: 13px; outline: none; transition: border-color 0.2s; }
  .form-input:focus { border-color: var(--primary); }
  .btn-login { width: 100%; padding: 11px; background: var(--primary); color: white; border: none; border-radius: 8px; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; margin-top: 6px; }
  .btn-login:hover { background: var(--primary-dark); }
  .login-hint { text-align: center; margin-top: 12px; font-size: 12px; color: var(--text-light); background: var(--bg); padding: 8px; border-radius: 7px; }

  /* LAYOUT */
  #app { display: none; width: 100%; }

  /* SIDEBAR */
  .sidebar { width: 210px; background: var(--sidebar-bg); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; overflow-y: auto; }
  .sidebar::-webkit-scrollbar { width: 3px; }
  .sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); }

  .sidebar-logo { padding: 16px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; gap: 9px; }
  .sidebar-logo-icon { width: 34px; height: 34px; background: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .sidebar-logo-text { color: white; font-weight: 700; font-size: 13px; line-height: 1.3; }
  .sidebar-logo-text small { display: block; font-size: 10px; font-weight: 400; color: rgba(255,255,255,0.45); }

  .nav-item { display: flex; align-items: center; gap: 9px; padding: 9px 14px; color: rgba(255,255,255,0.7); cursor: pointer; transition: all 0.18s; font-size: 13px; font-weight: 500; }
  .nav-item:hover { background: var(--sidebar-hover); color: white; }
  .nav-item.active { background: var(--sidebar-active-bg); color: var(--sidebar-active-color); }
  .nav-item .nav-icon { font-size: 15px; width: 18px; text-align: center; flex-shrink: 0; }
  .nav-item .nav-label { flex: 1; }
  .nav-item .nav-arrow { font-size: 10px; color: rgba(255,255,255,0.35); transition: transform 0.2s; }
  .nav-item.open .nav-arrow { transform: rotate(90deg); }

  .nav-sub { display: none; background: rgba(0,0,0,0.15); }
  .nav-sub.open { display: block; }
  .nav-sub .nav-item { padding-left: 38px; font-size: 12px; color: rgba(255,255,255,0.55); position: relative; }
  .nav-sub .nav-item::before { content: ''; position: absolute; left: 22px; top: 50%; transform: translateY(-50%); width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.3); }
  .nav-sub .nav-item.active::before { background: var(--sidebar-active-color); }
  .nav-sub .nav-item.active { color: white; }

  .sidebar-user { padding: 12px 14px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; gap: 9px; cursor: pointer; }
  .sidebar-user:hover { background: var(--sidebar-hover); }
  .avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 12px; flex-shrink: 0; }
  .user-name { color: white; font-size: 12px; font-weight: 600; }
  .user-id { color: rgba(255,255,255,0.4); font-size: 10px; }

  /* MAIN */
  .main { margin-left: 210px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }

  /* TOPBAR */
  .topbar { background: var(--sidebar-bg); padding: 0 20px; height: 52px; display: flex; align-items: center; gap: 12px; position: sticky; top: 0; z-index: 50; }
  .topbar-menu-btn { color: rgba(255,255,255,0.7); font-size: 18px; cursor: pointer; }
  .search-box { flex: 1; max-width: 380px; position: relative; }
  .search-box input { width: 100%; padding: 7px 14px 7px 34px; border: none; border-radius: 7px; font-family: inherit; font-size: 12px; color: white; background: rgba(255,255,255,0.12); outline: none; }
  .search-box input::placeholder { color: rgba(255,255,255,0.45); }
  .search-box input:focus { background: rgba(255,255,255,0.18); }
  .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.45); font-size: 13px; }
  .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 6px; }
  .topbar-profile { display: flex; align-items: center; gap: 8px; padding: 5px 10px; border-radius: 7px; cursor: pointer; color: white; }
  .topbar-profile:hover { background: rgba(255,255,255,0.1); }
  .topbar-profile-name { font-size: 13px; font-weight: 500; }

  /* CONTENT */
  .content { flex: 1; padding: 20px; display: none; }
  .content.active { display: block; }
  .page-title { font-size: 18px; font-weight: 700; color: var(--text-dark); margin-bottom: 2px; }
  .page-sub { color: var(--text-light); font-size: 12px; margin-bottom: 20px; }

  /* CARDS */
  .card { background: white; border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; margin-bottom: 16px; }
  .card-header { padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .card-title { font-size: 14px; font-weight: 700; }
  .card-sub { font-size: 11px; color: var(--text-light); margin-top: 1px; }
  .card-body { padding: 16px 18px; }

  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 16px; }
  .stat-card { background: white; border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow); display: flex; align-items: center; gap: 14px; }
  .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .stat-icon.blue { background: #dbeafe; }
  .stat-icon.green { background: #d1fae5; }
  .stat-icon.yellow { background: #fef3c7; }
  .stat-icon.purple { background: #ede9fe; }
  .stat-value { font-size: 22px; font-weight: 700; }
  .stat-label { font-size: 11px; color: var(--text-light); }

  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 9px 14px; font-size: 11px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.4px; background: var(--bg); border-bottom: 1px solid var(--border); }
  td { padding: 11px 14px; border-bottom: 1px solid var(--border); font-size: 13px; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #f8faff; }

  .badge { display: inline-flex; align-items: center; padding: 2px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge.xuat-sac { background: #d1fae5; color: #065f46; }
  .badge.gioi { background: #dbeafe; color: #1e40af; }
  .badge.kha { background: #fef3c7; color: #92400e; }
  .badge.tb { background: #ffe4e6; color: #9f1239; }
  .badge.dat { background: #d1fae5; color: #065f46; }
  .badge.chua { background: #fee2e2; color: #991b1b; }

  /* TKB */
  .tkb-wrap { overflow-x: auto; }
  .tkb-table { min-width: 700px; width: 100%; border-collapse: collapse; }
  .tkb-table th { background: var(--primary); color: white; padding: 10px 8px; text-align: center; font-size: 12px; font-weight: 600; border: 1px solid rgba(255,255,255,0.2); }
  .tkb-table td { padding: 4px; border: 1px solid var(--border); vertical-align: top; background: white; min-height: 50px; font-size: 11px; text-align: center; color: var(--text-light); }
  .tkb-cell { background: linear-gradient(135deg, #dbeafe, #ede9fe); border-radius: 6px; padding: 6px 4px; color: var(--text-dark); }
  .tkb-cell.green { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
  .tkb-cell.orange { background: linear-gradient(135deg, #fef3c7, #fde68a); }
  .tkb-cell.red { background: linear-gradient(135deg, #ffe4e6, #fecdd3); }
  .tkb-subject { font-weight: 600; font-size: 11px; line-height: 1.3; }
  .tkb-room { font-size: 10px; color: var(--text-light); margin-top: 2px; }

  /* NOTIF */
  .notif-item { display: flex; gap: 12px; padding: 14px; background: white; border-radius: var(--radius); box-shadow: var(--shadow); margin-bottom: 10px; border-left: 3px solid transparent; cursor: pointer; transition: transform 0.15s; }
  .notif-item:hover { transform: translateX(3px); }
  .notif-item.unread { border-left-color: var(--primary); }
  .notif-icon { width: 38px; height: 38px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; background: var(--primary-light); }
  .notif-title { font-size: 13px; font-weight: 600; margin-bottom: 3px; }
  .notif-desc { font-size: 12px; color: var(--text-light); line-height: 1.5; }
  .notif-time { font-size: 11px; color: var(--text-light); margin-top: 4px; }

  /* PROFILE */
  .profile-header { background: linear-gradient(135deg, #2d3a6b, #2d4a9e); border-radius: var(--radius); padding: 24px; display: flex; align-items: center; gap: 20px; margin-bottom: 16px; color: white; }
  .profile-avatar { width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; border: 3px solid rgba(255,255,255,0.35); }
  .profile-name { font-size: 20px; font-weight: 700; }
  .profile-code { font-size: 13px; opacity: 0.75; margin-top: 3px; }
  .profile-tags { display: flex; gap: 7px; margin-top: 9px; flex-wrap: wrap; }
  .profile-tag { background: rgba(255,255,255,0.15); padding: 3px 10px; border-radius: 20px; font-size: 11px; }
  .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
  .info-label { font-size: 11px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 3px; }
  .info-value { font-size: 13px; font-weight: 500; }

  /* HOC PHI */
  .hocphi-header { display: flex; justify-content: space-between; align-items: center; background: #fff8f0; border: 1.5px solid #fed7aa; border-radius: var(--radius); padding: 16px 20px; margin-bottom: 16px; }
  .hocphi-amount { font-size: 24px; font-weight: 700; color: #c2410c; }
  .hocphi-label { font-size: 12px; color: var(--text-light); }
  .btn-pay { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
  .btn-pay:hover { background: var(--primary-dark); }

  /* DANG KY HOC PHAN */
  .dk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
  .dk-card { background: white; border: 1.5px solid var(--border); border-radius: var(--radius); padding: 14px; cursor: pointer; transition: all 0.18s; }
  .dk-card:hover { border-color: var(--primary); box-shadow: 0 4px 14px rgba(45,74,158,0.1); }
  .dk-card.selected { border-color: var(--primary); background: var(--primary-light); }
  .dk-code { font-size: 11px; font-weight: 700; color: var(--primary); background: var(--primary-light); padding: 2px 7px; border-radius: 4px; display: inline-block; margin-bottom: 7px; }
  .dk-name { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
  .dk-info { font-size: 11px; color: var(--text-light); display: flex; gap: 10px; }
  .dk-progress { height: 3px; background: var(--border); border-radius: 2px; margin-top: 9px; overflow: hidden; }
  .dk-progress-fill { height: 100%; background: var(--primary); border-radius: 2px; }

  /* CHUONG TRINH HOC */
  .ctdt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
  .ctdt-card { background: white; border-radius: var(--radius); padding: 14px; box-shadow: var(--shadow); }
  .ctdt-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .ctdt-code { font-size: 11px; color: var(--primary); font-weight: 700; }
  .ctdt-name { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
  .progress-bar { height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; }
</style>
</head>
<body>

<!-- LOGIN PAGE -->
<div id="loginPage" style="display:flex;width:100%;">
  <div class="login-page" style="width:100%;">
    <div class="login-box">
      <div class="login-logo">
        <div class="login-logo-icon">🎓</div>
        <h1>Portal Sinh Viên</h1>
        <p>Đại học Công nghệ Giao thông Vận tải - UTT</p>
      </div>
      <div class="form-group">
        <label class="form-label">Tên đăng nhập</label>
        <input class="form-input" id="u" type="text" placeholder="Mã sinh viên hoặc email" value="admin">
      </div>
      <div class="form-group">
        <label class="form-label">Mật khẩu</label>
        <input class="form-input" id="p" type="password" placeholder="Nhập mật khẩu" value="123456">
      </div>
      <button class="btn-login" onclick="doLogin()">Đăng nhập</button>
      <div class="login-hint">Tài khoản demo: <strong>admin</strong> / <strong>123456</strong></div>
    </div>
  </div>
</div>

<!-- APP -->
<div id="app">
  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">🎓</div>
      <div class="sidebar-logo-text">UTT Portal <small>Sinh viên</small></div>
    </div>

    <nav style="flex:1;padding:8px 0;">
      <div class="nav-item active" id="nav-trangchu" onclick="goPage('trangchu',this)">
        <span class="nav-icon">🏠</span><span class="nav-label">Trang chủ</span>
      </div>
      <div class="nav-item" id="nav-hethong" onclick="goPage('hethong',this)">
        <span class="nav-icon">⚡</span><span class="nav-label">Hệ thống một cửa</span>
      </div>
      <div class="nav-item" id="nav-tintuc" onclick="goPage('tintuc',this)">
        <span class="nav-icon">📰</span><span class="nav-label">Tin tức</span>
      </div>

      <!-- Profile -->
      <div class="nav-item" onclick="toggleSub('sub-profile',this)">
        <span class="nav-icon">👤</span><span class="nav-label">Profile</span><span class="nav-arrow">▶</span>
      </div>
      <div class="nav-sub" id="sub-profile">
        <div class="nav-item" id="nav-hoso" onclick="goPage('hoso',this)">
          <span class="nav-label">Tự nhập hồ sơ</span>
        </div>
      </div>

      <!-- Góc học tập -->
      <div class="nav-item" onclick="toggleSub('sub-hoctap',this)">
        <span class="nav-icon">📚</span><span class="nav-label">Góc học tập</span><span class="nav-arrow">▶</span>
      </div>
      <div class="nav-sub" id="sub-hoctap">
        <div class="nav-item" id="nav-diem" onclick="goPage('diem',this)">
          <span class="nav-label">Tra cứu điểm</span>
        </div>
        <div class="nav-item" id="nav-ctdt" onclick="goPage('ctdt',this)">
          <span class="nav-label">Chương trình học</span>
        </div>
        <div class="nav-item" id="nav-phuckhao" onclick="goPage('phuckhao',this)">
          <span class="nav-label">Đăng ký xin phúc khảo</span>
        </div>
        <div class="nav-item" id="nav-congnhandiem" onclick="goPage('congnhandiem',this)">
          <span class="nav-label">Công nhận điểm</span>
        </div>
        <div class="nav-item" id="nav-totnghiep" onclick="goPage('totnghiep',this)">
          <span class="nav-label">Xét tốt nghiệp</span>
        </div>
      </div>

      <!-- Đăng ký học -->
      <div class="nav-item" onclick="toggleSub('sub-dangky',this)">
        <span class="nav-icon">📝</span><span class="nav-label">Đăng ký học</span><span class="nav-arrow">▶</span>
      </div>
      <div class="nav-sub" id="sub-dangky">
        <div class="nav-item" id="nav-dkhp" onclick="goPage('dkhp',this)">
          <span class="nav-label">Đăng ký học phần</span>
        </div>
      </div>

      <!-- Thời khóa biểu -->
      <div class="nav-item" onclick="toggleSub('sub-tkb',this)">
        <span class="nav-icon">📅</span><span class="nav-label">Thời khóa biểu</span><span class="nav-arrow">▶</span>
      </div>
      <div class="nav-sub" id="sub-tkb">
        <div class="nav-item" id="nav-lichhoc" onclick="goPage('lichhoc',this)">
          <span class="nav-label">Lịch học</span>
        </div>
        <div class="nav-item" id="nav-lichthi" onclick="goPage('lichthi',this)">
          <span class="nav-label">Lịch thi</span>
        </div>
      </div>

      <!-- Tài chính -->
      <div class="nav-item" onclick="toggleSub('sub-taichinh',this)">
        <span class="nav-icon">💳</span><span class="nav-label">Tài chính</span><span class="nav-arrow">▶</span>
      </div>
      <div class="nav-sub" id="sub-taichinh">
        <div class="nav-item" id="nav-hocphi" onclick="goPage('hocphi',this)">
          <span class="nav-label">Học phí</span>
        </div>
        <div class="nav-item" id="nav-thanhtoan" onclick="goPage('thanhtoan',this)">
          <span class="nav-label">Thanh toán học phí online</span>
        </div>
      </div>

      <!-- Văn bản -->
      <div class="nav-item" onclick="toggleSub('sub-vanban',this)">
        <span class="nav-icon">📄</span><span class="nav-label">Văn bản</span><span class="nav-arrow">▶</span>
      </div>
      <div class="nav-sub" id="sub-vanban">
        <div class="nav-item" id="nav-vanban" onclick="goPage('vanban',this)">
          <span class="nav-label">Văn bản, quy định, biểu mẫu</span>
        </div>
      </div>
    </nav>

    <div class="sidebar-user">
      <div class="avatar">PMH</div>
      <div>
        <div class="user-name">Phạm Mạnh Hùng</div>
        <div class="user-id">2151060123</div>
      </div>
    </div>
  </aside>

  <!-- MAIN -->
  <div class="main">
    <div class="topbar">
      <span class="topbar-menu-btn">☰</span>
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="Tìm kiếm thông tin">
      </div>
      <div class="topbar-right">
        <div class="topbar-profile">
          <div class="avatar" style="width:28px;height:28px;font-size:11px;">PMH</div>
          <span class="topbar-profile-name">Phạm Mạnh Hùng</span>
          <span style="color:rgba(255,255,255,0.5);font-size:10px;">▼</span>
        </div>
        <button onclick="doLogout()" style="background:rgba(255,255,255,0.1);border:none;color:rgba(255,255,255,0.7);padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px;font-family:inherit;">Đăng xuất</button>
      </div>
    </div>

    <!-- TRANG CHU -->
    <div class="content active" id="page-trangchu">
      <div class="page-title">Xin chào, Phạm Mạnh Hùng! 👋</div>
      <div class="page-sub">Học kỳ 2 – Năm học 2025-2026</div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon blue">📚</div><div><div class="stat-value">6</div><div class="stat-label">Môn học kỳ này</div></div></div>
        <div class="stat-card"><div class="stat-icon green">⭐</div><div><div class="stat-value">3.42</div><div class="stat-label">GPA tích lũy (hệ 4)</div></div></div>
        <div class="stat-card"><div class="stat-icon yellow">🎯</div><div><div class="stat-value">112</div><div class="stat-label">Tín chỉ tích lũy</div></div></div>
        <div class="stat-card"><div class="stat-icon purple">📋</div><div><div class="stat-value">8</div><div class="stat-label">Thông báo chưa đọc</div></div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="card">
          <div class="card-header"><div><div class="card-title">📅 Lịch học hôm nay</div><div class="card-sub">Thứ Hai, 23/03/2026</div></div></div>
          <table>
            <tr><th>Tiết</th><th>Môn học</th><th>Phòng</th><th>GV</th></tr>
            <tr><td>1–3</td><td>Lập trình Web</td><td>A301</td><td>TS. Nguyễn A</td></tr>
            <tr><td>4–6</td><td>Cơ sở dữ liệu</td><td>B204</td><td>TS. Trần B</td></tr>
            <tr><td>7–9</td><td>Mạng máy tính</td><td>C101</td><td>ThS. Lê C</td></tr>
          </table>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">🔔 Thông báo mới</div></div>
          <div style="padding:12px;">
            <div class="notif-item unread"><div class="notif-icon">📢</div><div><div class="notif-title">Lịch thi học kỳ 2 đã công bố</div><div class="notif-time">23/03/2026</div></div></div>
            <div class="notif-item unread"><div class="notif-icon">💰</div><div><div class="notif-title">Nhắc nhở nộp học phí HK2</div><div class="notif-time">20/03/2026</div></div></div>
            <div class="notif-item"><div class="notif-icon">📝</div><div><div class="notif-title">Mở đăng ký học phần HK3</div><div class="notif-time">15/03/2026</div></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- TRA CUU DIEM -->
    <div class="content" id="page-diem">
      <div class="page-title">Tra cứu điểm</div>
      <div class="page-sub">Kết quả học tập – Học kỳ 2, Năm học 2025-2026</div>
      <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);">
        <div class="stat-card"><div class="stat-icon green">📊</div><div><div class="stat-value">7.85</div><div class="stat-label">Điểm TB học kỳ</div></div></div>
        <div class="stat-card"><div class="stat-icon blue">⭐</div><div><div class="stat-value">3.42</div><div class="stat-label">GPA tích lũy</div></div></div>
        <div class="stat-card"><div class="stat-icon yellow">📚</div><div><div class="stat-value">18</div><div class="stat-label">Tín chỉ học kỳ</div></div></div>
        <div class="stat-card"><div class="stat-icon purple">🏅</div><div><div class="stat-value">Giỏi</div><div class="stat-label">Xếp loại</div></div></div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Bảng điểm học kỳ 2 – 2025-2026</div></div>
        <table>
          <tr><th>Mã môn</th><th>Tên môn học</th><th>TC</th><th>GK</th><th>CK</th><th>TK</th><th>Xếp loại</th></tr>
          <tr><td>IT3010</td><td>Lập trình Web</td><td>3</td><td>8.5</td><td>9.0</td><td>8.8</td><td><span class="badge xuat-sac">Xuất sắc</span></td></tr>
          <tr><td>IT3020</td><td>Cơ sở dữ liệu</td><td>3</td><td>7.5</td><td>8.0</td><td>7.8</td><td><span class="badge gioi">Giỏi</span></td></tr>
          <tr><td>IT3030</td><td>Mạng máy tính</td><td>3</td><td>7.0</td><td>7.5</td><td>7.3</td><td><span class="badge kha">Khá</span></td></tr>
          <tr><td>IT3040</td><td>Trí tuệ nhân tạo</td><td>3</td><td>8.0</td><td>8.5</td><td>8.3</td><td><span class="badge gioi">Giỏi</span></td></tr>
          <tr><td>MA2010</td><td>Toán cao cấp A3</td><td>3</td><td>6.5</td><td>7.0</td><td>6.8</td><td><span class="badge kha">Khá</span></td></tr>
          <tr><td>EN2020</td><td>Tiếng Anh chuyên ngành</td><td>3</td><td>8.0</td><td>7.5</td><td>7.7</td><td><span class="badge gioi">Giỏi</span></td></tr>
        </table>
      </div>
    </div>

    <!-- LICH HOC -->
    <div class="content" id="page-lichhoc">
      <div class="page-title">Thời khóa biểu</div>
      <div class="page-sub">Học kỳ 2 – Năm học 2025-2026</div>
      <div class="card">
        <div class="card-header"><div class="card-title">Lịch học tuần 23/03 – 29/03/2026</div></div>
        <div class="card-body">
          <div class="tkb-wrap">
            <table class="tkb-table">
              <tr>
                <th>Tiết</th><th>Thứ 2</th><th>Thứ 3</th><th>Thứ 4</th><th>Thứ 5</th><th>Thứ 6</th><th>Thứ 7</th>
              </tr>
              <tr>
                <td>1–3<br><small>7h–9h30</small></td>
                <td><div class="tkb-cell"><div class="tkb-subject">Lập trình Web</div><div class="tkb-room">P.A301 – TS.Nguyễn</div></div></td>
                <td></td>
                <td><div class="tkb-cell green"><div class="tkb-subject">Toán cao cấp</div><div class="tkb-room">P.B102 – TS.Minh</div></div></td>
                <td></td>
                <td><div class="tkb-cell orange"><div class="tkb-subject">Tiếng Anh CN</div><div class="tkb-room">P.C201 – ThS.Lan</div></div></td>
                <td></td>
              </tr>
              <tr>
                <td>4–6<br><small>9h45–12h15</small></td>
                <td><div class="tkb-cell orange"><div class="tkb-subject">Cơ sở dữ liệu</div><div class="tkb-room">P.B204 – TS.Trần</div></div></td>
                <td><div class="tkb-cell"><div class="tkb-subject">Mạng máy tính</div><div class="tkb-room">P.C101 – ThS.Lê</div></div></td>
                <td></td>
                <td><div class="tkb-cell green"><div class="tkb-subject">Lập trình Web</div><div class="tkb-room">P.A301 – TS.Nguyễn</div></div></td>
                <td></td>
                <td><div class="tkb-cell"><div class="tkb-subject">TTNT</div><div class="tkb-room">P.D305 – TS.Hùng</div></div></td>
              </tr>
              <tr>
                <td>7–9<br><small>13h–15h30</small></td>
                <td></td>
                <td><div class="tkb-cell red"><div class="tkb-subject">Trí tuệ nhân tạo</div><div class="tkb-room">P.D305 – TS.Hùng</div></div></td>
                <td><div class="tkb-cell"><div class="tkb-subject">Cơ sở dữ liệu</div><div class="tkb-room">P.B204 – TS.Trần</div></div></td>
                <td></td>
                <td><div class="tkb-cell green"><div class="tkb-subject">Mạng máy tính</div><div class="tkb-room">P.C101 – ThS.Lê</div></div></td>
                <td></td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- LICH THI -->
    <div class="content" id="page-lichthi">
      <div class="page-title">Lịch thi</div>
      <div class="page-sub">Học kỳ 2 – Năm học 2025-2026</div>
      <div class="card">
        <div class="card-header"><div class="card-title">Lịch thi cuối kỳ</div></div>
        <table>
          <tr><th>Môn học</th><th>Ngày thi</th><th>Giờ thi</th><th>Phòng</th><th>Hình thức</th><th>Trạng thái</th></tr>
          <tr><td>Lập trình Web</td><td>15/05/2026</td><td>7:30–9:30</td><td>A301</td><td>Máy tính</td><td><span class="badge dat">Chưa thi</span></td></tr>
          <tr><td>Cơ sở dữ liệu</td><td>17/05/2026</td><td>7:30–9:30</td><td>B204</td><td>Tự luận</td><td><span class="badge dat">Chưa thi</span></td></tr>
          <tr><td>Mạng máy tính</td><td>19/05/2026</td><td>13:00–15:00</td><td>C101</td><td>Trắc nghiệm</td><td><span class="badge dat">Chưa thi</span></td></tr>
          <tr><td>Trí tuệ nhân tạo</td><td>21/05/2026</td><td>7:30–9:30</td><td>D305</td><td>Tự luận</td><td><span class="badge dat">Chưa thi</span></td></tr>
          <tr><td>Toán cao cấp A3</td><td>23/05/2026</td><td>13:00–15:00</td><td>B102</td><td>Tự luận</td><td><span class="badge dat">Chưa thi</span></td></tr>
          <tr><td>Tiếng Anh CN</td><td>25/05/2026</td><td>7:30–9:30</td><td>C201</td><td>Tự luận</td><td><span class="badge dat">Chưa thi</span></td></tr>
        </table>
      </div>
    </div>

    <!-- HOC PHI -->
    <div class="content" id="page-hocphi">
      <div class="page-title">Học phí</div>
      <div class="page-sub">Học kỳ 2 – Năm học 2025-2026</div>
      <div class="hocphi-header">
        <div><div class="hocphi-label">Số tiền cần nộp</div><div class="hocphi-amount">8.100.000 đ</div></div>
        <div style="text-align:right;"><div class="hocphi-label">Hạn nộp</div><div style="font-size:15px;font-weight:600;color:#c2410c;">31/03/2026</div></div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Chi tiết học phí</div></div>
        <table>
          <tr><th>Môn học</th><th>Số tín chỉ</th><th>Đơn giá/TC</th><th>Thành tiền</th><th>Trạng thái</th></tr>
          <tr><td>Lập trình Web</td><td>3</td><td>450.000đ</td><td>1.350.000đ</td><td><span class="badge chua">Chưa nộp</span></td></tr>
          <tr><td>Cơ sở dữ liệu</td><td>3</td><td>450.000đ</td><td>1.350.000đ</td><td><span class="badge chua">Chưa nộp</span></td></tr>
          <tr><td>Mạng máy tính</td><td>3</td><td>450.000đ</td><td>1.350.000đ</td><td><span class="badge chua">Chưa nộp</span></td></tr>
          <tr><td>Trí tuệ nhân tạo</td><td>3</td><td>450.000đ</td><td>1.350.000đ</td><td><span class="badge chua">Chưa nộp</span></td></tr>
          <tr><td>Toán cao cấp A3</td><td>3</td><td>450.000đ</td><td>1.350.000đ</td><td><span class="badge chua">Chưa nộp</span></td></tr>
          <tr><td>Tiếng Anh CN</td><td>3</td><td>450.000đ</td><td>1.350.000đ</td><td><span class="badge chua">Chưa nộp</span></td></tr>
        </table>
      </div>
    </div>

    <!-- THANH TOAN -->
    <div class="content" id="page-thanhtoan">
      <div class="page-title">Thanh toán học phí online</div>
      <div class="page-sub">Chọn phương thức thanh toán</div>
      <div class="card" style="max-width:500px;">
        <div class="card-header"><div class="card-title">Thông tin thanh toán</div></div>
        <div class="card-body">
          <div style="background:var(--bg);border-radius:8px;padding:14px;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="color:var(--text-light);font-size:12px;">Mã sinh viên</span><strong>2151060123</strong></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="color:var(--text-light);font-size:12px;">Họ tên</span><strong>Phạm Mạnh Hùng</strong></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-light);font-size:12px;">Số tiền</span><strong style="color:#c2410c;font-size:16px;">8.100.000 đ</strong></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
            <div style="border:2px solid var(--primary);border-radius:8px;padding:14px;text-align:center;cursor:pointer;background:var(--primary-light);">
              <div style="font-size:24px;margin-bottom:6px;">🏦</div>
              <div style="font-size:12px;font-weight:600;">Chuyển khoản ngân hàng</div>
            </div>
            <div style="border:2px solid var(--border);border-radius:8px;padding:14px;text-align:center;cursor:pointer;">
              <div style="font-size:24px;margin-bottom:6px;">📱</div>
              <div style="font-size:12px;font-weight:600;">Ví điện tử MoMo</div>
            </div>
          </div>
          <button class="btn-pay" style="width:100%;" onclick="alert('Đang chuyển đến trang thanh toán...')">Tiến hành thanh toán</button>
        </div>
      </div>
    </div>

    <!-- DANG KY HOC PHAN -->
    <div class="content" id="page-dkhp">
      <div class="page-title">Đăng ký học phần</div>
      <div class="page-sub">Học kỳ 3 – Năm học 2025-2026 | Thời gian: 25/03 – 05/04/2026</div>
      <div style="background:#fffbeb;border:1.5px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#92400e;">
        ⚠️ Bạn đã đăng ký <strong>0/30</strong> tín chỉ. Tối đa 30 tín chỉ/học kỳ.
      </div>
      <div class="dk-grid">
        <div class="dk-card" onclick="this.classList.toggle('selected')">
          <div class="dk-code">IT4010</div>
          <div class="dk-name">Phát triển ứng dụng Web</div>
          <div class="dk-info"><span>3 tín chỉ</span><span>TS. Nguyễn A</span></div>
          <div class="dk-progress"><div class="dk-progress-fill" style="width:70%"></div></div>
          <div style="font-size:10px;color:var(--text-light);margin-top:4px;">35/50 sinh viên</div>
        </div>
        <div class="dk-card" onclick="this.classList.toggle('selected')">
          <div class="dk-code">IT4020</div>
          <div class="dk-name">Lập trình di động</div>
          <div class="dk-info"><span>3 tín chỉ</span><span>TS. Trần B</span></div>
          <div class="dk-progress"><div class="dk-progress-fill" style="width:45%"></div></div>
          <div style="font-size:10px;color:var(--text-light);margin-top:4px;">22/50 sinh viên</div>
        </div>
        <div class="dk-card" onclick="this.classList.toggle('selected')">
          <div class="dk-code">IT4030</div>
          <div class="dk-name">An toàn thông tin</div>
          <div class="dk-info"><span>3 tín chỉ</span><span>ThS. Lê C</span></div>
          <div class="dk-progress"><div class="dk-progress-fill" style="width:90%"></div></div>
          <div style="font-size:10px;color:#c2410c;margin-top:4px;">45/50 sinh viên – Sắp đầy!</div>
        </div>
        <div class="dk-card" onclick="this.classList.toggle('selected')">
          <div class="dk-code">IT4040</div>
          <div class="dk-name">Điện toán đám mây</div>
          <div class="dk-info"><span>3 tín chỉ</span><span>TS. Phạm D</span></div>
          <div class="dk-progress"><div class="dk-progress-fill" style="width:30%"></div></div>
          <div style="font-size:10px;color:var(--text-light);margin-top:4px;">15/50 sinh viên</div>
        </div>
        <div class="dk-card" onclick="this.classList.toggle('selected')">
          <div class="dk-code">IT4050</div>
          <div class="dk-name">Học máy ứng dụng</div>
          <div class="dk-info"><span>3 tín chỉ</span><span>TS. Hoàng E</span></div>
          <div class="dk-progress"><div class="dk-progress-fill" style="width:55%"></div></div>
          <div style="font-size:10px;color:var(--text-light);margin-top:4px;">28/50 sinh viên</div>
        </div>
        <div class="dk-card" onclick="this.classList.toggle('selected')">
          <div class="dk-code">MA3010</div>
          <div class="dk-name">Thống kê xác suất</div>
          <div class="dk-info"><span>3 tín chỉ</span><span>TS. Vũ F</span></div>
          <div class="dk-progress"><div class="dk-progress-fill" style="width:20%"></div></div>
          <div style="font-size:10px;color:var(--text-light);margin-top:4px;">10/50 sinh viên</div>
        </div>
      </div>
      <div style="margin-top:16px;"><button class="btn-pay" onclick="alert('Đăng ký thành công!')">Xác nhận đăng ký</button></div>
    </div>

    <!-- HO SO -->
    <div class="content" id="page-hoso">
      <div class="page-title">Hồ sơ sinh viên</div>
      <div class="page-sub">Thông tin cá nhân</div>
      <div class="profile-header">
        <div class="profile-avatar">PMH</div>
        <div>
          <div class="profile-name">Phạm Mạnh Hùng</div>
          <div class="profile-code">MSSV: 2151060123</div>
          <div class="profile-tags">
            <span class="profile-tag">CNTT K21</span>
            <span class="profile-tag">Đại học chính quy</span>
            <span class="profile-tag">Đang học</span>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Thông tin cá nhân</div></div>
        <div class="card-body">
          <div class="info-grid">
            <div><div class="info-label">Họ và tên</div><div class="info-value">Phạm Mạnh Hùng</div></div>
            <div><div class="info-label">Ngày sinh</div><div class="info-value">15/06/2003</div></div>
            <div><div class="info-label">Giới tính</div><div class="info-value">Nam</div></div>
            <div><div class="info-label">CCCD/CMT</div><div class="info-value">001203012345</div></div>
            <div><div class="info-label">Email</div><div class="info-value">hung.pm@utt.edu.vn</div></div>
            <div><div class="info-label">Điện thoại</div><div class="info-value">0987 654 321</div></div>
            <div><div class="info-label">Lớp</div><div class="info-value">CNTT K21A</div></div>
            <div><div class="info-label">Khoa</div><div class="info-value">Công nghệ Thông tin</div></div>
            <div><div class="info-label">Chuyên ngành</div><div class="info-value">Công nghệ phần mềm</div></div>
            <div><div class="info-label">Năm vào học</div><div class="info-value">2021</div></div>
            <div><div class="info-label">GVCN</div><div class="info-value">TS. Nguyễn Văn An</div></div>
            <div><div class="info-label">Trạng thái</div><div class="info-value"><span class="badge dat">Đang học</span></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- CHUONG TRINH HOC -->
    <div class="content" id="page-ctdt">
      <div class="page-title">Chương trình học</div>
      <div class="page-sub">Ngành Công nghệ Thông tin – 130 tín chỉ</div>
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);">
        <div class="stat-card"><div class="stat-icon green">✅</div><div><div class="stat-value">112</div><div class="stat-label">TC đã hoàn thành</div></div></div>
        <div class="stat-card"><div class="stat-icon yellow">📚</div><div><div class="stat-value">18</div><div class="stat-label">TC đang học</div></div></div>
        <div class="stat-card"><div class="stat-icon purple">🎯</div><div><div class="stat-value">130</div><div class="stat-label">Tổng TC yêu cầu</div></div></div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Tiến độ theo khối kiến thức</div></div>
        <div class="card-body">
          <div style="margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:13px;font-weight:600;">Kiến thức đại cương</span><span style="font-size:12px;color:var(--text-light);">30/30 TC</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width:100%;background:#38a169;"></div></div>
          </div>
          <div style="margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:13px;font-weight:600;">Kiến thức cơ sở ngành</span><span style="font-size:12px;color:var(--text-light);">45/45 TC</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width:100%;background:#38a169;"></div></div>
          </div>
          <div style="margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:13px;font-weight:600;">Kiến thức chuyên ngành</span><span style="font-size:12px;color:var(--text-light);">37/40 TC</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width:92%;background:#2d4a9e;"></div></div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:13px;font-weight:600;">Đồ án / Thực tập / Tốt nghiệp</span><span style="font-size:12px;color:var(--text-light);">0/15 TC</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width:0%;background:#d69e2e;"></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- THONG BAO -->
    <div class="content" id="page-thongbao">
      <div class="page-title">Thông báo</div>
      <div class="page-sub">8 thông báo chưa đọc</div>
      <div class="notif-item unread"><div class="notif-icon">📢</div><div class="notif-content"><div class="notif-title">Lịch thi học kỳ 2 đã được công bố</div><div class="notif-desc">Phòng Đào tạo thông báo lịch thi cuối kỳ học kỳ 2 năm học 2025-2026. Sinh viên xem chi tiết trong mục Lịch thi.</div><div class="notif-time">23/03/2026 – 08:30</div></div></div>
      <div class="notif-item unread"><div class="notif-icon" style="background:#fef3c7;">💰</div><div class="notif-content"><div class="notif-title">Nhắc nhở nộp học phí học kỳ 2</div><div class="notif-desc">Hạn nộp học phí học kỳ 2 năm học 2025-2026 là ngày 31/03/2026. Sinh viên chưa nộp học phí sẽ bị khóa tài khoản.</div><div class="notif-time">20/03/2026 – 14:00</div></div></div>
      <div class="notif-item unread"><div class="notif-icon" style="background:#d1fae5;">📝</div><div class="notif-content"><div class="notif-title">Mở đăng ký học phần học kỳ 3</div><div class="notif-desc">Thời gian đăng ký học phần học kỳ 3 từ ngày 25/03/2026 đến 05/04/2026.</div><div class="notif-time">15/03/2026 – 09:00</div></div></div>
      <div class="notif-item"><div class="notif-icon">🎓</div><div class="notif-content"><div class="notif-title">Thông báo xét tốt nghiệp đợt tháng 6/2026</div><div class="notif-desc">Sinh viên đủ điều kiện xét tốt nghiệp đăng ký trước ngày 30/04/2026.</div><div class="notif-time">10/03/2026</div></div></div>
    </div>

    <!-- PHUC KHAO -->
    <div class="content" id="page-phuckhao">
      <div class="page-title">Đăng ký xin phúc khảo</div>
      <div class="page-sub">Học kỳ 2 – Năm học 2025-2026</div>
      <div class="card" style="max-width:500px;">
        <div class="card-header"><div class="card-title">Form đăng ký phúc khảo</div></div>
        <div class="card-body">
          <div class="form-group"><label class="form-label">Môn học</label>
            <select class="form-input"><option>-- Chọn môn học --</option><option>Lập trình Web</option><option>Cơ sở dữ liệu</option><option>Mạng máy tính</option></select>
          </div>
          <div class="form-group"><label class="form-label">Lý do phúc khảo</label>
            <textarea class="form-input" rows="3" placeholder="Nhập lý do..."></textarea>
          </div>
          <button class="btn-pay" onclick="alert('Đã gửi yêu cầu phúc khảo!')">Gửi đơn phúc khảo</button>
        </div>
      </div>
    </div>

    <!-- CONG NHAN DIEM -->
    <div class="content" id="page-congnhandiem">
      <div class="page-title">Công nhận điểm</div>
      <div class="page-sub">Đăng ký công nhận điểm từ các chứng chỉ, chuyển điểm</div>
      <div class="card" style="max-width:500px;">
        <div class="card-header"><div class="card-title">Đăng ký công nhận điểm</div></div>
        <div class="card-body">
          <div class="form-group"><label class="form-label">Loại công nhận</label>
            <select class="form-input"><option>Chứng chỉ tiếng Anh</option><option>Chứng chỉ tin học</option><option>Chuyển điểm từ trường khác</option></select>
          </div>
          <div class="form-group"><label class="form-label">Tên chứng chỉ / Môn học</label>
            <input class="form-input" type="text" placeholder="VD: IELTS 6.5, Chứng chỉ IC3...">
          </div>
          <button class="btn-pay" onclick="alert('Đã gửi yêu cầu!')">Gửi yêu cầu</button>
        </div>
      </div>
    </div>

    <!-- XET TOT NGHIEP -->
    <div class="content" id="page-totnghiep">
      <div class="page-title">Xét tốt nghiệp</div>
      <div class="page-sub">Điều kiện và đăng ký xét tốt nghiệp</div>
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);">
        <div class="stat-card"><div class="stat-icon green">✅</div><div><div class="stat-value">112/130</div><div class="stat-label">Tín chỉ tích lũy</div></div></div>
        <div class="stat-card"><div class="stat-icon blue">⭐</div><div><div class="stat-value">3.42</div><div class="stat-label">GPA tích lũy</div></div></div>
        <div class="stat-card"><div class="stat-icon yellow">⚠️</div><div><div class="stat-value">Chưa đủ</div><div class="stat-label">Điều kiện TN</div></div></div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Điều kiện xét tốt nghiệp</div></div>
        <table>
          <tr><th>Điều kiện</th><th>Yêu cầu</th><th>Hiện tại</th><th>Trạng thái</th></tr>
          <tr><td>Tín chỉ tích lũy</td><td>130 TC</td><td>112 TC</td><td><span class="badge chua">Chưa đủ</span></td></tr>
          <tr><td>GPA tích lũy</td><td>≥ 2.0</td><td>3.42</td><td><span class="badge dat">Đạt</span></td></tr>
          <tr><td>Chứng chỉ tiếng Anh</td><td>B1 trở lên</td><td>IELTS 6.0</td><td><span class="badge dat">Đạt</span></td></tr>
          <tr><td>Nợ học phí</td><td>Không nợ</td><td>Còn nợ HK2</td><td><span class="badge chua">Chưa đạt</span></td></tr>
        </table>
      </div>
    </div>

    <!-- VAN BAN -->
    <div class="content" id="page-vanban">
      <div class="page-title">Văn bản, quy định, biểu mẫu</div>
      <div class="page-sub">Tài liệu quan trọng dành cho sinh viên</div>
      <div class="card">
        <div class="card-header"><div class="card-title">Danh sách văn bản</div></div>
        <table>
          <tr><th>Tên văn bản</th><th>Loại</th><th>Ngày ban hành</th><th>Tải về</th></tr>
          <tr><td>Quy chế học vụ 2024</td><td>Quy định</td><td>01/09/2024</td><td><button class="btn-pay" style="padding:4px 12px;font-size:12px;" onclick="alert('Đang tải...')">📥 Tải</button></td></tr>
          <tr><td>Đơn xin nghỉ học</td><td>Biểu mẫu</td><td>01/01/2024</td><td><button class="btn-pay" style="padding:4px 12px;font-size:12px;" onclick="alert('Đang tải...')">📥 Tải</button></td></tr>
          <tr><td>Đơn xin bảo lưu</td><td>Biểu mẫu</td><td>01/01/2024</td><td><button class="btn-pay" style="padding:4px 12px;font-size:12px;" onclick="alert('Đang tải...')">📥 Tải</button></td></tr>
          <tr><td>Quy định về học phí</td><td>Quy định</td><td>15/08/2024</td><td><button class="btn-pay" style="padding:4px 12px;font-size:12px;" onclick="alert('Đang tải...')">📥 Tải</button></td></tr>
          <tr><td>Đơn xin phúc khảo</td><td>Biểu mẫu</td><td>01/01/2024</td><td><button class="btn-pay" style="padding:4px 12px;font-size:12px;" onclick="alert('Đang tải...')">📥 Tải</button></td></tr>
        </table>
      </div>
    </div>

    <!-- HE THONG MOT CUA -->
    <div class="content" id="page-hethong">
      <div class="page-title">Hệ thống một cửa</div>
      <div class="page-sub">Các dịch vụ hành chính trực tuyến</div>
      <div class="dk-grid">
        <div class="dk-card"><div style="font-size:28px;margin-bottom:8px;">📋</div><div class="dk-name">Xác nhận sinh viên</div><div class="dk-info">Cấp giấy xác nhận đang học</div></div>
        <div class="dk-card"><div style="font-size:28px;margin-bottom:8px;">🎓</div><div class="dk-name">Bảng điểm chính thức</div><div class="dk-info">In bảng điểm có dấu mộc</div></div>
        <div class="dk-card"><div style="font-size:28px;margin-bottom:8px;">📝</div><div class="dk-name">Đơn xin chuyển lớp</div><div class="dk-info">Nộp đơn chuyển lớp học</div></div>
        <div class="dk-card"><div style="font-size:28px;margin-bottom:8px;">🏠</div><div class="dk-name">Ký túc xá</div><div class="dk-info">Đăng ký phòng ở KTX</div></div>
      </div>
    </div>

    <!-- TIN TUC -->
    <div class="content" id="page-tintuc">
      <div class="page-title">Tin tức</div>
      <div class="page-sub">Tin tức mới nhất từ nhà trường</div>
      <div style="display:grid;gap:14px;">
        <div class="card" style="cursor:pointer;" onclick="alert('Đọc tin tức...')">
          <div class="card-body" style="display:flex;gap:16px;align-items:flex-start;">
            <div style="width:80px;height:60px;background:linear-gradient(135deg,#dbeafe,#ede9fe);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0;">🏆</div>
            <div><div style="font-size:14px;font-weight:600;margin-bottom:4px;">UTT đạt giải nhất cuộc thi lập trình toàn quốc 2026</div><div style="font-size:12px;color:var(--text-light);line-height:1.6;">Đội tuyển sinh viên khoa CNTT đã xuất sắc giành giải nhất tại cuộc thi lập trình quốc gia năm 2026...</div><div style="font-size:11px;color:var(--text-light);margin-top:6px;">20/03/2026</div></div>
          </div>
        </div>
        <div class="card" style="cursor:pointer;" onclick="alert('Đọc tin tức...')">
          <div class="card-body" style="display:flex;gap:16px;align-items:flex-start;">
            <div style="width:80px;height:60px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0;">🤝</div>
            <div><div style="font-size:14px;font-weight:600;margin-bottom:4px;">UTT ký kết hợp tác với tập đoàn công nghệ hàng đầu</div><div style="font-size:12px;color:var(--text-light);line-height:1.6;">Nhà trường vừa ký kết biên bản ghi nhớ hợp tác với tập đoàn FPT và Viettel về đào tạo và tuyển dụng...</div><div style="font-size:11px;color:var(--text-light);margin-top:6px;">15/03/2026</div></div>
          </div>
        </div>
      </div>
    </div>

  </div><!-- end main -->
</div><!-- end app -->

<script>
function doLogin() {
  const u = document.getElementById('u').value;
  const p = document.getElementById('p').value;
  if (u && p) {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
  } else {
    alert('Vui lòng nhập tài khoản và mật khẩu!');
  }
}

function doLogout() {
  document.getElementById('app').style.display = 'none';
  document.getElementById('loginPage').style.display = 'flex';
}

let currentNavItem = document.getElementById('nav-trangchu');

function goPage(id, el) {
  // Ẩn tất cả content
  document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');

  // Xóa active nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
}

function toggleSub(id, el) {
  const sub = document.getElementById(id);
  const isOpen = sub.classList.contains('open');
  // Đóng tất cả sub
  document.querySelectorAll('.nav-sub').forEach(s => s.classList.remove('open'));
  document.querySelectorAll('.nav-item.open').forEach(n => n.classList.remove('open'));
  if (!isOpen) {
    sub.classList.add('open');
    el.classList.add('open');
  }
}
</script>
</body>
</html>
