"""SolidLabs AI 3D Design Studio Route.

Provides an interactive, CAD-grade Three.js 3D workspace for loading, viewing,
analyzing, and transforming 3D STL models with real-time before-and-after
geometric comparison, synchronized dual viewers, and direct manufacturing exports.
"""

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter()

STUDIO_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SolidLabs — AI 3D Design Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

  <!-- Three.js + OrbitControls + STLLoader from reliable high-availability CDNs -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/STLLoader.js"></script>

  <style>
    :root {
      --bg-base: #060911;
      --bg-panel: rgba(13, 21, 38, 0.88);
      --bg-panel-solid: #0d1526;
      --bg-card: rgba(17, 27, 49, 0.75);
      --bg-card-hover: rgba(26, 39, 68, 0.9);
      --bg-input: #0B1120;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-focus: #00F0FF;
      --primary: #00F0FF;
      --primary-glow: rgba(0, 240, 255, 0.28);
      --primary-dark: #00B4D8;
      --accent-purple: #A855F7;
      --accent-blue: #3B82F6;
      --accent-amber: #F59E0B;
      --success: #10B981;
      --danger: #EF4444;
      --text-main: #F8FAFC;
      --text-muted: #94A3B8;
      --text-dim: #64748B;
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 16px;
      --transition-fast: 0.18s ease;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: radial-gradient(circle at 10% 10%, #0d172e 0%, #060911 80%);
      color: var(--text-main);
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Top Studio Header */
    header {
      background: rgba(10, 16, 30, 0.92);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid var(--border-subtle);
      height: 56px;
      padding: 0 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 50;
      flex-shrink: 0;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
    }

    .brand-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 16px var(--primary-glow);
    }

    .brand-icon svg { width: 18px; height: 18px; fill: #060911; }
    .brand-title { font-weight: 800; font-size: 1.1rem; letter-spacing: -0.02em; }
    .brand-badge {
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 700;
      background: rgba(0, 240, 255, 0.12);
      color: var(--primary);
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      border: 1px solid rgba(0, 240, 255, 0.25);
    }

    .header-center-tools {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .tool-chip {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.3rem 0.65rem;
      font-size: 0.78rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      cursor: pointer;
      user-select: none;
      transition: all var(--transition-fast);
      color: var(--text-muted);
    }

    .tool-chip:hover {
      color: var(--text-main);
      border-color: rgba(0, 240, 255, 0.3);
      background: rgba(255, 255, 255, 0.04);
    }

    .tool-chip.active {
      color: var(--primary);
      border-color: var(--primary);
      background: rgba(0, 240, 255, 0.1);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      padding: 0.45rem 0.9rem;
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all var(--transition-fast);
      text-decoration: none;
    }

    .btn-primary {
      background: var(--primary);
      color: #060911;
      box-shadow: 0 2px 10px var(--primary-glow);
    }
    .btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-main);
      border: 1px solid var(--border-subtle);
    }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.12); border-color: rgba(255,255,255,0.18); }
    .btn-sm { padding: 0.3rem 0.6rem; font-size: 0.75rem; }

    /* Main Studio Grid Layout */
    .studio-layout {
      flex: 1;
      display: grid;
      grid-template-columns: 380px 1fr;
      grid-template-rows: 1fr;
      overflow: hidden;
      position: relative;
    }

    @media (max-width: 900px) {
      .studio-layout { grid-template-columns: 1fr; grid-template-rows: auto 1fr; overflow-y: auto; }
      body { overflow-y: auto; }
    }

    /* Left Sidebar: Controls & Parameters */
    .sidebar {
      background: var(--bg-panel);
      backdrop-filter: blur(12px);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      padding: 1.25rem;
      gap: 1.25rem;
      z-index: 20;
    }

    .sidebar-section {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1rem;
    }

    .section-title {
      font-size: 0.82rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--primary);
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    /* Drop Zone */
    .dropzone {
      border: 2px dashed rgba(0, 240, 255, 0.3);
      border-radius: var(--radius-sm);
      padding: 1.25rem 0.75rem;
      text-align: center;
      background: rgba(11, 17, 32, 0.4);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .dropzone:hover, .dropzone.dragover {
      border-color: var(--primary);
      background: rgba(0, 240, 255, 0.06);
    }
    .dropzone svg { width: 32px; height: 32px; stroke: var(--primary); margin-bottom: 0.35rem; }
    .dropzone-title { font-size: 0.85rem; font-weight: 600; }
    .dropzone-hint { font-size: 0.72rem; color: var(--text-dim); margin-top: 0.2rem; }

    /* Sample models picker chips */
    .sample-models-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.4rem;
      margin-top: 0.75rem;
    }

    .sample-chip {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.4rem 0.5rem;
      font-size: 0.72rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: all var(--transition-fast);
      color: var(--text-muted);
    }
    .sample-chip:hover {
      background: rgba(0, 240, 255, 0.08);
      border-color: var(--primary);
      color: var(--text-main);
    }

    /* Form Controls */
    .form-group { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.85rem; }
    .form-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
    .form-control {
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      color: var(--text-main);
      padding: 0.55rem 0.75rem;
      font-family: inherit;
      font-size: 0.82rem;
      outline: none;
      transition: border-color var(--transition-fast);
      width: 100%;
    }
    .form-control:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px var(--primary-glow);
    }

    /* Prompt Example Chips */
    .examples-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-bottom: 0.85rem;
    }

    .prompt-chip {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.4rem 0.65rem;
      font-size: 0.76rem;
      color: var(--text-muted);
      cursor: pointer;
      text-align: left;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .prompt-chip:hover {
      background: rgba(0, 240, 255, 0.08);
      border-color: var(--primary);
      color: var(--primary);
    }

    /* Progress Stepper */
    .stepper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      margin: 0.85rem 0 0.5rem 0;
    }
    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      z-index: 2;
    }
    .step-dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #111827;
      border: 2px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--text-dim);
      transition: all var(--transition-fast);
    }
    .step-item.active .step-dot {
      border-color: var(--primary);
      background: var(--primary);
      color: #060911;
      box-shadow: 0 0 10px var(--primary-glow);
    }
    .step-item.completed .step-dot {
      border-color: var(--success);
      background: var(--success);
      color: #060911;
    }
    .step-label {
      font-size: 0.65rem;
      color: var(--text-dim);
      font-weight: 600;
      text-transform: uppercase;
    }
    .step-item.active .step-label { color: var(--primary); }
    .step-item.completed .step-label { color: var(--success); }

    /* Main Area: Dual Viewers */
    .workspace-main {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      position: relative;
    }

    .viewers-container {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      position: relative;
      background: #04070E;
    }

    @media (max-width: 900px) {
      .viewers-container { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; height: 600px; }
    }

    .viewer-pane {
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--border-subtle);
    }
    .viewer-pane:last-child { border-right: none; }

    .viewer-canvas {
      width: 100%;
      height: 100%;
      display: block;
      outline: none;
    }

    /* Viewer HUD Overlays */
    .viewer-header-hud {
      position: absolute;
      top: 0.85rem;
      left: 0.85rem;
      right: 0.85rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      pointer-events: none;
      z-index: 10;
    }

    .viewer-badge {
      pointer-events: auto;
      background: rgba(11, 17, 32, 0.82);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.35rem 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .viewer-badge.original { border-left: 3px solid #3B82F6; color: #93C5FD; }
    .viewer-badge.modified { border-left: 3px solid var(--primary); color: var(--primary); }

    .viewer-hud-controls {
      pointer-events: auto;
      display: flex;
      gap: 0.35rem;
    }

    .hud-btn {
      background: rgba(11, 17, 32, 0.82);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .hud-btn:hover { color: var(--text-main); border-color: var(--primary); background: rgba(0, 240, 255, 0.1); }
    .hud-btn svg { width: 14px; height: 14px; }

    /* Dimensions & Info Card HUD at bottom of viewer */
    .viewer-footer-hud {
      position: absolute;
      bottom: 0.85rem;
      left: 0.85rem;
      right: 0.85rem;
      pointer-events: none;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .hud-metrics-card {
      pointer-events: auto;
      background: rgba(11, 17, 32, 0.88);
      backdrop-filter: blur(10px);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.5rem 0.75rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      display: flex;
      gap: 0.85rem;
    }

    .metric-item { display: flex; flex-direction: column; gap: 0.15rem; }
    .metric-label { font-size: 0.62rem; color: var(--text-dim); text-transform: uppercase; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; }
    .metric-val { font-weight: 600; color: var(--text-main); }
    .metric-val.highlight { color: var(--primary); }

    /* Empty state overlay for modified viewer */
    .empty-viewer-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
      background: radial-gradient(circle at center, rgba(13, 21, 38, 0.6) 0%, rgba(6, 9, 17, 0.95) 100%);
      pointer-events: none;
      z-index: 5;
    }
    .empty-viewer-overlay.hidden { display: none; }
    .empty-viewer-icon {
      width: 54px; height: 54px; border-radius: 50%;
      border: 2px dashed rgba(0, 240, 255, 0.3);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 0.85rem; color: var(--primary);
    }
    .empty-viewer-title { font-weight: 700; font-size: 0.95rem; margin-bottom: 0.35rem; }
    .empty-viewer-subtitle { font-size: 0.78rem; color: var(--text-dim); max-width: 320px; line-height: 1.4; }

    /* Bottom Inspection & Comparison Drawer */
    .bottom-drawer {
      background: rgba(10, 16, 30, 0.95);
      backdrop-filter: blur(14px);
      border-top: 1px solid var(--border-subtle);
      padding: 0.85rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      flex-shrink: 0;
      z-index: 30;
      flex-wrap: wrap;
    }

    .comparison-summary {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex: 1;
      min-width: 280px;
    }

    .summary-badge {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: var(--success);
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      flex-shrink: 0;
    }

    .summary-text { font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; }

    .drawer-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    /* Loading Spinner */
    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Toast */
    #toast-container {
      position: fixed;
      bottom: 1.25rem;
      right: 1.25rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .toast {
      background: #0f172a;
      border: 1px solid var(--border-subtle);
      color: var(--text-main);
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.82rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      animation: slideIn 0.2s ease;
      min-width: 260px;
    }
    .toast.toast-success { border-color: var(--success); }
    .toast.toast-error { border-color: var(--danger); }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  </style>
</head>
<body>

  <!-- Top Studio Header -->
  <header>
    <a href="/admin" class="brand" title="Return to Admin Dashboard">
      <div class="brand-icon">
        <svg viewBox="0 0 24 24"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18s-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18s.41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15zM5 8.95v6.1l6 3.37v-6.1L5 8.95zm14 6.1v-6.1l-6 3.37v6.1l6-3.37z"/></svg>
      </div>
      <div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="brand-title">SolidLabs AI Design Studio</span>
          <span class="brand-badge">Three.js CAD Kernel</span>
        </div>
      </div>
    </a>

    <!-- Center Viewport Controls -->
    <div class="header-center-tools">
      <div class="tool-chip active" id="btn-sync-cameras" onclick="toggleCameraSync()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        <span>Sync Cameras</span>
      </div>
      <div class="tool-chip" onclick="resetBothCameras()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        <span>Reset View</span>
      </div>
      <div class="tool-chip" onclick="fitBothCameras()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
        <span>Fit Geometry</span>
      </div>
      <div class="tool-chip" id="btn-wireframe-toggle" onclick="toggleWireframeMode()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <span>Wireframe</span>
      </div>
    </div>

    <!-- Header Actions -->
    <div class="header-actions">
      <a href="/admin" class="btn btn-secondary btn-sm">
        Admin Portal
      </a>
      <a href="/api/v1/docs" target="_blank" class="btn btn-secondary btn-sm">
        API Docs
      </a>
    </div>
  </header>

  <!-- Main Studio Workspace -->
  <div class="studio-layout">

    <!-- Left Sidebar: Upload, History, and AI Transformation Controls -->
    <aside class="sidebar">

      <!-- Section 1: Ingest & Load 3D Model -->
      <div class="sidebar-section">
        <div class="section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          1. Upload or Select CAD Model
        </div>

        <input type="file" id="file-input-stl" accept=".stl" style="display: none;" onchange="handleLocalFileUpload(event)">
        <div class="dropzone" id="stl-dropzone" onclick="document.getElementById('file-input-stl').click()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <div class="dropzone-title" id="dropzone-label">Click to Browse or Drag & Drop STL</div>
          <div class="dropzone-hint">Renders real 3D mesh in browser with Three.js</div>
        </div>

        <div style="margin-top: 0.75rem;">
          <div style="font-size: 0.72rem; color: var(--text-dim); margin-bottom: 0.35rem; font-weight: 600;">Or Instant 1-Click Parametric Samples:</div>
          <div class="sample-models-grid">
            <div class="sample-chip" onclick="loadSampleTemplate('simple_bracket')">
              <span>📐</span> L-Bracket
            </div>
            <div class="sample-chip" onclick="loadSampleTemplate('mounting_plate')">
              <span>🔲</span> Mounting Plate
            </div>
            <div class="sample-chip" onclick="loadSampleTemplate('spacer')">
              <span>🔘</span> Spacer Bushing
            </div>
            <div class="sample-chip" onclick="loadSampleTemplate('cylindrical_adapter')">
              <span>⚙️</span> Stepped Adapter
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: AI Modification Panel -->
      <div class="sidebar-section">
        <div class="section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          2. Describe 3D Geometric Modification
        </div>

        <div class="form-group">
          <label class="form-label">Example Engineering Modification Prompts:</label>
          <div class="examples-wrapper">
            <div class="prompt-chip" onclick="selectPromptExample('Make this bracket stronger.')">
              <span>⚡</span> “Make this bracket stronger.”
            </div>
            <div class="prompt-chip" onclick="selectPromptExample('Add two mounting holes.')">
              <span>🔩</span> “Add two mounting holes.”
            </div>
            <div class="prompt-chip" onclick="selectPromptExample('Increase the thickness to 5 mm.')">
              <span>📏</span> “Increase the thickness to 5 mm.”
            </div>
            <div class="prompt-chip" onclick="selectPromptExample('Scale the model by 1.2x.')">
              <span>🔍</span> “Scale the model by 1.2x.”
            </div>
            <div class="prompt-chip" onclick="selectPromptExample('Generate a modified version for 3D printing.')">
              <span>🖨️</span> “Generate a modified version for 3D printing.”
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Natural Language Request</label>
          <textarea class="form-control" id="prompt-input" rows="3" placeholder="Describe mechanical modification... e.g. Add two M5 mounting holes, scale by 1.2x, thicken walls..."></textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem;">
          <div class="form-group">
            <label class="form-label">Target Process</label>
            <select class="form-control" id="select-process">
              <option value="3d_printing_fdm">3D Printing (FDM)</option>
              <option value="cnc_machining_3axis">CNC 3-Axis Milling</option>
              <option value="3d_printing_sla">3D Printing (SLA)</option>
              <option value="3d_printing_sls">3D Printing (SLS)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Material</label>
            <select class="form-control" id="select-material">
              <option value="aluminum_6061">Aluminum 6061</option>
              <option value="pla">PLA Polymer</option>
              <option value="petg">PETG</option>
              <option value="steel_1018">Steel 1018</option>
              <option value="nylon">Nylon PA12</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem;">
          <div class="form-group">
            <label class="form-label">Units</label>
            <select class="form-control" id="select-units">
              <option value="mm">Millimeters (mm)</option>
              <option value="inch">Inches (in)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Operation Override</label>
            <select class="form-control" id="select-operation-override">
              <option value="">Auto (AI Interpreted)</option>
              <option value="make_stronger">Make Stronger (+25% thick)</option>
              <option value="add_mounting_holes">Drill Mounting Holes</option>
              <option value="thicken_dimension">Thicken Dimension</option>
              <option value="scale_geometry">Scale Geometry</option>
              <option value="optimize_for_3d_printing">Optimize for 3D Print</option>
              <option value="rotate_geometry">Rotate 90°</option>
            </select>
          </div>
        </div>

        <!-- Progress Stepper -->
        <div class="stepper" id="progress-stepper">
          <div class="step-item" id="step-1">
            <div class="step-dot">1</div>
            <div class="step-label">Upload</div>
          </div>
          <div class="step-item" id="step-2">
            <div class="step-dot">2</div>
            <div class="step-label">Analyze</div>
          </div>
          <div class="step-item" id="step-3">
            <div class="step-dot">3</div>
            <div class="step-label">Generate</div>
          </div>
          <div class="step-item" id="step-4">
            <div class="step-dot">4</div>
            <div class="step-label">Validate</div>
          </div>
          <div class="step-item" id="step-5">
            <div class="step-dot">5</div>
            <div class="step-label">Ready</div>
          </div>
        </div>

        <button class="btn btn-primary" id="btn-execute-transform" style="width: 100%; margin-top: 0.5rem;" onclick="executeAITransformation()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <span id="btn-transform-text">Execute AI 3D Transformation</span>
        </button>
      </div>

      <!-- Section 3: Model & Revision History -->
      <div class="sidebar-section">
        <div class="section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          3. Revision History
        </div>
        <div id="revision-history-list" style="display: flex; flex-direction: column; gap: 0.4rem; max-height: 180px; overflow-y: auto;">
          <div style="font-size: 0.75rem; color: var(--text-dim); text-align: center; padding: 0.75rem;">No revisions generated yet.</div>
        </div>
      </div>

    </aside>

    <!-- Main Viewport: Dual Side-by-Side 3D Viewers -->
    <main class="workspace-main">
      <div class="viewers-container">

        <!-- LEFT VIEWER: Original Model -->
        <div class="viewer-pane" id="pane-original">
          <div class="viewer-header-hud">
            <div class="viewer-badge original">
              <span>● ORIGINAL 3D MODEL</span>
              <span id="hud-orig-name" style="color:var(--text-main); font-weight:600; font-family:'JetBrains Mono', monospace;">No model loaded</span>
            </div>
            <div class="viewer-hud-controls">
              <button class="hud-btn" onclick="fitCamera(viewerOriginal)" title="Fit to View">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              </button>
              <button class="hud-btn" onclick="resetCamera(viewerOriginal)" title="Reset Camera">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </button>
            </div>
          </div>

          <canvas class="viewer-canvas" id="canvas-original"></canvas>

          <div class="viewer-footer-hud">
            <div class="hud-metrics-card" id="hud-orig-metrics">
              <div class="metric-item">
                <span class="metric-label">Dimensions (X×Y×Z)</span>
                <span class="metric-val" id="metric-orig-dim">— × — × — mm</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Solid Volume</span>
                <span class="metric-val highlight" id="metric-orig-vol">— mm³</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Facets</span>
                <span class="metric-val" id="metric-orig-faces">—</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Watertight</span>
                <span class="metric-val" id="metric-orig-manifold">—</span>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT VIEWER: AI-Modified Model -->
        <div class="viewer-pane" id="pane-modified">
          <div class="viewer-header-hud">
            <div class="viewer-badge modified">
              <span>⚡ AI-MODIFIED 3D MODEL</span>
              <span id="hud-mod-rev" style="color:var(--text-main); font-weight:600; font-family:'JetBrains Mono', monospace;">Awaiting transformation</span>
            </div>
            <div class="viewer-hud-controls">
              <button class="hud-btn" onclick="fitCamera(viewerModified)" title="Fit to View">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              </button>
              <button class="hud-btn" onclick="resetCamera(viewerModified)" title="Reset Camera">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </button>
            </div>
          </div>

          <canvas class="viewer-canvas" id="canvas-modified"></canvas>

          <!-- Placeholder when empty -->
          <div class="empty-viewer-overlay" id="empty-modified-overlay">
            <div class="empty-viewer-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div class="empty-viewer-title">Awaiting 3D Geometry Transformation</div>
            <div class="empty-viewer-subtitle">Select or upload a model on the left, pick an engineering prompt, and click “Execute AI Transformation”.</div>
          </div>

          <div class="viewer-footer-hud" id="hud-mod-footer" style="display:none;">
            <div class="hud-metrics-card">
              <div class="metric-item">
                <span class="metric-label">Dimensions (X×Y×Z)</span>
                <span class="metric-val" id="metric-mod-dim">— × — × — mm</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Solid Volume</span>
                <span class="metric-val highlight" id="metric-mod-vol">— mm³</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Volume Delta</span>
                <span class="metric-val" id="metric-mod-delta" style="color:var(--success);">0%</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Watertight</span>
                <span class="metric-val" id="metric-mod-manifold" style="color:var(--success);">100% Watertight</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom Drawer: Comparison Delta, Summaries, and Working Export Buttons -->
      <footer class="bottom-drawer">
        <div class="comparison-summary">
          <div class="summary-badge" id="drawer-status-badge">
            <span id="drawer-status-dot">●</span>
            <span id="drawer-status-text">Ready for Input</span>
          </div>
          <div class="summary-text" id="drawer-summary-text">
            Upload an STL file or choose a sample to inspect 3D geometry and apply modifications.
          </div>
        </div>

        <div class="drawer-actions">
          <button class="btn btn-secondary btn-sm" onclick="resetToOriginalModel()" id="btn-reset-original" title="Revert to baseline original model">
            ↺ Reset to Original
          </button>
          <button class="btn btn-secondary btn-sm" onclick="executeAITransformation()" id="btn-regenerate" title="Regenerate with current parameters">
            ⚡ Regenerate
          </button>
          <a href="#" class="btn btn-primary btn-sm" id="btn-download-stl" style="display: none;" target="_blank">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Generated STL
          </a>
          <button class="btn btn-secondary btn-sm" id="btn-download-step" style="display: none;" onclick="requestStepDownload()">
            Download STEP
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-quote-forward" style="display: none;" onclick="forwardToQuotation()">
            Get Manufacturing Quote &rarr;
          </button>
        </div>
      </footer>
    </main>

  </div>

  <!-- Toast Notification Container -->
  <div id="toast-container"></div>

  <!-- Three.js Dual Viewer & Transformation JavaScript Architecture -->
  <script>
    // State management
    let activeDesignId = null;
    let activeDesignData = null;
    let latestTransformResult = null;
    let syncCamerasEnabled = true;
    let wireframeModeActive = false;

    // Viewport instances
    let viewerOriginal = null;
    let viewerModified = null;

    // Initialize Viewport Class
    class CADViewer {
      constructor(canvasId, isOriginal = true) {
        this.canvas = document.getElementById(canvasId);
        this.isOriginal = isOriginal;
        this.currentMesh = null;
        this.currentWireframe = null;

        // Scene, Camera, Renderer
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x04070E);

        const aspect = this.canvas.clientWidth / this.canvas.clientHeight || 1;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 5000);
        this.camera.position.set(120, 100, 150);

        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true,
          alpha: true
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;

        // OrbitControls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.screenSpacePanning = true;

        // Lighting (CAD Studio Preset)
        this.setupLighting();

        // Helpers (Grid + Axes)
        this.setupHelpers();

        // Animation Loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);

        // Window resize binding
        window.addEventListener('resize', () => this.onResize());
      }

      setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
        this.scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 0.85);
        keyLight.position.set(150, 200, 150);
        this.scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x00F0FF, 0.35);
        fillLight.position.set(-150, 100, -100);
        this.scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xA855F7, 0.25);
        rimLight.position.set(0, -150, 0);
        this.scene.add(rimLight);
      }

      setupHelpers() {
        // Floor Grid
        const grid = new THREE.GridHelper(300, 30, 0x00F0FF, 0x1E293B);
        grid.position.y = -0.1;
        grid.material.opacity = 0.25;
        grid.material.transparent = true;
        this.scene.add(grid);

        // XYZ Axes Helper (RGB = XYZ)
        const axes = new THREE.AxesHelper(35);
        this.scene.add(axes);
      }

      onResize() {
        if (!this.canvas) return;
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        if (width === 0 || height === 0) return;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      }

      animate() {
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
      }

      loadFromBuffer(arrayBuffer, customColor = null) {
        if (this.currentMesh) {
          this.scene.remove(this.currentMesh);
          this.currentMesh.geometry.dispose();
          this.currentMesh = null;
        }

        const loader = new THREE.STLLoader();
        const geometry = loader.parse(arrayBuffer);
        geometry.computeVertexNormals();
        geometry.center();

        const baseColor = customColor || (this.isOriginal ? 0x60A5FA : 0x00F0FF);
        const material = new THREE.MeshStandardMaterial({
          color: baseColor,
          metalness: 0.5,
          roughness: 0.35,
          wireframe: wireframeModeActive
        });

        this.currentMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.currentMesh);

        this.fitToView();
        return geometry;
      }

      fitToView() {
        if (!this.currentMesh) return;
        const box = new THREE.Box3().setFromObject(this.currentMesh);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z) || 50;
        const fov = this.camera.fov * (Math.PI / 180);
        const cameraDistance = Math.abs(maxDim / 1.5 / Math.tan(fov / 2));

        this.camera.position.set(cameraDistance * 0.9, cameraDistance * 0.7, cameraDistance);
        this.camera.lookAt(center);
        this.controls.target.copy(center);
        this.controls.update();
      }

      resetCamera() {
        if (this.currentMesh) {
          this.fitToView();
        } else {
          this.camera.position.set(120, 100, 150);
          this.controls.target.set(0, 0, 0);
          this.controls.update();
        }
      }
    }

    // Camera Sync Controller
    let isSyncing = false;
    function syncCameraPair(sourceControls, targetCamera, targetControls) {
      if (!syncCamerasEnabled || isSyncing) return;
      isSyncing = true;
      targetCamera.position.copy(sourceControls.object.position);
      targetCamera.quaternion.copy(sourceControls.object.quaternion);
      targetCamera.zoom = sourceControls.object.zoom;
      targetCamera.updateProjectionMatrix();
      targetControls.target.copy(sourceControls.target);
      targetControls.update();
      isSyncing = false;
    }

    function toggleCameraSync() {
      syncCamerasEnabled = !syncCamerasEnabled;
      const chip = document.getElementById('btn-sync-cameras');
      if (syncCamerasEnabled) {
        chip.classList.add('active');
        showToast('Camera synchronization enabled', 'success');
      } else {
        chip.classList.remove('active');
        showToast('Cameras decoupled (independent control)', 'info');
      }
    }

    function resetBothCameras() {
      if (viewerOriginal) viewerOriginal.resetCamera();
      if (viewerModified) viewerModified.resetCamera();
    }

    function fitBothCameras() {
      if (viewerOriginal) viewerOriginal.fitToView();
      if (viewerModified) viewerModified.fitToView();
    }

    function toggleWireframeMode() {
      wireframeModeActive = !wireframeModeActive;
      const chip = document.getElementById('btn-wireframe-toggle');
      if (wireframeModeActive) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }

      [viewerOriginal, viewerModified].forEach(v => {
        if (v && v.currentMesh) {
          v.currentMesh.material.wireframe = wireframeModeActive;
          v.currentMesh.material.needsUpdate = true;
        }
      });
    }

    // Step Progress Visualizer
    function setStepProgress(stepNum) {
      for (let i = 1; i <= 5; i++) {
        const el = document.getElementById(`step-${i}`);
        if (!el) continue;
        el.classList.remove('active', 'completed');
        if (i < stepNum) el.classList.add('completed');
        else if (i === stepNum) el.classList.add('active');
      }
    }

    // Prompt Selection Helper
    function selectPromptExample(promptText) {
      document.getElementById('prompt-input').value = promptText;
      // Smart pre-select operation dropdown if appropriate
      const opSelect = document.getElementById('select-operation-override');
      if (promptText.includes('stronger')) opSelect.value = 'make_stronger';
      else if (promptText.includes('mounting holes')) opSelect.value = 'add_mounting_holes';
      else if (promptText.includes('thickness')) opSelect.value = 'thicken_dimension';
      else if (promptText.includes('Scale')) opSelect.value = 'scale_geometry';
      else if (promptText.includes('3D printing')) opSelect.value = 'optimize_for_3d_printing';
      else opSelect.value = '';
    }

    // 1-Click Parametric Sample Loader
    async function loadSampleTemplate(templateType) {
      setStepProgress(1);
      updateStatusBadge('Synthesizing Sample...', 'loading');
      document.getElementById('dropzone-label').innerText = `Generating ${templateType}...`;

      try {
        const resp = await fetch('/api/v1/designs/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Standard parametric ${templateType.replace('_', ' ')} component`,
            template_type: templateType,
            units: 'mm'
          })
        });

        if (!resp.ok) {
          showToast(`Failed to synthesize ${templateType}`, 'error');
          return;
        }

        const data = await resp.json();
        activeDesignId = data.design_id;
        activeDesignData = data;

        setStepProgress(2);
        updateStatusBadge('Rendering 3D Mesh...', 'loading');

        // Fetch STL arrayBuffer directly
        const stlResp = await fetch(data.export_stl_url);
        const buffer = await stlResp.arrayBuffer();

        // Render in Original Viewer
        viewerOriginal.loadFromBuffer(buffer, 0x60A5FA);

        // Update HUD
        document.getElementById('hud-orig-name').innerText = `${templateType}.stl (${data.design_id})`;
        const bb = data.geometry.bounding_box;
        document.getElementById('metric-orig-dim').innerText = `${bb.x} × ${bb.y} × ${bb.z} mm`;
        document.getElementById('metric-orig-vol').innerText = `${data.geometry.volume_mm3 ? data.geometry.volume_mm3.toLocaleString() : '0'} mm³`;
        document.getElementById('metric-orig-faces').innerText = data.geometry.triangle_count.toLocaleString();
        document.getElementById('metric-orig-manifold').innerText = data.geometry.is_watertight ? '✓ Watertight' : 'Non-watertight';

        // Update Drawer
        updateStatusBadge('Original Loaded', 'success');
        document.getElementById('drawer-summary-text').innerText = `Loaded ${templateType} (${bb.x}×${bb.y}×${bb.z} mm). Enter modification description or select an example above.`;

        // Add to Revision History
        updateRevisionHistory([{
          revision_number: 1,
          revision_id: data.revision_id,
          change_summary: `Initial parametric synthesis (${templateType})`
        }]);

        setStepProgress(5);
        showToast(`Loaded ${templateType.replace('_', ' ')} solid model!`, 'success');
      } catch (err) {
        showToast('Error generating sample: ' + err, 'error');
        updateStatusBadge('Error', 'error');
      }
    }

    // Local STL File Upload Handler
    async function handleLocalFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith('.stl')) {
        showToast('Please select a valid .stl mesh file.', 'error');
        return;
      }

      setStepProgress(1);
      updateStatusBadge('Reading Local STL...', 'loading');
      document.getElementById('dropzone-label').innerText = file.name;

      // 1. Read arrayBuffer locally and immediately render into Three.js viewer!
      const reader = new FileReader();
      reader.onload = async function(e) {
        const buffer = e.target.result;
        try {
          viewerOriginal.loadFromBuffer(buffer, 0x60A5FA);
          document.getElementById('hud-orig-name').innerText = file.name;
          showToast(`Rendered ${file.name} in interactive 3D viewer!`, 'success');
        } catch (err) {
          showToast('Failed to parse STL geometry in viewer.', 'error');
        }

        // 2. Upload to backend for server-side persistence & analysis
        setStepProgress(2);
        updateStatusBadge('Registering on Backend...', 'loading');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('units', document.getElementById('select-units').value);
        formData.append('process', document.getElementById('select-process').value);

        try {
          const resp = await fetch('/api/v1/designs/upload', {
            method: 'POST',
            body: formData
          });

          if (!resp.ok) {
            const err = await resp.json();
            showToast(err.detail || 'Upload failed.', 'error');
            return;
          }

          const data = await resp.json();
          activeDesignId = data.design.design_id;
          activeDesignData = data;

          // Update HUD metrics
          const geom = data.geometry;
          const bb = geom.bounding_box;
          document.getElementById('metric-orig-dim').innerText = `${bb.x} × ${bb.y} × ${bb.z} mm`;
          document.getElementById('metric-orig-vol').innerText = `${geom.volume_mm3 ? geom.volume_mm3.toLocaleString() : '0'} mm³`;
          document.getElementById('metric-orig-faces').innerText = geom.triangle_count.toLocaleString();
          document.getElementById('metric-orig-manifold').innerText = geom.is_watertight ? '✓ Watertight' : 'Non-watertight';

          updateStatusBadge('Original Verified', 'success');
          document.getElementById('drawer-summary-text').innerText = `Registered ${file.name} (${bb.x}×${bb.y}×${bb.z} mm). Ready for AI transformation.`;

          updateRevisionHistory([{
            revision_number: 1,
            revision_id: data.revision.revision_id,
            change_summary: `Initial upload: ${file.name}`
          }]);

          setStepProgress(5);
        } catch (err) {
          showToast('Backend upload communication error: ' + err, 'error');
        }
      };
      reader.readAsArrayBuffer(file);
    }

    // Drag and Drop listeners
    const dropzoneEl = document.getElementById('stl-dropzone');
    ['dragenter', 'dragover'].forEach(name => {
      dropzoneEl.addEventListener(name, (e) => { e.preventDefault(); dropzoneEl.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(name => {
      dropzoneEl.addEventListener(name, (e) => { e.preventDefault(); dropzoneEl.classList.remove('dragover'); });
    });
    dropzoneEl.addEventListener('drop', (e) => {
      if (e.dataTransfer.files.length) {
        document.getElementById('file-input-stl').files = e.dataTransfer.files;
        handleLocalFileUpload({ target: { files: e.dataTransfer.files } });
      }
    });

    // Execute Real AI 3D Transformation
    async function executeAITransformation() {
      if (!activeDesignId) {
        showToast('Please upload or select an STL model first.', 'error');
        return;
      }

      const promptText = document.getElementById('prompt-input').value.trim();
      if (!promptText) {
        showToast('Please enter a modification request or select an example prompt chip.', 'error');
        return;
      }

      const btn = document.getElementById('btn-execute-transform');
      const btnText = document.getElementById('btn-transform-text');
      btn.disabled = true;
      btnText.innerHTML = `<span class="spinner"></span> Synthesizing 3D Geometry...`;

      // Visual Stepper Progression
      setStepProgress(3); // Generating
      updateStatusBadge('Executing Geometry Engine...', 'loading');

      const opOverride = document.getElementById('select-operation-override').value || null;
      const payload = {
        prompt: promptText,
        operation: opOverride,
        units: document.getElementById('select-units').value,
        manufacturing_process: document.getElementById('select-process').value,
        material: document.getElementById('select-material').value
      };

      try {
        const resp = await fetch(`/api/v1/designs/${activeDesignId}/transform`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await resp.json();

        if (!resp.ok || !data.success) {
          setStepProgress(1);
          updateStatusBadge('Modification Rejected', 'error');
          const errDetail = data.error_message || data.detail || 'Could not execute modification.';
          showToast(errDetail, 'error');
          document.getElementById('drawer-summary-text').innerHTML = `<span style="color:var(--danger); font-weight:600;">⚠️ ${errDetail}</span>`;
          return;
        }

        setStepProgress(4); // Validating
        updateStatusBadge('Validating 3D Manifold...', 'loading');

        latestTransformResult = data;

        // Fetch newly synthesized STL mesh directly from backend
        const stlResp = await fetch(data.model_url);
        const buffer = await stlResp.arrayBuffer();

        // Load into RIGHT viewer (Modified)
        viewerModified.loadFromBuffer(buffer, 0x00F0FF);
        document.getElementById('empty-modified-overlay').classList.add('hidden');
        document.getElementById('hud-mod-footer').style.display = 'flex';
        document.getElementById('hud-mod-rev').innerText = `Revision v${data.new_revision_number} (${data.operation_performed})`;

        // Update Right Viewer HUD metrics
        const mGeom = data.generated_geometry;
        const mBb = mGeom.bounding_box;
        document.getElementById('metric-mod-dim').innerText = `${mBb.x} × ${mBb.y} × ${mBb.z} mm`;
        document.getElementById('metric-mod-vol').innerText = `${mGeom.volume_mm3 ? mGeom.volume_mm3.toLocaleString() : '0'} mm³`;

        const vDelta = data.comparison_delta ? data.comparison_delta.volume_change_pct : 0;
        const deltaEl = document.getElementById('metric-mod-delta');
        deltaEl.innerText = `${vDelta > 0 ? '+' : ''}${vDelta}%`;
        deltaEl.style.color = vDelta >= 0 ? 'var(--primary)' : 'var(--accent-amber)';

        // Bottom drawer update
        updateStatusBadge('v' + data.new_revision_number + ' Ready', 'success');
        document.getElementById('drawer-summary-text').innerHTML = `
          <strong>${data.operation_performed.toUpperCase()}:</strong> ${data.change_summary}
          <span style="margin-left:0.5rem; color:var(--text-dim);">(Vol: ${data.original_geometry.volume_mm3} → ${mGeom.volume_mm3} mm³)</span>
        `;

        // Working Download Buttons
        const btnStl = document.getElementById('btn-download-stl');
        btnStl.href = data.download_stl_url;
        btnStl.style.display = 'inline-flex';

        document.getElementById('btn-download-step').style.display = 'inline-flex';
        document.getElementById('btn-quote-forward').style.display = 'inline-flex';

        // Add to Revision History
        addRevisionToHistory(data.new_revision_number, data.new_revision_id, data.change_summary);

        setStepProgress(5); // Complete!
        showToast(`Synthesized Revision v${data.new_revision_number} successfully!`, 'success');

        // Automatically sync cameras to identical angle
        if (syncCamerasEnabled) {
          syncCameraPair(viewerOriginal.controls, viewerModified.camera, viewerModified.controls);
        }
      } catch (err) {
        showToast('Communication error during transformation: ' + err, 'error');
        updateStatusBadge('Error', 'error');
      } finally {
        btn.disabled = false;
        btnText.innerText = 'Execute AI 3D Transformation';
      }
    }

    // Reset to Original Model
    function resetToOriginalModel() {
      if (!activeDesignData) return;
      document.getElementById('empty-modified-overlay').classList.remove('hidden');
      document.getElementById('hud-mod-footer').style.display = 'none';
      document.getElementById('btn-download-stl').style.display = 'none';
      document.getElementById('btn-download-step').style.display = 'none';
      document.getElementById('btn-quote-forward').style.display = 'none';

      if (viewerModified && viewerModified.currentMesh) {
        viewerModified.scene.remove(viewerModified.currentMesh);
        viewerModified.currentMesh = null;
      }

      updateStatusBadge('Reset to Original', 'info');
      document.getElementById('drawer-summary-text').innerText = 'Reverted active workspace to original baseline revision v1.';
      showToast('Reset to original baseline model.', 'info');
    }

    // STEP Download Handler
    async function requestStepDownload() {
      if (!latestTransformResult || !latestTransformResult.download_step_url) {
        showToast('No generated model available for STEP export.', 'error');
        return;
      }

      try {
        const resp = await fetch(latestTransformResult.download_step_url);
        if (resp.status === 501) {
          const data = await resp.json();
          alert(`STEP Export Notice:\n\n${data.detail}\n\nSTL format contains the complete mathematical solid geometry and is ready for download.`);
          return;
        }
        if (resp.ok) {
          window.open(latestTransformResult.download_step_url, '_blank');
        } else {
          showToast('STEP export is unavailable in current CAD kernel environment.', 'error');
        }
      } catch (e) {
        showToast('Could not initiate STEP export: ' + e, 'error');
      }
    }

    function forwardToQuotation() {
      if (!activeDesignId) return;
      window.location.href = `/admin#tab-quotes`;
    }

    function updateStatusBadge(text, state = 'info') {
      const badge = document.getElementById('drawer-status-badge');
      const dot = document.getElementById('drawer-status-dot');
      const textEl = document.getElementById('drawer-status-text');

      textEl.innerText = text;
      if (state === 'loading') {
        dot.innerHTML = '<span class="spinner" style="width:10px;height:10px;"></span>';
        badge.style.color = 'var(--primary)';
        badge.style.borderColor = 'var(--primary)';
      } else if (state === 'success') {
        dot.innerHTML = '●';
        badge.style.color = 'var(--success)';
        badge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      } else if (state === 'error') {
        dot.innerHTML = '⚠';
        badge.style.color = 'var(--danger)';
        badge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      } else {
        dot.innerHTML = '●';
        badge.style.color = 'var(--text-muted)';
        badge.style.borderColor = 'var(--border-subtle)';
      }
    }

    function updateRevisionHistory(revs) {
      const container = document.getElementById('revision-history-list');
      container.innerHTML = '';
      revs.forEach(r => {
        addRevisionToHistory(r.revision_number, r.revision_id, r.change_summary);
      });
    }

    function addRevisionToHistory(revNum, revId, summary) {
      const container = document.getElementById('revision-history-list');
      const div = document.createElement('div');
      div.style.cssText = 'background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:0.45rem 0.65rem; font-size:0.75rem;';
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.15rem;">
          <strong style="color:var(--primary);">Revision v${revNum}</strong>
          <span class="mono" style="font-size:0.68rem; color:var(--text-dim);">${revId.substring(0, 10)}...</span>
        </div>
        <div style="color:var(--text-muted); font-size:0.72rem; line-height:1.3;">${summary}</div>
      `;
      container.prepend(div);
    }

    function showToast(message, type = 'success') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.innerHTML = `<span style="font-weight:700;">${type === 'success' ? '✓' : (type === 'error' ? '⚠' : 'ℹ')}</span><div>${message}</div>`;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    // Startup Initialization
    window.addEventListener('DOMContentLoaded', () => {
      // Initialize Three.js Viewers
      viewerOriginal = new CADViewer('canvas-original', true);
      viewerModified = new CADViewer('canvas-modified', false);

      // Bind OrbitControls camera sync
      viewerOriginal.controls.addEventListener('change', () => {
        syncCameraPair(viewerOriginal.controls, viewerModified.camera, viewerModified.controls);
      });
      viewerModified.controls.addEventListener('change', () => {
        syncCameraPair(viewerModified.controls, viewerOriginal.camera, viewerOriginal.controls);
      });

      // Automatically load the L-Bracket sample on startup so viewer is never empty!
      loadSampleTemplate('simple_bracket');
    });
  </script>
</body>
</html>
"""


@router.get("/studio", response_class=HTMLResponse, include_in_schema=False)
@router.get("/ai-studio", response_class=HTMLResponse, include_in_schema=False)
@router.get("/3d-studio", response_class=HTMLResponse, include_in_schema=False)
def get_ai_3d_studio() -> HTMLResponse:
    """Serve the SolidLabs interactive Three.js AI 3D Design Studio."""
    return HTMLResponse(content=STUDIO_HTML, status_code=200)
