from pathlib import Path
p=Path('src/components/Game.tsx');s=p.read_text(encoding='utf8')
s=s.replace("const [tab,setTab]=useState<Tab>('hub')", "const [sidebarOpen,setSidebarOpen]=useState(false);\nconst [tab,setTab]=useState<Tab>('hub')")
s=s.replace('<div className="v10-top-label">ARK // ACCESS-LIMITED', '<button className="v68-sidebar-toggle" aria-expanded={sidebarOpen} onClick={()=>setSidebarOpen(!sidebarOpen)}>직원·상태 {sidebarOpen?\'접기\':\'열기\'}</button><div className="v10-top-label">ARK // ACCESS-LIMITED')
p.write_text(s,encoding='utf8')
p=Path('src/app/v68.css');s=p.read_text(encoding='utf8');s+='''
/* Keep the play field above the fold; expand personnel only on request on phones. */
.v68-sidebar-toggle{display:none}.v45-roster:not(:has(.arrived)) .v45-roster-grid{display:none}
@media(min-width:1051px){.field-grid{aspect-ratio:auto;height:clamp(270px,45dvh,510px)}.field-grid.is-hunt{min-height:360px}.field-header h2{font-size:22px}.field-objective{padding:8px 12px;margin:8px 0}.field-help{margin:6px 0;font-size:14px}.field-radio{min-height:44px;padding:8px 12px;margin-top:6px}.field-v68{padding:10px}.field-controls{margin-top:8px}}
@media(max-width:760px){.v10-shell .v10-sidebar{display:none!important}.v10-shell:has(.v68-sidebar-toggle[aria-expanded=true]) .v10-sidebar{display:grid!important}.v68-sidebar-toggle{display:block;min-height:44px;min-width:88px;font-size:14px;white-space:nowrap;padding:8px;background:var(--ui-surface);border:1px solid var(--ui-line)}.v10-top{gap:6px;display:flex!important;align-items:center}.v10-top nav{min-width:0!important;overflow-x:auto;flex:1}.v10-main{min-height:0!important}.v10-shell{min-height:100dvh}.v10-core{padding-bottom:0!important}.field-header>button{padding:6px 9px}.field-help{font-size:13px}.v53-telemetry,.v58-telemetry,.v59-telemetry{max-width:70vw}}
''';p.write_text(s,encoding='utf8')
# Silence actual flex compatibility warnings without changing grid alignment.
p=Path('src/app/globals.css');s=p.read_text(encoding='utf8');s=s.replace('align-items:end','align-items:flex-end').replace('align-items:start','align-items:flex-start').replace('justify-content:end','justify-content:flex-end').replace('justify-content:start','justify-content:flex-start');p.write_text(s,encoding='utf8')
