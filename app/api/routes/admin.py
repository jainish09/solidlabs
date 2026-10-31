"""Admin Dashboard Route for SolidLabs AI Manufacturing Backend.

Provides a rich, interactive, single-page web dashboard for inspecting CAD uploads,
geometry metrics, DFM checks, indicative quotes, and managing manufacturing orders.
"""

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter()

ADMIN_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SolidLabs — AI Manufacturing Admin Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #080C14;
      --bg-card: rgba(17, 24, 39, 0.85);
      --bg-card-hover: rgba(26, 36, 56, 0.95);
      --bg-input: #0F172A;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-focus: #00F0FF;
      --primary: #00F0FF;
      --primary-glow: rgba(0, 240, 255, 0.25);
      --primary-dark: #00B4D8;
      --accent-blue: #3B82F6;
      --accent-purple: #8B5CF6;
      --success: #10B981;
      --success-glow: rgba(16, 185, 129, 0.2);
      --warning: #F59E0B;
      --warning-glow: rgba(245, 158, 11, 0.2);
      --danger: #EF4444;
      --danger-glow: rgba(239, 68, 68, 0.2);
      --text-main: #F3F4F6;
      --text-muted: #9CA3AF;
      --text-dim: #64748B;
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 18px;
      --shadow-card: 0 10px 30px -10px rgba(0, 0, 0, 0.6);
      --transition-fast: 0.18s ease;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: radial-gradient(circle at 10% 10%, #0d1527 0%, #080C14 70%);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }

    /* Top Navigation */
    header {
      background: rgba(11, 17, 32, 0.85);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid var(--border-subtle);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 0.85rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      text-decoration: none;
      color: inherit;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent-blue) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px var(--primary-glow);
    }

    .brand-icon svg { width: 20px; height: 20px; fill: #080C14; }
    .brand-title { font-weight: 800; font-size: 1.25rem; letter-spacing: -0.02em; }
    .brand-badge {
      font-size: 0.68rem;
      text-transform: uppercase;
      font-weight: 700;
      background: rgba(0, 240, 255, 0.12);
      color: var(--primary);
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      border: 1px solid rgba(0, 240, 255, 0.25);
    }

    .nav-tabs {
      display: flex;
      gap: 0.4rem;
      background: rgba(15, 23, 42, 0.6);
      padding: 0.3rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }

    .nav-tab {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all var(--transition-fast);
    }

    .nav-tab:hover { color: var(--text-main); background: rgba(255, 255, 255, 0.04); }
    .nav-tab.active {
      color: #080C14;
      background: var(--primary);
      box-shadow: 0 2px 12px var(--primary-glow);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .health-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.78rem;
      font-weight: 600;
      background: rgba(16, 185, 129, 0.12);
      color: var(--success);
      padding: 0.35rem 0.8rem;
      border-radius: 999px;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .health-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 8px var(--success);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.9); }
    }

    /* Main Container */
    main {
      flex: 1;
      padding: 2rem;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }

    .tab-content { display: none; }
    .tab-content.active { display: block; animation: fadeIn 0.25s ease; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Common Card Styles */
    .card {
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-card);
      margin-bottom: 1.5rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .card-title svg { width: 20px; height: 20px; stroke: var(--primary); }
    .card-subtitle { font-size: 0.82rem; color: var(--text-muted); margin-top: 0.25rem; }

    /* Overview Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.75rem;
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform var(--transition-fast), border-color var(--transition-fast);
    }

    .stat-card:hover {
      transform: translateY(-2px);
      border-color: rgba(0, 240, 255, 0.3);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon svg { width: 24px; height: 24px; }
    .stat-val { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.02em; }
    .stat-label { font-size: 0.78rem; text-transform: uppercase; font-weight: 600; color: var(--text-muted); }

    /* Forms & Controls */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.25rem;
    }

    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
    .form-control {
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      color: var(--text-main);
      padding: 0.65rem 0.9rem;
      font-family: inherit;
      font-size: 0.88rem;
      transition: border-color var(--transition-fast);
      outline: none;
    }

    .form-control:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
    select.form-control { cursor: pointer; }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all var(--transition-fast);
    }

    .btn-primary {
      background: var(--primary);
      color: #080C14;
      box-shadow: 0 2px 10px var(--primary-glow);
    }

    .btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-main);
      border: 1px solid var(--border-subtle);
    }

    .btn-secondary:hover { background: rgba(255, 255, 255, 0.12); }
    .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.78rem; border-radius: 6px; }

    /* File Drop Area */
    .drop-zone {
      border: 2px dashed rgba(0, 240, 255, 0.3);
      border-radius: var(--radius-md);
      padding: 2.5rem 1.5rem;
      text-align: center;
      background: rgba(15, 23, 42, 0.4);
      cursor: pointer;
      transition: all var(--transition-fast);
      margin-bottom: 1.25rem;
    }

    .drop-zone:hover, .drop-zone.dragover {
      border-color: var(--primary);
      background: rgba(0, 240, 255, 0.05);
    }

    .drop-zone svg { width: 44px; height: 44px; stroke: var(--primary); margin-bottom: 0.75rem; }
    .drop-zone-text { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.25rem; }
    .drop-zone-hint { font-size: 0.78rem; color: var(--text-dim); }

    /* Tables */
    .table-container {
      overflow-x: auto;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.85rem;
    }

    th {
      background: rgba(15, 23, 42, 0.8);
      padding: 0.85rem 1rem;
      font-weight: 600;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border-subtle);
      text-transform: uppercase;
      font-size: 0.72rem;
      letter-spacing: 0.04em;
    }

    td {
      padding: 0.9rem 1rem;
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-main);
    }

    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255, 255, 255, 0.02); }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .badge-info { background: rgba(59, 130, 246, 0.15); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.3); }
    .badge-success { background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-warning { background: rgba(245, 158, 11, 0.15); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge-danger { background: rgba(239, 68, 68, 0.15); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.3); }

    /* Monospace tags */
    .mono { font-family: 'JetBrains Mono', monospace; }

    /* DFM Findings Accordion / List */
    .finding-card {
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.1rem;
      margin-bottom: 0.85rem;
      background: rgba(15, 23, 42, 0.4);
      transition: border-color var(--transition-fast);
    }

    .finding-card.severity-critical { border-left: 4px solid var(--danger); }
    .finding-card.severity-warning { border-left: 4px solid var(--warning); }
    .finding-card.severity-info { border-left: 4px solid var(--accent-blue); }

    .finding-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .finding-title { font-weight: 700; font-size: 0.92rem; display: flex; align-items: center; gap: 0.5rem; }
    .finding-desc { font-size: 0.82rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 0.5rem; }
    .finding-action {
      font-size: 0.78rem;
      background: rgba(0, 0, 0, 0.3);
      padding: 0.45rem 0.75rem;
      border-radius: var(--radius-sm);
      color: #E2E8F0;
      border-left: 2px solid var(--primary);
    }

    /* Modal */
    .modal-backdrop {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-backdrop.open { display: flex; animation: fadeIn 0.2s ease; }

    .modal {
      background: #0D1526;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      max-width: 650px;
      width: 100%;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
      padding: 1.75rem;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .modal-close {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 1.5rem;
      line-height: 1;
    }

    .modal-close:hover { color: var(--text-main); }

    /* Toast Notifications */
    #toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .toast {
      background: #111827;
      border: 1px solid var(--border-subtle);
      color: var(--text-main);
      padding: 0.85rem 1.25rem;
      border-radius: var(--radius-md);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      animation: slideIn 0.25s ease;
      min-width: 280px;
    }

    .toast.toast-success { border-color: var(--success); }
    .toast.toast-error { border-color: var(--danger); }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    /* Spinner */
    .spinner {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Timeline in Order Details */
    .timeline {
      position: relative;
      padding-left: 1.5rem;
      margin-top: 1rem;
    }

    .timeline::before {
      content: '';
      position: absolute;
      top: 5px;
      bottom: 5px;
      left: 6px;
      width: 2px;
      background: var(--border-subtle);
    }

    .timeline-item {
      position: relative;
      margin-bottom: 1rem;
    }

    .timeline-dot {
      position: absolute;
      left: -1.5rem;
      top: 4px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--primary);
      border: 2px solid #0D1526;
    }

    .timeline-time { font-size: 0.72rem; color: var(--text-dim); }
    .timeline-title { font-weight: 700; font-size: 0.82rem; }
    .timeline-note { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.15rem; }
  </style>
</head>
<body>

  <!-- Top Header Navigation -->
  <header>
    <a href="#" class="brand">
      <div class="brand-icon">
        <svg viewBox="0 0 24 24"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18s-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18s.41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15zM5 8.95v6.1l6 3.37v-6.1L5 8.95zm14 6.1v-6.1l-6 3.37v6.1l6-3.37z"/></svg>
      </div>
      <div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="brand-title">SolidLabs</span>
          <span class="brand-badge">Manufacturing OS</span>
        </div>
        <div style="font-size: 0.72rem; color: var(--text-dim);">AI-Powered CAD & DFM Administration</div>
      </div>
    </a>

    <!-- Nav Tabs -->
    <!-- Nav Tabs -->
    <div class="nav-tabs">
      <button class="nav-tab active" onclick="switchTab('tab-overview')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Overview
      </button>
      <button class="nav-tab" onclick="switchTab('tab-analyze')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        CAD & DFM Analysis
      </button>
      <a href="/studio" target="_blank" class="nav-tab" style="color: var(--primary); border: 1px solid rgba(0, 240, 255, 0.35); text-decoration: none; background: rgba(0, 240, 255, 0.08);" title="Launch 3D WebGL Model Studio">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        ⚡ 3D Model Studio
      </a>
      <button class="nav-tab" onclick="switchTab('tab-cadgen')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        Text-to-CAD Studio
      </button>
      <button class="nav-tab" onclick="switchTab('tab-marketplace')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        Marketplace
      </button>
      <button class="nav-tab" onclick="switchTab('tab-quotes')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
        Quotation Studio
      </button>
      <button class="nav-tab" onclick="switchTab('tab-orders')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        Orders Management
      </button>
      <button class="nav-tab" onclick="switchTab('tab-system')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        Diagnostics
      </button>
    </div>


    <!-- Health pill & Docs link -->
    <div class="header-actions">
      <div class="health-pill" id="header-health">
        <div class="health-dot"></div>
        <span id="health-text">Online</span>
      </div>
      <a href="/api/v1/docs" target="_blank" class="btn btn-secondary btn-sm" title="View OpenAPI Swagger Documentation">
        API Docs
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>
    </div>
  </header>

  <!-- Main Viewports -->
  <main>

    <!-- TAB 1: OVERVIEW -->
    <div id="tab-overview" class="tab-content active">
      <div style="background: linear-gradient(135deg, rgba(0,240,255,0.12) 0%, rgba(139,92,246,0.12) 100%); border: 1px solid rgba(0,240,255,0.3); border-radius: var(--radius-md); padding: 1.25rem 1.75rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
            <span style="font-size: 0.75rem; font-weight: 700; background: var(--primary); color: #080C14; padding: 0.2rem 0.5rem; border-radius: 4px;">FEATURE READY</span>
            <span style="font-weight: 700; font-size: 1.05rem;">Interactive AI-to-3D Geometry Generation Studio</span>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">
            Upload STL CAD models, rotate/zoom 3D meshes with Three.js, describe modifications with natural language prompts, and preview before-and-after geometry side by side.
          </div>
        </div>
        <a href="/studio" target="_blank" class="btn btn-primary" style="text-decoration: none; padding: 0.6rem 1.25rem; font-weight: 700;">
          Launch 3D Studio &rarr;
        </a>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(0, 240, 255, 0.12); color: var(--primary);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <div>
            <div class="stat-val" id="stat-analyzed">0</div>
            <div class="stat-label">CAD Models Analyzed</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(168, 85, 247, 0.15); color: #C084FC;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <div class="stat-val" id="stat-cad-designs">0</div>
            <div class="stat-label">Parametric 3D Assets</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(245, 158, 11, 0.15); color: #FBBF24;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <div>
            <div class="stat-val" id="stat-marketplace-count">0</div>
            <div class="stat-label">Marketplace Listings</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(59, 130, 246, 0.12); color: var(--accent-blue);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
          </div>
          <div>
            <div class="stat-val" id="stat-quotes">0</div>
            <div class="stat-label">Quotes Generated</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(16, 185, 129, 0.12); color: var(--success);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
          </div>
          <div>
            <div class="stat-val" id="stat-orders">0</div>
            <div class="stat-label">Active Orders</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(139, 92, 246, 0.12); color: var(--accent-purple);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          </div>
          <div>
            <div class="stat-val" id="stat-revenue">$0.00</div>
            <div class="stat-label">Gross Order Volume</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Card -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Quick Production Workflow
            </div>
            <div class="card-subtitle">End-to-end additive, subtractive manufacturing, parametric 3D synthesis and marketplace execution</div>
          </div>
        </div>
        <div style="display: flex; gap: 0.85rem; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="switchTab('tab-cadgen')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Text-to-CAD Studio
          </button>
          <button class="btn btn-secondary" onclick="switchTab('tab-marketplace')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            3D Marketplace
          </button>
          <button class="btn btn-secondary" onclick="switchTab('tab-analyze')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Ingest & Verify STL
          </button>
          <button class="btn btn-secondary" onclick="switchTab('tab-quotes')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Quotation Studio
          </button>
          <button class="btn btn-secondary" onclick="switchTab('tab-orders')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/></svg>
            Track Orders
          </button>
        </div>
      </div>

      <!-- Overview Two-Column Grid: Latest CAD Assets & Marketplace Listings -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
        <!-- Left: Recent 3D CAD Assets -->
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <div>
              <div class="card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                Recent 3D CAD Designs
              </div>
              <div class="card-subtitle">AI-synthesized & uploaded parametric solid models</div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="switchTab('tab-cadgen')">+ Generate New</button>
          </div>
          <div class="table-container">
            <table id="overview-designs-table">
              <thead>
                <tr>
                  <th>Design ID</th>
                  <th>Source / Type</th>
                  <th>Envelope</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="overview-designs-tbody">
                <tr><td colspan="4" style="text-align:center; color: var(--text-dim); padding: 1.5rem;">Loading registered designs...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Recent Marketplace Listings -->
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <div>
              <div class="card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Marketplace Designs
              </div>
              <div class="card-subtitle">Verified components ready for production</div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="switchTab('tab-marketplace')">Browse All</button>
          </div>
          <div class="table-container">
            <table id="overview-marketplace-table">
              <thead>
                <tr>
                  <th>Listing</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="overview-marketplace-tbody">
                <tr><td colspan="5" style="text-align:center; color: var(--text-dim); padding: 1.5rem;">Loading marketplace designs...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Recent Orders Table Preview -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Recent Manufacturing Orders</div>
            <div class="card-subtitle">Latest production requests and status states</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="loadOrders(); switchTab('tab-orders');">View All</button>
        </div>
        <div class="table-container">
          <table id="recent-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total Price</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="recent-orders-tbody">
              <tr><td colspan="6" style="text-align:center; color: var(--text-dim); padding: 2rem;">Loading latest orders...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- TAB 2: CAD & DFM ANALYSIS -->
    <div id="tab-analyze" class="tab-content">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              CAD Geometry Ingestion & DFM Engine
            </div>
            <div class="card-subtitle">Upload binary/ASCII STL files for exact topological inspection and process-specific DFM checks</div>
          </div>
        </div>

        <!-- Upload Dropzone -->
        <input type="file" id="stl-file-input" accept=".stl" style="display: none;" onchange="handleFileSelect(event)">
        <div class="drop-zone" id="drop-zone" onclick="document.getElementById('stl-file-input').click()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <div class="drop-zone-text" id="drop-zone-title">Click to Browse or Drag & Drop STL Mesh</div>
          <div class="drop-zone-hint">Supports Binary & ASCII STL up to 50 MB. Coordinates are inspected safely in sandbox.</div>
        </div>

        <!-- Configuration Settings -->
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Target Manufacturing Process</label>
            <select class="form-control" id="analyze-process">
              <option value="3d_printing_fdm">Fused Deposition Modeling (FDM 3D Printing)</option>
              <option value="3d_printing_sla">Stereolithography (SLA Resin Printing)</option>
              <option value="3d_printing_sls">Selective Laser Sintering (SLS Industrial Nylon)</option>
              <option value="cnc_machining_3axis">CNC 3-Axis Precision Milling</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Coordinate Units Assumption</label>
            <select class="form-control" id="analyze-units">
              <option value="mm">Millimeters (mm) — Standard Metric</option>
              <option value="inch">Inches (in)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">AI Engineering Synthesis</label>
            <div style="display: flex; align-items: center; gap: 0.6rem; height: 100%; padding-top: 0.35rem;">
              <input type="checkbox" id="analyze-ai-toggle" checked style="width: 18px; height: 18px; accent-color: var(--primary);">
              <label for="analyze-ai-toggle" style="font-size: 0.85rem; cursor: pointer;">Generate AI/Deterministic Synthesis</label>
            </div>
          </div>
        </div>

        <button class="btn btn-primary" id="btn-run-analysis" onclick="executeUploadAndAnalyze()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Analyze Geometry & Run DFM Rules
        </button>
      </div>

      <!-- Analysis Results View (Initially Hidden) -->
      <div id="analysis-results-container" style="display: none;">
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">
                <span id="res-filename" class="mono">part.stl</span>
                <span class="badge badge-info" id="res-analysis-id">anl_...</span>
              </div>
              <div class="card-subtitle" id="res-file-meta">Calculated geometry metrics</div>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button class="btn btn-primary btn-sm" onclick="forwardToQuoteStudio()">
                Generate Indicative Quote &rarr;
              </button>
              <button class="btn btn-secondary btn-sm" onclick="forwardAnalysisToImprovement()">
                AI Design Improvements &rarr;
              </button>
              <button class="btn btn-secondary btn-sm" onclick="forwardAnalysisToMarketplace()">
                Publish to Marketplace &rarr;
              </button>
            </div>
          </div>

          <!-- Key Metrics Grid -->
          <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));">
            <div class="stat-card">
              <div>
                <div class="stat-label">Bounding Box Dimensions</div>
                <div class="stat-val mono" style="font-size: 1.25rem;" id="res-dim-text">0 x 0 x 0 mm</div>
              </div>
            </div>

            <div class="stat-card">
              <div>
                <div class="stat-label">Topology Manifold</div>
                <div class="stat-val" style="font-size: 1.15rem;" id="res-watertight-badge">
                  <span class="badge badge-success">Watertight</span>
                </div>
              </div>
            </div>

            <div class="stat-card">
              <div>
                <div class="stat-label">Solid Enclosed Volume</div>
                <div class="stat-val mono" style="font-size: 1.25rem;" id="res-volume-text">0.00 mm³</div>
              </div>
            </div>

            <div class="stat-card">
              <div>
                <div class="stat-label">Facet Complexity</div>
                <div class="stat-val mono" style="font-size: 1.25rem;" id="res-triangles-text">0 triangles</div>
              </div>
            </div>
          </div>

          <!-- DFM Findings List -->
          <div style="margin-top: 1.5rem;">
            <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.75rem;">
              Rule-Based DFM Findings (<span id="dfm-count">0</span> checks executed)
            </div>
            <div id="dfm-findings-list">
              <!-- Dynamically populated -->
            </div>
          </div>

          <!-- AI Explanation Output -->
          <div id="ai-explanation-box" style="margin-top: 1.5rem; display: none;">
            <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--primary);">
              AI / Deterministic Engineering Synthesis
            </div>
            <div id="ai-explanation-content" style="background: rgba(0, 0, 0, 0.4); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; font-size: 0.85rem; line-height: 1.6; white-space: pre-wrap;">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: TEXT-TO-CAD & REVISIONS -->
    <div id="tab-cadgen" class="tab-content">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              AI Text-to-Parametric CAD Studio
            </div>
            <div class="card-subtitle">Synthesize verified 100% watertight 3D solid models from natural language and parametric constraints</div>
          </div>
        </div>

        <!-- Template Selector -->
        <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
          <div class="form-group">
            <label class="form-label">Component Template Family</label>
            <select class="form-control" id="cadgen-template" onchange="onCadgenTemplateChange()">
              <option value="mounting_plate">Mounting Plate (Corner bolt clearance holes & center bore)</option>
              <option value="simple_bracket">Simple L-Bracket (90-degree structural angle bracket)</option>
              <option value="spacer">Cylindrical Spacer (Hollow bushing / standoff)</option>
              <option value="cylindrical_adapter">Cylindrical Adapter (Stepped shaft coupler with bore)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Target Material Preference</label>
            <select class="form-control" id="cadgen-material">
              <option value="aluminum_6061">Aluminum 6061-T6 (Standard Aerospace/Robotics)</option>
              <option value="pla">PLA Polymer (Prototyping FDM)</option>
              <option value="petg">PETG (Mechanical/Chemical Resistant)</option>
              <option value="steel_1018">Steel 1018 (Heavy Structural)</option>
              <option value="nylon">Nylon PA12 (SLS Additive)</option>
            </select>
          </div>
        </div>

        <!-- Dynamic Parameters Panel -->
        <div id="cadgen-params-container" style="background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.25rem;">
          <div style="font-weight: 700; font-size: 0.88rem; margin-bottom: 0.75rem; color: var(--primary);">Mechanical Dimensional Parameters (mm)</div>

          <!-- Mounting Plate Params -->
          <div id="params-mounting_plate" class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
            <div class="form-group">
              <label class="form-label">Length (mm)</label>
              <input type="number" class="form-control" id="param-mp-length" value="100.0" min="10" max="600">
            </div>
            <div class="form-group">
              <label class="form-label">Width (mm)</label>
              <input type="number" class="form-control" id="param-mp-width" value="80.0" min="10" max="600">
            </div>
            <div class="form-group">
              <label class="form-label">Thickness (mm)</label>
              <input type="number" class="form-control" id="param-mp-thickness" value="6.0" min="1" max="100">
            </div>
            <div class="form-group">
              <label class="form-label">Hole Dia (mm)</label>
              <input type="number" class="form-control" id="param-mp-hole-dia" value="6.0" min="1" max="50">
            </div>
            <div class="form-group">
              <label class="form-label">Hole Margin (mm)</label>
              <input type="number" class="form-control" id="param-mp-margin" value="12.0" min="2" max="100">
            </div>
          </div>

          <!-- Simple Bracket Params -->
          <div id="params-simple_bracket" class="form-grid" style="display:none; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
            <div class="form-group">
              <label class="form-label">Leg 1 Length (mm)</label>
              <input type="number" class="form-control" id="param-sb-l1" value="60.0" min="10" max="500">
            </div>
            <div class="form-group">
              <label class="form-label">Leg 2 Length (mm)</label>
              <input type="number" class="form-control" id="param-sb-l2" value="50.0" min="10" max="500">
            </div>
            <div class="form-group">
              <label class="form-label">Width (mm)</label>
              <input type="number" class="form-control" id="param-sb-w" value="30.0" min="5" max="300">
            </div>
            <div class="form-group">
              <label class="form-label">Thickness (mm)</label>
              <input type="number" class="form-control" id="param-sb-t" value="5.0" min="2" max="50">
            </div>
          </div>

          <!-- Spacer Params -->
          <div id="params-spacer" class="form-grid" style="display:none; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
            <div class="form-group">
              <label class="form-label">Outer Diameter (mm)</label>
              <input type="number" class="form-control" id="param-sp-outer" value="30.0" min="6" max="400">
            </div>
            <div class="form-group">
              <label class="form-label">Inner Bore Dia (mm)</label>
              <input type="number" class="form-control" id="param-sp-inner" value="12.0" min="2" max="380">
            </div>
            <div class="form-group">
              <label class="form-label">Height (mm)</label>
              <input type="number" class="form-control" id="param-sp-height" value="15.0" min="3" max="500">
            </div>
          </div>

          <!-- Cylindrical Adapter Params -->
          <div id="params-cylindrical_adapter" class="form-grid" style="display:none; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));">
            <div class="form-group">
              <label class="form-label">Base Dia (mm)</label>
              <input type="number" class="form-control" id="param-ca-base-d" value="40.0" min="10" max="400">
            </div>
            <div class="form-group">
              <label class="form-label">Base Length (mm)</label>
              <input type="number" class="form-control" id="param-ca-base-l" value="15.0" min="5" max="300">
            </div>
            <div class="form-group">
              <label class="form-label">Stem Dia (mm)</label>
              <input type="number" class="form-control" id="param-ca-stem-d" value="24.0" min="6" max="350">
            </div>
            <div class="form-group">
              <label class="form-label">Stem Length (mm)</label>
              <input type="number" class="form-control" id="param-ca-stem-l" value="25.0" min="5" max="300">
            </div>
            <div class="form-group">
              <label class="form-label">Through Bore (mm)</label>
              <input type="number" class="form-control" id="param-ca-bore-d" value="12.0" min="2" max="300">
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Natural Language Intent / Component Prompt</label>
          <textarea class="form-control" id="cadgen-prompt" rows="2" placeholder="Describe component and engineering intent...">Standard aluminum mounting plate 100x80x6mm with 4 M6 corner clearance holes</textarea>
        </div>

        <button class="btn btn-primary" id="btn-generate-cad" onclick="generateParametricCAD()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          Generate 3D Solid Geometry
        </button>
      </div>

      <!-- Generation Result Card -->
      <div id="cadgen-result-card" style="display:none;" class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              Generated Solid: <span id="gen-res-id" class="mono text-primary">cad_...</span>
              <span class="badge badge-success" id="gen-res-manifold">100% Watertight Manifold</span>
            </div>
            <div class="card-subtitle" id="gen-res-summary">Real mathematical solid geometry synthesized and registered</div>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <a id="gen-res-download-btn" href="#" target="_blank" class="btn btn-primary btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download STL
            </a>
            <button class="btn btn-secondary btn-sm" onclick="forwardGenToMarketplace()">
              Publish to Marketplace &rarr;
            </button>
            <button class="btn btn-secondary btn-sm" onclick="forwardGenToQuote()">
              Quote Manufacturing &rarr;
            </button>
          </div>
        </div>

        <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
          <div class="stat-card">
            <div>
              <div class="stat-label">Bounding Envelope</div>
              <div class="stat-val mono" id="gen-res-extents">0 × 0 × 0 mm</div>
            </div>
          </div>
          <div class="stat-card">
            <div>
              <div class="stat-label">Solid Volume</div>
              <div class="stat-val mono" style="color:var(--primary);" id="gen-res-volume">0 mm³</div>
            </div>
          </div>
          <div class="stat-card">
            <div>
              <div class="stat-label">Surface Area</div>
              <div class="stat-val mono" id="gen-res-area">0 mm²</div>
            </div>
          </div>
          <div class="stat-card">
            <div>
              <div class="stat-label">Facets / Triangles</div>
              <div class="stat-val mono" id="gen-res-facets">0</div>
            </div>
          </div>
        </div>

        <!-- AI Improvement Section -->
        <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-subtle); padding-top: 1.25rem;">
          <div style="font-weight: 700; font-size: 1rem; margin-bottom: 0.5rem; color: var(--primary); display: flex; align-items: center; gap: 0.5rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            AI-Assisted CAD Design Improvements
          </div>
          <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem;">
            Evaluate real geometry & DFM checks against requirements. Formulate structured improvements or execute safe parameterized modifications creating an immutable Revision v2.
          </div>

          <div class="form-grid" style="grid-template-columns: 2fr 1fr 1fr;">
            <div class="form-group">
              <label class="form-label">Engineering Objective / Requirements</label>
              <input type="text" class="form-control" id="improve-reqs" value="Thicken walls for increased structural stiffness under dynamic vibration">
            </div>
            <div class="form-group">
              <label class="form-label">Process Context</label>
              <select class="form-control" id="improve-process">
                <option value="cnc_machining_3axis">CNC 3-Axis Milling</option>
                <option value="3d_printing_fdm">3D Printing (FDM)</option>
                <option value="3d_printing_sls">3D Printing (SLS)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Material</label>
              <select class="form-control" id="improve-material">
                <option value="aluminum_6061">Aluminum 6061</option>
                <option value="pla">PLA</option>
                <option value="steel_1018">Steel 1018</option>
              </select>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.75rem; flex-wrap: wrap; gap: 1rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; cursor: pointer;">
              <input type="checkbox" id="improve-execute" checked>
              <span>Execute safe modification (creates new revision v2 with delta comparison)</span>
            </label>

            <button class="btn btn-primary" id="btn-run-improve" onclick="requestDesignImprovement()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Formulate Revision Plan
            </button>
          </div>

          <!-- AI Plan Output Container -->
          <div id="improve-plan-result" style="display:none; margin-top: 1.25rem; background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem;">
          </div>
        </div>

        <!-- Revision History Explorer -->
        <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-subtle); padding-top: 1.25rem;">
          <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.75rem;">Immutable Revision History</div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Revision</th>
                  <th>Timestamp</th>
                  <th>Change Summary</th>
                  <th>Dimensions (mm)</th>
                  <th>File Size</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="revisions-history-tbody">
              </tbody>
            </table>
          </div>
        </div>
      <!-- All Registered CAD Assets Explorer -->
      <div class="card" style="margin-top: 1.5rem;">
        <div class="card-header">
          <div>
            <div class="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              All Registered CAD Design Assets
            </div>
            <div class="card-subtitle">Synthesized parametric parts and uploaded models available in persistent repository</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="loadDesignsList()">Refresh Designs</button>
        </div>
        <div class="table-container">
          <table id="cadgen-recent-table">
            <thead>
              <tr>
                <th>Design ID</th>
                <th>Type / Source</th>
                <th>Envelope (mm)</th>
                <th>Volume (mm³)</th>
                <th>Revisions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="cadgen-recent-tbody">
              <tr><td colspan="6" style="text-align:center; color: var(--text-dim); padding: 1.5rem;">Loading registered designs...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB: 3D DESIGN MARKETPLACE -->
    <div id="tab-marketplace" class="tab-content">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              3D Design & Manufacturing Marketplace
            </div>
            <div class="card-subtitle">Browse, publish, and manufacture verified engineering designs with IP rights protection</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="toggleCreateListingForm()">
            + Create Draft Listing
          </button>
        </div>

        <!-- Filter & Search Toolbar -->
        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap;">
          <input type="text" class="form-control" id="market-search-q" placeholder="Search designs by title or tags..." style="max-width: 300px;" oninput="debounceMarketSearch()">
          <select class="form-control" id="market-filter-cat" style="max-width: 220px;" onchange="loadMarketplaceListings()">
            <option value="">All Categories</option>
            <option value="robotics">Robotics</option>
            <option value="mechanical_components">Mechanical Components</option>
            <option value="brackets_mounts">Brackets & Mounts</option>
            <option value="tooling">Tooling & Jigs</option>
            <option value="enclosures">Enclosures</option>
            <option value="other">Other</option>
          </select>
          <button class="btn btn-secondary btn-sm" onclick="loadMarketplaceListings()">
            Refresh
          </button>
        </div>

        <!-- Collapsible Create Listing Panel -->
        <div id="create-listing-panel" style="display:none; background: rgba(15, 23, 42, 0.5); border: 1px solid var(--primary); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem;">
          <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.75rem; color: var(--primary);">Create New Marketplace Listing</div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">CAD Design Asset ID</label>
              <input type="text" class="form-control mono" id="mkt-design-id" placeholder="cad_... (Generated or uploaded design)">
            </div>
            <div class="form-group">
              <label class="form-label">Listing Title</label>
              <input type="text" class="form-control" id="mkt-title" placeholder="e.g. Precision CNC Robotic Mounting Bracket">
            </div>
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-control" id="mkt-category">
                <option value="robotics">Robotics</option>
                <option value="mechanical_components">Mechanical Components</option>
                <option value="brackets_mounts">Brackets & Mounts</option>
                <option value="tooling">Tooling</option>
                <option value="enclosures">Enclosures</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Indicative Base Price (USD)</label>
              <input type="number" class="form-control" id="mkt-price" value="25.00" min="0" step="0.5">
            </div>
          </div>
          <div class="form-group" style="margin-top: 0.75rem;">
            <label class="form-label">Description & Engineering Specifications</label>
            <textarea class="form-control" id="mkt-desc" rows="2" placeholder="Describe the component, tolerances, and application requirements...">High-rigidity aluminum 6061 mounting bracket designed for NEMA 17 stepper motors and robotics chassis.</textarea>
          </div>
          <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
            <button class="btn btn-primary" onclick="createMarketplaceListing()">Register Draft Listing</button>
            <button class="btn btn-secondary" onclick="toggleCreateListingForm()">Cancel</button>
          </div>
        </div>

        <!-- Listings Grid -->
        <div id="marketplace-grid" class="stats-grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
        </div>
      </div>
    </div>

    <!-- TAB 3: QUOTATION STUDIO -->
    <div id="tab-quotes" class="tab-content">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
              Indicative Quotation Studio
            </div>
            <div class="card-subtitle">Transparent costing based on additive infill physics and subtractive billet MRR rates</div>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">CAD Reference (Analysis, Design, or Marketplace Listing ID)</label>
            <input type="text" class="form-control mono" id="quote-analysis-id" placeholder="anl_... OR cad_... OR lst_...">
            <div style="font-size:0.72rem; color:var(--text-dim); margin-top:0.25rem;">Accepts anl_... (Analysis), cad_... (Design Asset), or lst_... (Marketplace Listing)</div>
          </div>


          <div class="form-group">
            <label class="form-label">Manufacturing Process</label>
            <select class="form-control" id="quote-process" onchange="updateCompatibleMaterials()">
              <option value="3d_printing_fdm">3D Printing — Fused Deposition Modeling (FDM)</option>
              <option value="3d_printing_sla">3D Printing — Stereolithography (SLA)</option>
              <option value="3d_printing_sls">3D Printing — Selective Laser Sintering (SLS)</option>
              <option value="cnc_machining_3axis">CNC 3-Axis Precision Milling</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Raw Material Stock</label>
            <select class="form-control" id="quote-material">
              <!-- Dynamically populated based on process -->
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Batch Quantity</label>
            <input type="number" class="form-control" id="quote-quantity" value="1" min="1" max="50000">
          </div>

          <div class="form-group">
            <label class="form-label">Surface Finishing</label>
            <select class="form-control" id="quote-finish">
              <option value="standard_as_machined">Standard (As Built / As Machined)</option>
              <option value="bead_blasted">Glass Bead Blasted (Matte Satin)</option>
              <option value="anodized">Type II Anodized (Corrosion Protection)</option>
              <option value="vapor_smoothed">Vapor Smoothed (Glossy Sealed)</option>
            </select>
          </div>
        </div>

        <button class="btn btn-primary" onclick="calculateIndicativeQuote()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
          Compute Transparent Quotation
        </button>
      </div>

      <!-- Quote Result Card -->
      <div id="quote-result-card" style="display: none;" class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              Quotation Summary: <span id="quote-res-id" class="mono text-primary">qte_...</span>
              <span class="badge badge-warning" id="quote-res-status">INDICATIVE</span>
            </div>
            <div class="card-subtitle">Estimates for design budgeting, subject to final CAM verification</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="forwardQuoteToOrderModal()">
            Convert to Manufacturing Order &rarr;
          </button>
        </div>

        <!-- Pricing Highlights -->
        <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
          <div class="stat-card">
            <div>
              <div class="stat-label">Unit Price</div>
              <div class="stat-val mono" style="color: var(--primary);" id="quote-unit-price">$0.00</div>
            </div>
          </div>

          <div class="stat-card">
            <div>
              <div class="stat-label">Total Indicative Price</div>
              <div class="stat-val mono" style="color: var(--success);" id="quote-total-price">$0.00</div>
            </div>
          </div>

          <div class="stat-card">
            <div>
              <div class="stat-label">Production Lead Time</div>
              <div class="stat-val mono" id="quote-lead-time">0 Days</div>
            </div>
          </div>

          <div class="stat-card">
            <div>
              <div class="stat-label">Ordered Quantity</div>
              <div class="stat-val mono" id="quote-qty-display">1 Unit</div>
            </div>
          </div>
        </div>

        <!-- Line Item Breakdown -->
        <div style="margin-top: 1.5rem;">
          <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.75rem;">Itemized Manufacturing Breakdown</div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Cost Element</th>
                  <th>Calculation Details & Formula</th>
                  <th style="text-align: right;">Unit Cost</th>
                  <th style="text-align: right;">Total Cost</th>
                </tr>
              </thead>
              <tbody id="quote-line-items-tbody">
              </tbody>
            </table>
          </div>
        </div>

        <!-- Explicit Assumptions Box -->
        <div style="margin-top: 1.25rem; background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1rem;">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem;">Transparent Model Assumptions</div>
          <div id="quote-assumptions-text" class="mono" style="font-size: 0.78rem; color: var(--text-dim); line-height: 1.5;"></div>
        </div>
      </div>
    </div>

    <!-- TAB 4: ORDERS MANAGEMENT -->
    <div id="tab-orders" class="tab-content">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
              Manufacturing Order Management
            </div>
            <div class="card-subtitle">Validated lifecycle workflow (REQUESTED &rarr; APPROVED &rarr; IN_PRODUCTION &rarr; QUALITY_CHECK &rarr; DELIVERED)</div>
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <select class="form-control" id="order-filter-status" onchange="loadOrders()" style="width: 180px;">
              <option value="">All Statuses</option>
              <option value="REQUESTED">REQUESTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="IN_PRODUCTION">IN_PRODUCTION</option>
              <option value="QUALITY_CHECK">QUALITY_CHECK</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
            <button class="btn btn-primary btn-sm" onclick="openCreateOrderModal()">+ New Order</button>
          </div>
        </div>

        <!-- Orders Table -->
        <div class="table-container">
          <table id="orders-full-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Quote Reference</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total Price</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="orders-full-tbody">
              <tr><td colspan="7" style="text-align:center; color: var(--text-dim); padding: 2rem;">Loading orders...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 5: SYSTEM DIAGNOSTICS -->
    <div id="tab-system" class="tab-content">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              Backend System Health & Diagnostics
            </div>
            <div class="card-subtitle">Real-time telemetry from FastAPI service</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="fetchHealthData()">Refresh</button>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div>
              <div class="stat-label">System Operational State</div>
              <div class="stat-val" style="color: var(--success);" id="diag-status">Healthy</div>
            </div>
          </div>

          <div class="stat-card">
            <div>
              <div class="stat-label">Service Uptime</div>
              <div class="stat-val mono" id="diag-uptime">0s</div>
            </div>
          </div>

          <div class="stat-card">
            <div>
              <div class="stat-label">Database Connection</div>
              <div class="stat-val mono" style="color: var(--primary);" id="diag-db">Connected</div>
            </div>
          </div>

          <div class="stat-card">
            <div>
              <div class="stat-label">Application Version</div>
              <div class="stat-val mono" id="diag-version">1.0.0</div>
            </div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; margin-top: 1rem;">
          <div style="font-weight: 700; margin-bottom: 0.5rem;">Configuration & Safe Sandbox Limits</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; font-size: 0.82rem;">
            <div><strong>Upload Max Limit:</strong> 50 MB</div>
            <div><strong>Supported Geometries:</strong> Binary & ASCII STL (.stl)</div>
            <div><strong>Default Units:</strong> Millimeters (mm)</div>
            <div><strong>Indicative Precision:</strong> Additive Infill & CNC MRR formulas</div>
            <div><strong>AI Guardrails:</strong> Deterministic Fallback & Zero Dimension Hallucination</div>
            <div><strong>Prototype Notice:</strong> Order state updates prototype mode; RBAC in production</div>
          </div>
        </div>
      </div>
    </div>

  </main>

  <!-- MODAL: Order Details & Transition Controller -->
  <div class="modal-backdrop" id="order-details-modal">
    <div class="modal">
      <div class="modal-header">
        <div>
          <div style="font-size: 1.1rem; font-weight: 700;" id="modal-order-title">Order Details</div>
          <div style="font-size: 0.78rem; color: var(--text-dim);" id="modal-order-id-subtitle">ord_...</div>
        </div>
        <button class="modal-close" onclick="closeOrderModal()">&times;</button>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.85rem;">
          <div><strong style="color: var(--text-muted);">Customer:</strong> <span id="modal-customer-name"></span></div>
          <div><strong style="color: var(--text-muted);">Email:</strong> <span id="modal-customer-email"></span></div>
          <div><strong style="color: var(--text-muted);">Total Value:</strong> <span id="modal-total-price" class="mono text-success"></span></div>
          <div><strong style="color: var(--text-muted);">Current State:</strong> <span id="modal-status-badge"></span></div>
        </div>
        <div style="margin-top: 0.75rem; font-size: 0.85rem;">
          <strong style="color: var(--text-muted);">Delivery Address:</strong>
          <div id="modal-shipping-address" style="color: var(--text-main); margin-top: 0.2rem;"></div>
        </div>
      </div>

      <!-- State Transition Form -->
      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem;">
        <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.6rem; color: var(--primary);">Update Lifecycle State</div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <select class="form-control" id="modal-transition-select" style="flex: 1; min-width: 180px;">
            <!-- Options populated dynamically based on allowed state machine transitions -->
          </select>
          <input type="text" class="form-control" id="modal-transition-notes" placeholder="Transition notes / QA signoff..." style="flex: 2; min-width: 200px;">
          <button class="btn btn-primary btn-sm" onclick="submitStatusUpdate()">Update State</button>
        </div>
      </div>

      <!-- Audit Timeline -->
      <div>
        <div style="font-weight: 700; font-size: 0.88rem; margin-bottom: 0.5rem;">Lifecycle Audit History</div>
        <div class="timeline" id="modal-audit-timeline">
          <!-- Populated dynamically -->
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL: Create New Order -->
  <div class="modal-backdrop" id="create-order-modal">
    <div class="modal">
      <div class="modal-header">
        <div style="font-size: 1.1rem; font-weight: 700;">Place Manufacturing Order</div>
        <button class="modal-close" onclick="closeCreateOrderModal()">&times;</button>
      </div>

      <div class="form-group" style="margin-bottom: 1rem;">
        <label class="form-label">Quotation Reference ID</label>
        <input type="text" class="form-control mono" id="new-order-quote-id" placeholder="qte_...">
      </div>

      <div class="form-group" style="margin-bottom: 1rem;">
        <label class="form-label">Customer / Organization Name</label>
        <input type="text" class="form-control" id="new-order-customer-name" placeholder="Acme Engineering Lab">
      </div>

      <div class="form-group" style="margin-bottom: 1rem;">
        <label class="form-label">Contact Email</label>
        <input type="email" class="form-control" id="new-order-customer-email" placeholder="engineering@acme.org">
      </div>

      <div class="form-group" style="margin-bottom: 1rem;">
        <label class="form-label">Shipping Destination Address</label>
        <textarea class="form-control" id="new-order-shipping-address" rows="3" placeholder="Street Address, City, State, Postal Code, Country"></textarea>
      </div>

      <div class="form-group" style="margin-bottom: 1.25rem;">
        <label class="form-label">Production Notes (Optional)</label>
        <input type="text" class="form-control" id="new-order-notes" placeholder="Expedited QA, specific packaging requirements, etc.">
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button class="btn btn-secondary" onclick="closeCreateOrderModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitNewOrder()">Submit Order</button>
      </div>
    </div>
  </div>

  <!-- Toast Notification Container -->
  <div id="toast-container"></div>

  <script>
    // Global State
    let activeFile = null;
    let latestAnalysis = null;
    let latestQuote = null;
    let currentViewingOrder = null;

    const PROCESS_MATERIALS = {
      '3d_printing_fdm': [
        { id: 'pla', name: 'PLA Polymer (Standard Prototyping)' },
        { id: 'abs', name: 'ABS Thermoplastic (Impact Resistant)' },
        { id: 'petg', name: 'PETG Copolymer (Durable & Water Resistant)' }
      ],
      '3d_printing_sla': [
        { id: 'resin_standard', name: 'Standard Photopolymer Resin (High Detail)' }
      ],
      '3d_printing_sls': [
        { id: 'nylon', name: 'PA12 Polyamide / Nylon (Functional End-Use)' }
      ],
      'cnc_machining_3axis': [
        { id: 'aluminum_6061', name: 'Aluminum 6061-T6 (General Precision)' },
        { id: 'steel_1018', name: 'Mild Steel 1018 (High Rigidity)' },
        { id: 'stainless_304', name: 'Stainless Steel 304 (Corrosion Resistant)' },
        { id: 'brass_360', name: 'Free-Cutting Brass 360 (Low Friction)' },
        { id: 'abs', name: 'ABS Engineering Plastic (Machined)' },
        { id: 'nylon', name: 'Nylon PA6 (Machined Tough Polymer)' }
      ]
    };

    const ALLOWED_TRANSITIONS = {
      'REQUESTED': ['APPROVED', 'REJECTED', 'CANCELLED'],
      'APPROVED': ['IN_PRODUCTION', 'CANCELLED'],
      'IN_PRODUCTION': ['QUALITY_CHECK', 'CANCELLED'],
      'QUALITY_CHECK': ['DELIVERED', 'IN_PRODUCTION', 'CANCELLED'],
      'DELIVERED': [],
      'CANCELLED': [],
      'REJECTED': []
    };

    // Tab Switcher
    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));

      const target = document.getElementById(tabId);
      if (target) target.classList.add('active');

      const btnIndex = ['tab-overview', 'tab-analyze', 'tab-cadgen', 'tab-marketplace', 'tab-quotes', 'tab-orders', 'tab-system'].indexOf(tabId);
      if (btnIndex >= 0) {
        document.querySelectorAll('.nav-tab')[btnIndex].classList.add('active');
      }

      if (tabId === 'tab-overview' || tabId === 'tab-orders') {
        loadOrders();
      }
      if (tabId === 'tab-overview' || tabId === 'tab-cadgen') {
        loadDesignsList();
      }
      if (tabId === 'tab-marketplace' || tabId === 'tab-overview') {
        loadMarketplaceListings();
      }
      if (tabId === 'tab-system' || tabId === 'tab-overview') {
        fetchHealthData();
      }
    }


    // Toast Helper
    function showToast(message, type = 'success') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.innerHTML = `
        <span style="font-weight:700;">${type === 'success' ? '✓' : '⚠'}</span>
        <div>${message}</div>
      `;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    // Health Telemetry
    async function fetchHealthData() {
      try {
        const resp = await fetch('/api/v1/health');
        if (resp.ok) {
          const data = await resp.json();
          document.getElementById('health-text').innerText = data.status === 'healthy' ? 'Online' : 'Degraded';
          document.getElementById('diag-status').innerText = data.status.toUpperCase();
          document.getElementById('diag-uptime').innerText = `${data.uptime_seconds.toFixed(1)}s`;
          document.getElementById('diag-db').innerText = data.database_connected ? 'Connected (SQLAlchemy)' : 'Disconnected';
          document.getElementById('diag-version').innerText = data.version;
        }
      } catch (e) {
        document.getElementById('health-text').innerText = 'Offline';
      }
    }

    // File Drag & Drop
    const dropZone = document.getElementById('drop-zone');
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    });

    function handleFileSelect(e) {
      if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
      }
    }

    function handleFile(file) {
      if (!file.name.toLowerCase().endsWith('.stl')) {
        showToast('Please select a valid .stl polygon mesh file.', 'error');
        return;
      }
      activeFile = file;
      document.getElementById('drop-zone-title').innerText = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    }

    // Execute CAD Upload and Analysis
    async function executeUploadAndAnalyze() {
      if (!activeFile) {
        showToast('Please drag and drop or browse for an STL file first.', 'error');
        return;
      }

      const btn = document.getElementById('btn-run-analysis');
      btn.innerHTML = `<span class="spinner"></span> Processing Mesh Geometry...`;
      btn.disabled = true;

      const processVal = document.getElementById('analyze-process').value;
      const unitsVal = document.getElementById('analyze-units').value;
      const aiToggle = document.getElementById('analyze-ai-toggle').checked;

      const formData = new FormData();
      formData.append('file', activeFile);

      try {
        const url = `/api/v1/analyze?process=${encodeURIComponent(processVal)}&units=${encodeURIComponent(unitsVal)}&explain_with_ai=${aiToggle}`;
        const resp = await fetch(url, { method: 'POST', body: formData });
        const data = await resp.json();

        if (!resp.ok) {
          showToast(data.detail || 'Analysis failed.', 'error');
          return;
        }

        latestAnalysis = data;
        renderAnalysisResults(data);
        showToast(`Analyzed ${data.filename} successfully!`, 'success');
        updateOverviewCounts();
      } catch (err) {
        showToast('Server communication error during analysis.', 'error');
      } finally {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Analyze Geometry & Run DFM Rules`;
        btn.disabled = false;
      }
    }

    function renderAnalysisResults(data) {
      const container = document.getElementById('analysis-results-container');
      container.style.display = 'block';

      document.getElementById('res-filename').innerText = data.filename;
      document.getElementById('res-analysis-id').innerText = data.analysis_id;
      document.getElementById('res-file-meta').innerText = `${(data.file_size_bytes / 1024).toFixed(1)} KB | SHA-256: ${data.file_hash.substring(0, 16)}... | Units: ${data.units}`;

      const bb = data.geometry.bounding_box;
      document.getElementById('res-dim-text').innerText = `${bb.x} × ${bb.y} × ${bb.z} ${data.units}`;

      const wtEl = document.getElementById('res-watertight-badge');
      if (data.geometry.is_watertight) {
        wtEl.innerHTML = `<span class="badge badge-success">Closed 2-Manifold (Watertight)</span>`;
      } else {
        wtEl.innerHTML = `<span class="badge badge-danger">Non-Watertight (Open Boundaries)</span>`;
      }

      const volEl = document.getElementById('res-volume-text');
      if (data.geometry.is_volume_valid && data.geometry.volume_mm3 !== null) {
        const cm3 = (data.geometry.volume_mm3 / 1000).toFixed(2);
        volEl.innerText = `${data.geometry.volume_mm3.toLocaleString()} mm³ (${cm3} cm³)`;
      } else {
        volEl.innerText = 'Indeterminate (Non-Manifold)';
      }

      document.getElementById('res-triangles-text').innerText = `${data.geometry.triangle_count.toLocaleString()} facets`;

      // Render DFM Findings
      const findingsList = document.getElementById('dfm-findings-list');
      findingsList.innerHTML = '';
      document.getElementById('dfm-count').innerText = data.dfm_findings.length;

      data.dfm_findings.forEach(f => {
        const card = document.createElement('div');
        card.className = `finding-card severity-${f.severity}`;
        const badgeClass = f.severity === 'critical' ? 'badge-danger' : (f.severity === 'warning' ? 'badge-warning' : 'badge-info');

        card.innerHTML = `
          <div class="finding-header">
            <div class="finding-title">
              <span>${f.passed ? '✓' : '⚠'}</span>
              <span>${f.check_name}</span>
              <span class="badge ${badgeClass}">${f.severity}</span>
            </div>
            <div class="mono" style="font-size:0.72rem; color:var(--text-dim);">${f.check_code}</div>
          </div>
          <div class="finding-desc">${f.explanation}</div>
          <div class="finding-action"><strong>Recommended Action:</strong> ${f.suggested_action}</div>
        `;
        findingsList.appendChild(card);
      });

      // AI Box
      const aiBox = document.getElementById('ai-explanation-box');
      if (data.ai_explanation) {
        aiBox.style.display = 'block';
        document.getElementById('ai-explanation-content').innerText = data.ai_explanation;
      } else {
        aiBox.style.display = 'none';
      }

      container.scrollIntoView({ behavior: 'smooth' });
    }

    function forwardToQuoteStudio() {
      if (!latestAnalysis) return;
      document.getElementById('quote-analysis-id').value = latestAnalysis.analysis_id;
      switchTab('tab-quotes');
    }

    // Quotation Dynamic Materials
    function updateCompatibleMaterials() {
      const process = document.getElementById('quote-process').value;
      const matSelect = document.getElementById('quote-material');
      matSelect.innerHTML = '';

      const list = PROCESS_MATERIALS[process] || [];
      list.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.innerText = m.name;
        matSelect.appendChild(opt);
      });
    }

    async function calculateIndicativeQuote() {
      const refId = document.getElementById('quote-analysis-id').value.trim();
      if (!refId) {
        showToast('Please provide an Analysis ID, Design ID, or Marketplace Listing ID.', 'error');
        return;
      }

      const payload = {
        process: document.getElementById('quote-process').value,
        material: document.getElementById('quote-material').value,
        quantity: parseInt(document.getElementById('quote-quantity').value) || 1,
        finish: document.getElementById('quote-finish').value
      };

      if (refId.startsWith('lst_')) {
        payload.listing_id = refId;
      } else if (refId.startsWith('cad_')) {
        payload.design_id = refId;
      } else {
        payload.analysis_id = refId;
      }


      try {
        const resp = await fetch('/api/v1/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await resp.json();

        if (!resp.ok) {
          showToast(data.detail || 'Quotation failed.', 'error');
          return;
        }

        latestQuote = data;
        renderQuoteResult(data);
        showToast('Indicative quotation generated!', 'success');
        updateOverviewCounts();
      } catch (err) {
        showToast('Server communication error during quotation.', 'error');
      }
    }

    function renderQuoteResult(q) {
      const card = document.getElementById('quote-result-card');
      card.style.display = 'block';

      document.getElementById('quote-res-id').innerText = q.quote_id;
      document.getElementById('quote-res-status').innerText = q.estimate_status.toUpperCase();
      document.getElementById('quote-unit-price').innerText = `$${q.unit_price.toFixed(2)}`;
      document.getElementById('quote-total-price').innerText = `$${q.total_price.toFixed(2)}`;
      document.getElementById('quote-lead-time').innerText = `${q.lead_time_business_days} Business Days`;
      document.getElementById('quote-qty-display').innerText = `${q.quantity} ${q.quantity === 1 ? 'Part' : 'Parts'}`;

      // Line items
      const tbody = document.getElementById('quote-line-items-tbody');
      tbody.innerHTML = '';
      q.line_items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td style="font-weight:600;">${item.item_name}</td>
          <td style="color:var(--text-muted);">${item.description}</td>
          <td class="mono" style="text-align:right;">$${item.unit_cost.toFixed(2)}</td>
          <td class="mono" style="text-align:right; font-weight:700;">$${item.total_cost.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
      });

      // Assumptions
      document.getElementById('quote-assumptions-text').innerText = JSON.stringify(q.pricing_assumptions, null, 2);
      card.scrollIntoView({ behavior: 'smooth' });
    }

    function forwardQuoteToOrderModal() {
      if (!latestQuote) return;
      document.getElementById('new-order-quote-id').value = latestQuote.quote_id;
      openCreateOrderModal();
    }

    // Orders Management
    async function loadOrders() {
      const filter = document.getElementById('order-filter-status').value;
      const url = filter ? `/api/v1/orders?status=${filter}&limit=50` : '/api/v1/orders?limit=50';

      try {
        const resp = await fetch(url);
        if (!resp.ok) return;
        const data = await resp.json();

        renderOrdersTable(data.items);
        renderRecentOrdersTable(data.items.slice(0, 5));
        updateOverviewCounts(data.items);
      } catch (e) {
        console.error('Error fetching orders:', e);
      }
    }

    function renderOrdersTable(orders) {
      const tbody = document.getElementById('orders-full-tbody');
      tbody.innerHTML = '';

      if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-dim); padding: 2rem;">No orders found. Click "+ New Order" to create one.</td></tr>`;
        return;
      }

      orders.forEach(ord => {
        const row = document.createElement('tr');
        const badgeClass = getStatusBadgeClass(ord.status);
        const dt = new Date(ord.updated_at).toLocaleDateString();

        row.innerHTML = `
          <td class="mono font-weight-bold" style="color:var(--primary);">${ord.order_id}</td>
          <td class="mono" style="font-size:0.75rem; color:var(--text-dim);">${ord.quote_id}</td>
          <td>
            <div style="font-weight:600;">${ord.customer_name}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${ord.customer_email}</div>
          </td>
          <td><span class="badge ${badgeClass}">${ord.status}</span></td>
          <td class="mono" style="font-weight:700; color:var(--success);">$${ord.total_price.toFixed(2)}</td>
          <td style="font-size:0.78rem; color:var(--text-muted);">${dt}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="openOrderDetailsModal('${ord.order_id}')">Manage</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    function renderRecentOrdersTable(orders) {
      const tbody = document.getElementById('recent-orders-tbody');
      tbody.innerHTML = '';

      if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-dim); padding: 2rem;">No recent orders. Ingest an STL and convert a quote to place an order.</td></tr>`;
        return;
      }

      orders.forEach(ord => {
        const row = document.createElement('tr');
        const badgeClass = getStatusBadgeClass(ord.status);
        const dt = new Date(ord.created_at).toLocaleDateString();

        row.innerHTML = `
          <td class="mono font-weight-bold">${ord.order_id}</td>
          <td>${ord.customer_name}</td>
          <td><span class="badge ${badgeClass}">${ord.status}</span></td>
          <td class="mono">$${ord.total_price.toFixed(2)}</td>
          <td style="font-size:0.78rem; color:var(--text-muted);">${dt}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="openOrderDetailsModal('${ord.order_id}')">View</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    function getStatusBadgeClass(status) {
      switch(status) {
        case 'DELIVERED': return 'badge-success';
        case 'IN_PRODUCTION': return 'badge-info';
        case 'QUALITY_CHECK': return 'badge-warning';
        case 'APPROVED': return 'badge-info';
        case 'REQUESTED': return 'badge-warning';
        case 'CANCELLED':
        case 'REJECTED': return 'badge-danger';
        default: return 'badge-info';
      }
    }

    function updateOverviewCounts(ordersList = null) {
      if (ordersList) {
        document.getElementById('stat-orders').innerText = ordersList.length;
        const totalRev = ordersList.reduce((acc, curr) => acc + curr.total_price, 0);
        document.getElementById('stat-revenue').innerText = `$${totalRev.toFixed(2)}`;
      }
      if (latestAnalysis) {
        document.getElementById('stat-analyzed').innerText = '1+';
      }
      if (latestQuote) {
        document.getElementById('stat-quotes').innerText = '1+';
      }
    }

    // Order Details Modal & State Machine Controller
    async function openOrderDetailsModal(orderId) {
      try {
        const resp = await fetch(`/api/v1/orders/${orderId}`);
        if (!resp.ok) return;
        const ord = await resp.json();
        currentViewingOrder = ord;

        document.getElementById('modal-order-title').innerText = `Order ${ord.order_id}`;
        document.getElementById('modal-order-id-subtitle').innerText = `Linked to Quote: ${ord.quote_id}`;
        document.getElementById('modal-customer-name').innerText = ord.customer_name;
        document.getElementById('modal-customer-email').innerText = ord.customer_email;
        document.getElementById('modal-total-price').innerText = `$${ord.total_price.toFixed(2)} ${ord.currency}`;
        document.getElementById('modal-status-badge').innerHTML = `<span class="badge ${getStatusBadgeClass(ord.status)}">${ord.status}</span>`;
        document.getElementById('modal-shipping-address').innerText = ord.shipping_address;

        // Populate valid state transitions
        const select = document.getElementById('modal-transition-select');
        select.innerHTML = '';
        const allowed = ALLOWED_TRANSITIONS[ord.status] || [];

        if (allowed.length === 0) {
          const opt = document.createElement('option');
          opt.value = '';
          opt.innerText = 'Terminal State (No further transitions)';
          select.appendChild(opt);
          select.disabled = true;
        } else {
          select.disabled = false;
          allowed.forEach(st => {
            const opt = document.createElement('option');
            opt.value = st;
            opt.innerText = `Transition to: ${st}`;
            select.appendChild(opt);
          });
        }

        // Render Audit Timeline
        const timeline = document.getElementById('modal-audit-timeline');
        timeline.innerHTML = '';
        (ord.status_history || []).forEach(h => {
          const item = document.createElement('div');
          item.className = 'timeline-item';
          const timeStr = new Date(h.timestamp).toLocaleString();
          item.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-title">${h.to_status}</div>
            <div class="timeline-time">${timeStr}</div>
            <div class="timeline-note">${h.notes || 'Status updated'}</div>
          `;
          timeline.appendChild(item);
        });

        document.getElementById('order-details-modal').classList.add('open');
      } catch (err) {
        showToast('Could not load order details.', 'error');
      }
    }

    function closeOrderModal() {
      document.getElementById('order-details-modal').classList.remove('open');
    }

    async function submitStatusUpdate() {
      if (!currentViewingOrder) return;
      const newStatus = document.getElementById('modal-transition-select').value;
      if (!newStatus) {
        showToast('No valid transition available for this state.', 'error');
        return;
      }
      const notes = document.getElementById('modal-transition-notes').value.trim();

      try {
        const resp = await fetch(`/api/v1/orders/${currentViewingOrder.order_id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ new_status: newStatus, notes: notes })
        });
        const data = await resp.json();

        if (!resp.ok) {
          showToast(data.detail || 'State update failed.', 'error');
          return;
        }

        showToast(`Order transitioned to ${newStatus}!`, 'success');
        openOrderDetailsModal(currentViewingOrder.order_id);
        loadOrders();
      } catch (e) {
        showToast('Failed to transition state.', 'error');
      }
    }

    // Create New Order Modal
    function openCreateOrderModal() {
      document.getElementById('create-order-modal').classList.add('open');
    }

    function closeCreateOrderModal() {
      document.getElementById('create-order-modal').classList.remove('open');
    }

    async function submitNewOrder() {
      const quoteId = document.getElementById('new-order-quote-id').value.trim();
      const customerName = document.getElementById('new-order-customer-name').value.trim();
      const customerEmail = document.getElementById('new-order-customer-email').value.trim();
      const shippingAddress = document.getElementById('new-order-shipping-address').value.trim();
      const notes = document.getElementById('new-order-notes').value.trim();

      if (!quoteId || !customerName || !customerEmail || !shippingAddress) {
        showToast('Please fill all required order fields.', 'error');
        return;
      }

      try {
        const resp = await fetch('/api/v1/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quote_id: quoteId,
            customer_name: customerName,
            customer_email: customerEmail,
            shipping_address: shippingAddress,
            notes: notes
          })
        });
        const data = await resp.json();

        if (!resp.ok) {
          showToast(data.detail || 'Failed to place order.', 'error');
          return;
        }

        showToast(`Order ${data.order_id} placed successfully!`, 'success');
        closeCreateOrderModal();
        loadOrders();
        switchTab('tab-orders');
      } catch (err) {
        showToast('Server communication error placing order.', 'error');
      }
    }

    let latestGeneratedDesign = null;
    let marketSearchTimeout = null;

    // Template Switcher for Parametric CAD Studio
    function onCadgenTemplateChange() {
      const template = document.getElementById('cadgen-template').value;
      const templates = ['mounting_plate', 'simple_bracket', 'spacer', 'cylindrical_adapter'];
      templates.forEach(t => {
        const el = document.getElementById(`params-${t}`);
        if (el) el.style.display = (t === template) ? 'grid' : 'none';
      });

      const promptEl = document.getElementById('cadgen-prompt');
      switch(template) {
        case 'mounting_plate':
          promptEl.value = 'Standard aluminum mounting plate 100x80x6mm with 4 M6 corner clearance holes';
          break;
        case 'simple_bracket':
          promptEl.value = 'Heavy-duty 90-degree corner support bracket 60x50x30mm with 5mm thickness';
          break;
        case 'spacer':
          promptEl.value = '30mm OD cylindrical spacer with 12mm central bolt clearance hole and 15mm height';
          break;
        case 'cylindrical_adapter':
          promptEl.value = 'Stepped shaft coupler adapter 40mm to 24mm diameter with 12mm through bore';
          break;
      }
    }

    // Generate Parametric 3D CAD
    async function generateParametricCAD() {
      const btn = document.getElementById('btn-generate-cad');
      btn.innerHTML = `<span class="spinner"></span> Synthesizing 3D Solid Geometry...`;
      btn.disabled = true;

      const template = document.getElementById('cadgen-template').value;
      const material = document.getElementById('cadgen-material').value;
      const prompt = document.getElementById('cadgen-prompt').value.trim();

      let params = {};
      if (template === 'mounting_plate') {
        params = {
          length: parseFloat(document.getElementById('param-mp-length').value) || 100.0,
          width: parseFloat(document.getElementById('param-mp-width').value) || 80.0,
          thickness: parseFloat(document.getElementById('param-mp-thickness').value) || 6.0,
          hole_diameter: parseFloat(document.getElementById('param-mp-hole-dia').value) || 6.0,
          margin: parseFloat(document.getElementById('param-mp-margin').value) || 12.0
        };
      } else if (template === 'simple_bracket') {
        params = {
          arm1_length: parseFloat(document.getElementById('param-sb-l1').value) || 60.0,
          arm2_length: parseFloat(document.getElementById('param-sb-l2').value) || 50.0,
          width: parseFloat(document.getElementById('param-sb-w').value) || 30.0,
          thickness: parseFloat(document.getElementById('param-sb-t').value) || 5.0
        };
      } else if (template === 'spacer') {
        params = {
          outer_diameter: parseFloat(document.getElementById('param-sp-outer').value) || 30.0,
          inner_diameter: parseFloat(document.getElementById('param-sp-inner').value) || 12.0,
          height: parseFloat(document.getElementById('param-sp-height').value) || 15.0
        };
      } else if (template === 'cylindrical_adapter') {
        params = {
          base_diameter: parseFloat(document.getElementById('param-ca-base-d').value) || 40.0,
          base_length: parseFloat(document.getElementById('param-ca-base-l').value) || 15.0,
          stem_diameter: parseFloat(document.getElementById('param-ca-stem-d').value) || 24.0,
          stem_length: parseFloat(document.getElementById('param-ca-stem-l').value) || 25.0,
          bore_diameter: parseFloat(document.getElementById('param-ca-bore-d').value) || 12.0
        };
      }

      try {
        const resp = await fetch('/api/v1/designs/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt,
            template_type: template,
            parameters: params,
            units: 'mm',
            material_preference: material
          })
        });

        const data = await resp.json();
        if (!resp.ok) {
          showToast(data.detail || 'Parametric generation failed.', 'error');
          return;
        }

        latestGeneratedDesign = data;
        renderCadgenResult(data);
        showToast(`Synthesized 3D ${template} solid successfully!`, 'success');
        loadDesignRevisions(data.design_id);
      } catch (err) {
        showToast('Communication error during parametric generation.', 'error');
      } finally {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> Generate 3D Solid Geometry`;
        btn.disabled = false;
      }
    }

    function renderCadgenResult(data) {
      const card = document.getElementById('cadgen-result-card');
      card.style.display = 'block';

      document.getElementById('gen-res-id').innerText = data.design_id;
      document.getElementById('gen-res-summary').innerText = `100% Watertight solid synthesized from template '${data.template_type}'`;

      const bb = data.geometry.bounding_box;
      document.getElementById('gen-res-extents').innerText = `${bb.x} × ${bb.y} × ${bb.z} mm`;
      document.getElementById('gen-res-volume').innerText = `${data.geometry.volume_mm3 ? data.geometry.volume_mm3.toLocaleString() : 0} mm³ (${(data.geometry.volume_mm3/1000).toFixed(2)} cm³)`;
      document.getElementById('gen-res-area').innerText = `${data.geometry.surface_area_mm2.toLocaleString()} mm²`;
      document.getElementById('gen-res-facets').innerText = `${data.geometry.triangle_count.toLocaleString()}`;

      const dlBtn = document.getElementById('gen-res-download-btn');
      dlBtn.href = `/api/v1/designs/${data.design_id}/export?format=stl`;

      card.scrollIntoView({ behavior: 'smooth' });
    }

    // AI Design Improvement Request
    async function requestDesignImprovement() {
      if (!latestGeneratedDesign) {
        showToast('Please generate or select a CAD design first.', 'error');
        return;
      }

      const btn = document.getElementById('btn-run-improve');
      btn.innerHTML = `<span class="spinner"></span> Formulating Plan...`;
      btn.disabled = true;

      const payload = {
        user_requirements: document.getElementById('improve-reqs').value,
        intended_application: 'Industrial Machinery Application',
        manufacturing_process: document.getElementById('improve-process').value,
        material: document.getElementById('improve-material').value,
        execute_modifications: document.getElementById('improve-execute').checked
      };

      try {
        const resp = await fetch(`/api/v1/designs/${latestGeneratedDesign.design_id}/improvement-requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await resp.json();
        if (!resp.ok) {
          showToast(data.detail || 'Improvement plan request failed.', 'error');
          return;
        }

        renderImprovementPlan(data);
        showToast(data.status === 'REVISED' ? 'Revision v2 generated and verified!' : 'AI revision plan formulated!', 'success');
        loadDesignRevisions(latestGeneratedDesign.design_id);
      } catch (err) {
        showToast('Communication error requesting improvement plan.', 'error');
      } finally {
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Formulate Revision Plan`;
        btn.disabled = false;
      }
    }

    function renderImprovementPlan(plan) {
      const box = document.getElementById('improve-plan-result');
      box.style.display = 'block';

      let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <div style="font-weight:700; color:var(--primary); font-size:0.95rem;">
            Revision Proposal: ${plan.improvement_id}
          </div>
          <span class="badge ${plan.status === 'REVISED' ? 'badge-success' : 'badge-info'}">${plan.status}</span>
        </div>

        <div style="font-size:0.85rem; margin-bottom:0.75rem;">
          <strong style="color:var(--text-main);">Observations (Measured Physical Geometry):</strong>
          <ul style="padding-left:1.25rem; margin-top:0.25rem; color:var(--text-muted);">
            ${plan.observations.map(o => `<li>${o}</li>`).join('')}
          </ul>
        </div>

        <div style="font-size:0.85rem; margin-bottom:0.75rem;">
          <strong style="color:var(--text-main);">Assumptions:</strong>
          <ul style="padding-left:1.25rem; margin-top:0.25rem; color:var(--text-muted);">
            ${plan.assumptions.map(a => `<li>${a}</li>`).join('')}
          </ul>
        </div>

        <div style="font-size:0.85rem; margin-bottom:0.75rem;">
          <strong style="color:var(--text-main);">Proposed Modifications:</strong>
          <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem;">
            ${plan.proposed_modifications.map(m => `
              <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:0.65rem;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong>${m.operation} &rarr; ${m.target_feature}</strong>
                  <span class="badge ${m.is_executable ? 'badge-success' : 'badge-warning'}">${m.is_executable ? 'Executable' : 'B-Rep Recommendation'}</span>
                </div>
                <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.25rem;">${m.engineering_rationale}</div>
                <div style="font-size:0.75rem; color:var(--primary); margin-top:0.25rem;"><strong>Impact:</strong> ${m.feasibility_impact}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      if (plan.executed_revision) {
        html += `
          <div style="margin-top:1rem; padding:0.85rem; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:var(--radius-sm);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong style="color:var(--success);">✓ Immutable Revision v${plan.executed_revision.revision_number} Generated (${plan.executed_revision.revision_id})</strong>
              <a href="${plan.executed_revision.download_url}" target="_blank" class="btn btn-primary btn-sm">Download Revised STL</a>
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.4rem;">
              <strong>Delta Comparison:</strong> ${JSON.stringify(plan.comparison_report)}
            </div>
          </div>
        `;
      }

      box.innerHTML = html;
    }

    // Load Revisions History
    async function loadDesignRevisions(designId) {
      if (!designId) return;
      try {
        const resp = await fetch(`/api/v1/designs/${designId}/revisions`);
        if (!resp.ok) return;
        const revs = await resp.json();
        const tbody = document.getElementById('revisions-history-tbody');
        tbody.innerHTML = '';

        revs.forEach(r => {
          const row = document.createElement('tr');
          const dt = new Date(r.created_at).toLocaleString();
          const bb = r.geometry_snapshot.bounding_box || {};
          const extText = bb.x ? `${bb.x} × ${bb.y} × ${bb.z}` : '—';

          row.innerHTML = `
            <td class="mono font-weight-bold" style="color:var(--primary);">Revision v${r.revision_number}</td>
            <td style="font-size:0.75rem; color:var(--text-muted);">${dt}</td>
            <td style="font-size:0.82rem;">${r.change_summary}</td>
            <td class="mono" style="font-size:0.78rem;">${extText}</td>
            <td class="mono" style="font-size:0.78rem;">${(r.file_size_bytes/1024).toFixed(1)} KB</td>
            <td>
              <a href="/api/v1/designs/${r.design_id}/export?format=stl&revision_id=${r.revision_id}" target="_blank" class="btn btn-secondary btn-sm">Download STL</a>
            </td>
          `;
          tbody.appendChild(row);
        });
      } catch (e) {
        console.error('Error fetching revisions:', e);
      }
    }

    // Forwarding Helpers
    function forwardGenToMarketplace() {
      if (!latestGeneratedDesign) return;
      document.getElementById('mkt-design-id').value = latestGeneratedDesign.design_id;
      document.getElementById('mkt-title').value = `Parametric ${latestGeneratedDesign.template_type.replace('_', ' ').toUpperCase()} Mount`;
      document.getElementById('create-listing-panel').style.display = 'block';
      switchTab('tab-marketplace');
    }

    function forwardGenToQuote() {
      if (!latestGeneratedDesign) return;
      document.getElementById('quote-analysis-id').value = latestGeneratedDesign.design_id;
      switchTab('tab-quotes');
    }

    function forwardListingToQuote(listingId) {
      document.getElementById('quote-analysis-id').value = listingId;
      switchTab('tab-quotes');
    }

    function forwardAnalysisToImprovement() {
      if (!latestAnalysis) {
        showToast('Please upload & analyze an STL model first.', 'error');
        return;
      }
      switchTab('tab-cadgen');
      const promptEl = document.getElementById('cadgen-prompt');
      if (promptEl) {
        promptEl.value = `Optimize geometry for component: ${latestAnalysis.filename} with envelope ${latestAnalysis.geometry.bounding_box.x}x${latestAnalysis.geometry.bounding_box.y}x${latestAnalysis.geometry.bounding_box.z}mm`;
      }
      showToast('Switched to Text-to-CAD & Improvement Studio', 'success');
    }

    function forwardAnalysisToMarketplace() {
      if (!latestAnalysis) {
        showToast('Please upload & analyze an STL model first.', 'error');
        return;
      }
      switchTab('tab-marketplace');
      document.getElementById('create-listing-panel').style.display = 'block';
      document.getElementById('mkt-title').value = `Industrial Component: ${latestAnalysis.filename.replace('.stl','')}`;
      showToast('Switched to Marketplace with analyzed component context', 'success');
    }

    async function loadDesignsList() {
      try {
        const resp = await fetch('/api/v1/designs?limit=20');
        if (!resp.ok) return;
        const designs = await resp.json();

        const countEl = document.getElementById('stat-cad-designs');
        if (countEl) countEl.innerText = designs.length;

        // Populate Overview Designs Table
        const ovBody = document.getElementById('overview-designs-tbody');
        if (ovBody) {
          ovBody.innerHTML = '';
          if (designs.length === 0) {
            ovBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-dim); padding:1.2rem;">No CAD models registered yet. Try generating one in Studio!</td></tr>';
          } else {
            designs.slice(0, 5).forEach(d => {
              const bb = d.geometry ? d.geometry.bounding_box : null;
              const dimText = bb ? `${bb.x}×${bb.y}×${bb.z} mm` : '—';
              const row = document.createElement('tr');
              row.innerHTML = `
                <td class="mono font-weight-bold" style="color:var(--primary); font-size:0.78rem;">${d.id}</td>
                <td style="font-size:0.8rem; text-transform:capitalize;">${(d.template_type || d.source_type).replace('_', ' ')}</td>
                <td class="mono" style="font-size:0.75rem;">${dimText}</td>
                <td style="display:flex; gap:0.3rem;">
                  <a href="/api/v1/designs/${d.id}/export?format=stl" target="_blank" class="btn btn-secondary btn-sm" style="padding:0.2rem 0.5rem; font-size:0.72rem;">STL</a>
                  <button class="btn btn-secondary btn-sm" style="padding:0.2rem 0.5rem; font-size:0.72rem;" onclick="loadDesignInStudio('${d.id}')">Inspect</button>
                </td>
              `;
              ovBody.appendChild(row);
            });
          }
        }

        // Populate CADGen Studio Recent Table
        const cadgenBody = document.getElementById('cadgen-recent-tbody');
        if (cadgenBody) {
          cadgenBody.innerHTML = '';
          if (designs.length === 0) {
            cadgenBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-dim); padding:1.2rem;">No parametric models generated yet. Use the form above to synthesize geometry.</td></tr>';
          } else {
            designs.forEach(d => {
              const bb = d.geometry ? d.geometry.bounding_box : null;
              const dimText = bb ? `${bb.x} × ${bb.y} × ${bb.z}` : '—';
              const volText = d.geometry ? `${d.geometry.volume_mm3.toFixed(1)}` : '—';
              const row = document.createElement('tr');
              row.innerHTML = `
                <td class="mono font-weight-bold" style="color:var(--primary); font-size:0.82rem;">${d.id}</td>
                <td style="text-transform:capitalize; font-size:0.82rem;">${(d.template_type || d.source_type).replace('_', ' ')}</td>
                <td class="mono" style="font-size:0.8rem;">${dimText}</td>
                <td class="mono" style="font-size:0.8rem;">${volText}</td>
                <td><span class="badge badge-info">${d.active_revision_number ? 'v' + d.active_revision_number : 'v1'}</span></td>
                <td style="display:flex; gap:0.35rem;">
                  <a href="/api/v1/designs/${d.id}/export?format=stl" target="_blank" class="btn btn-primary btn-sm" style="padding:0.25rem 0.5rem; font-size:0.75rem;">Download</a>
                  <button class="btn btn-secondary btn-sm" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="loadDesignInStudio('${d.id}')">Improve</button>
                  <button class="btn btn-secondary btn-sm" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="publishDesignDirectly('${d.id}')">Publish</button>
                </td>
              `;
              cadgenBody.appendChild(row);
            });
          }
        }
      } catch (err) {
        console.error('Failed to load designs list:', err);
      }
    }

    async function loadDesignInStudio(designId) {
      switchTab('tab-cadgen');
      try {
        const resp = await fetch(`/api/v1/designs/${designId}`);
        if (!resp.ok) return;
        const d = await resp.json();
        latestGeneratedDesign = {
          design_id: d.id,
          template_type: d.template_type || 'custom',
          dimensions: d.geometry ? d.geometry.bounding_box : {},
          volume_mm3: d.geometry ? d.geometry.volume_mm3 : 0,
          surface_area_mm2: d.geometry ? d.geometry.surface_area_mm2 : 0,
          triangle_count: d.geometry ? d.geometry.triangle_count : 0,
          is_watertight: d.geometry ? d.geometry.is_watertight : true,
          download_url: `/api/v1/designs/${d.id}/export?format=stl`
        };
        displayGenerationResults(latestGeneratedDesign);
        loadDesignRevisions(d.id);
        showToast(`Loaded ${d.id} into AI Improvement Studio`, 'success');
      } catch (e) {
        showToast('Error loading design: ' + e, 'error');
      }
    }

    function publishDesignDirectly(designId) {
      document.getElementById('mkt-design-id').value = designId;
      document.getElementById('mkt-title').value = `Verified 3D Component (${designId})`;
      document.getElementById('create-listing-panel').style.display = 'block';
      switchTab('tab-marketplace');
      showToast('Pre-filled design for marketplace listing', 'success');
    }

    // Marketplace Management
    function toggleCreateListingForm() {
      const panel = document.getElementById('create-listing-panel');
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    function debounceMarketSearch() {
      clearTimeout(marketSearchTimeout);
      marketSearchTimeout = setTimeout(loadMarketplaceListings, 300);
    }

    async function loadMarketplaceListings() {
      const q = document.getElementById('market-search-q')?.value?.trim() || '';
      const cat = document.getElementById('market-filter-cat')?.value || '';
      const url = `/api/v1/marketplace/listings?q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`;

      try {
        const resp = await fetch(url);
        if (!resp.ok) return;
        const data = await resp.json();

        // Update Overview Marketplace counter
        const countEl = document.getElementById('stat-marketplace-count');
        if (countEl) countEl.innerText = data.total;

        // Populate Overview Marketplace table
        const ovMktBody = document.getElementById('overview-marketplace-tbody');
        if (ovMktBody) {
          ovMktBody.innerHTML = '';
          if (data.items.length === 0) {
            ovMktBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-dim); padding:1rem;">No listings created yet.</td></tr>';
          } else {
            data.items.slice(0, 5).forEach(item => {
              const statusClass = item.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning';
              const row = document.createElement('tr');
              row.innerHTML = `
                <td><strong>${item.title}</strong><div class="mono" style="font-size:0.7rem; color:var(--text-dim);">${item.listing_id}</div></td>
                <td><span class="badge badge-info" style="font-size:0.68rem;">${item.category}</span></td>
                <td class="mono font-weight-bold" style="color:var(--success);">$${item.indicative_price.toFixed(2)}</td>
                <td><span class="badge ${statusClass}">${item.status}</span></td>
                <td><button class="btn btn-secondary btn-sm" style="padding:0.2rem 0.5rem; font-size:0.72rem;" onclick="forwardListingToQuote('${item.listing_id}')">Quote</button></td>
              `;
              ovMktBody.appendChild(row);
            });
          }
        }

        const grid = document.getElementById('marketplace-grid');
        grid.innerHTML = '';

        if (data.items.length === 0) {
          grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-dim); padding: 3rem;">No marketplace listings found. Click "+ Create Draft Listing" to publish a design.</div>`;
          return;
        }


        data.items.forEach(item => {
          const card = document.createElement('div');
          card.className = 'card';
          card.style.margin = '0';
          card.style.display = 'flex';
          card.style.flexDirection = 'column';
          card.style.justifyContent = 'space-between';

          const statusClass = item.status === 'PUBLISHED' ? 'badge-success' : (item.status === 'DRAFT' ? 'badge-warning' : 'badge-secondary');

          card.innerHTML = `
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                <span class="badge ${statusClass}">${item.status}</span>
                <span class="mono" style="font-weight:800; color:var(--success); font-size:1.1rem;">$${item.indicative_price.toFixed(2)}</span>
              </div>
              <div style="font-weight:700; font-size:1rem; margin-bottom:0.25rem;">${item.title}</div>
              <div style="font-size:0.75rem; color:var(--primary); text-transform:uppercase; font-weight:700; margin-bottom:0.5rem;">${item.category}</div>
              <div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:0.75rem; line-height:1.4;">${item.description.substring(0, 120)}${item.description.length > 120 ? '...' : ''}</div>
              <div class="mono" style="font-size:0.7rem; color:var(--text-dim); margin-bottom:0.75rem;">Design: ${item.design_id}</div>
            </div>

            <div style="display:flex; gap:0.4rem; flex-wrap:wrap; padding-top:0.75rem; border-top:1px solid var(--border-subtle);">
              <button class="btn btn-primary btn-sm" onclick="forwardListingToQuote('${item.listing_id}')">Get Quote</button>
              ${item.status === 'DRAFT' ? `<button class="btn btn-secondary btn-sm" onclick="publishMarketplaceListing('${item.listing_id}')">Publish</button>` : ''}
              ${item.status === 'PUBLISHED' ? `<button class="btn btn-secondary btn-sm" onclick="archiveMarketplaceListing('${item.listing_id}')">Archive</button>` : ''}
              <a href="/api/v1/designs/${item.design_id}/export?format=stl" target="_blank" class="btn btn-secondary btn-sm">Download STL</a>
            </div>
          `;
          grid.appendChild(card);
        });
      } catch (err) {
        console.error('Error loading marketplace listings:', err);
      }
    }

    async function createMarketplaceListing() {
      const designId = document.getElementById('mkt-design-id').value.trim();
      const title = document.getElementById('mkt-title').value.trim();
      const desc = document.getElementById('mkt-desc').value.trim();
      const cat = document.getElementById('mkt-category').value;
      const price = parseFloat(document.getElementById('mkt-price').value) || 0.0;

      if (!designId || !title || !desc) {
        showToast('Please provide Design ID, Title, and Description.', 'error');
        return;
      }

      try {
        const resp = await fetch('/api/v1/marketplace/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            design_id: designId,
            title: title,
            description: desc,
            category: cat,
            indicative_price: price,
            material_options: ['aluminum_6061', 'pla', 'petg'],
            manufacturing_processes: ['cnc_machining_3axis', '3d_printing_fdm']
          })
        });

        const data = await resp.json();
        if (!resp.ok) {
          showToast(data.detail || 'Failed to create listing.', 'error');
          return;
        }

        showToast(`Draft listing '${data.title}' created!`, 'success');
        document.getElementById('create-listing-panel').style.display = 'none';
        loadMarketplaceListings();
      } catch (err) {
        showToast('Communication error creating listing.', 'error');
      }
    }

    async function publishMarketplaceListing(listingId) {
      const confirmed = confirm("Do you explicitly confirm that you own or hold authorized distribution rights for this CAD geometry? (IP Rights Declaration)");
      if (!confirmed) return;

      try {
        const resp = await fetch(`/api/v1/marketplace/listings/${listingId}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            confirm_ownership: true,
            accept_marketplace_terms: true
          })
        });

        const data = await resp.json();
        if (!resp.ok) {
          showToast(data.detail || 'Publishing failed.', 'error');
          return;
        }

        showToast(`Listing '${data.title}' published to marketplace!`, 'success');
        loadMarketplaceListings();
      } catch (err) {
        showToast('Communication error publishing listing.', 'error');
      }
    }

    async function archiveMarketplaceListing(listingId) {
      if (!confirm('Are you sure you want to retire and archive this listing?')) return;

      try {
        const resp = await fetch(`/api/v1/marketplace/listings/${listingId}/archive`, {
          method: 'POST'
        });

        const data = await resp.json();
        if (!resp.ok) {
          showToast(data.detail || 'Archiving failed.', 'error');
          return;
        }

        showToast('Listing archived.', 'success');
        loadMarketplaceListings();
      } catch (err) {
        showToast('Communication error archiving listing.', 'error');
      }
    }

    // Startup Initialization
    window.addEventListener('DOMContentLoaded', () => {
      updateCompatibleMaterials();
      fetchHealthData();
      loadOrders();
      loadDesignsList();
      loadMarketplaceListings();
      setInterval(fetchHealthData, 30000); // 30s heartbeat
    });
  </script>
</body>
</html>

"""


@router.get("/admin", response_class=HTMLResponse, include_in_schema=False)
@router.get("/dashboard", response_class=HTMLResponse, include_in_schema=False)
def get_admin_dashboard() -> HTMLResponse:
    """Serve the interactive SolidLabs AI Manufacturing Admin Dashboard."""
    return HTMLResponse(content=ADMIN_HTML, status_code=200)
