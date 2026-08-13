import { motion, AnimatePresence } from 'framer-motion';

function defaultPosition(i) {
  return { x_pct: (i % 2) * 50 + 25, y_pct: Math.min(85, 28 + i * 9) };
}

function Block({ component, index, visible, building }) {
  const pos = component.position || defaultPosition(index);
  const w = pos.w_pct ?? 70;
  const h = pos.h_pct ?? 12;
  const style = { ...(component.style || {}) };

  let node;
  switch (component.type) {
    case 'image':
      node = component.props?.src ? (
        <img src={component.props.src} alt={component.props.alt || ''} className="h-full w-full rounded object-cover" style={{ objectPosition: 'center' }} />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded bg-gray-100 text-xs text-gray-400">image</div>
      );
      break;
    case 'button':
      node = (
        <span className="inline-flex items-center justify-center rounded px-6 py-2.5 text-sm font-semibold text-white shadow-sm"
          style={{ background: 'var(--m-primary, #4338ca)', borderRadius: style.borderRadius || '10px' }}>
          {component.props?.text || 'Button'}
        </span>
      );
      break;
    case 'input':
      node = (
        <span className="inline-flex w-full items-center rounded-lg border bg-white px-3 py-2 text-sm text-gray-400 shadow-sm"
          style={{ borderColor: 'var(--m-text, #111)', borderRadius: style.borderRadius || '8px' }}>
          {component.props?.placeholder || 'input'}
        </span>
      );
      break;
    case 'list':
      node = (
        <ul className="space-y-1 text-sm text-gray-600">
          {(component.props?.items || ['Item one', 'Item two']).slice(0, 5).map((item, i) => (
            <li key={i}>• {item}</li>
          ))}
        </ul>
      );
      break;
    case 'card':
      node = (
        <div className="h-full w-full rounded-xl border bg-white p-4 shadow-sm"
          style={{ borderColor: 'var(--m-primary, #4338ca)', borderRadius: style.borderRadius || '16px' }}>
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="mt-2 h-2 w-full rounded bg-gray-100" />
          <div className="mt-1 h-2 w-3/4 rounded bg-gray-100" />
        </div>
      );
      break;
    case 'divider':
      node = <hr className="border-t" style={{ borderColor: 'var(--m-text, #111)' }} />;
      break;
    case 'spacer':
      node = null;
      break;
    case 'icon_grid':
      node = (
        <div className="grid h-full w-full grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-indigo-100" />
          ))}
        </div>
      );
      break;
    default:
      node = (
        <span style={style} className="block text-gray-800">
          {component.props?.text || ''}
        </span>
      );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
      animate={{ 
        opacity: visible || building ? 1 : 0, 
        scale: visible || building ? 1 : 0.9,
        filter: visible || building ? 'blur(0px)' : 'blur(4px)'
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`absolute ${building ? 'z-10' : 'z-0'}`}
      style={{
        left: `${pos.x_pct - w / 2}%`,
        top: `${pos.y_pct - h / 2}%`,
        width: `${w}%`,
        height: `${h}%`,
        borderRadius: '8px',
      }}
    >
      <div className={`relative h-full w-full transition-all duration-300 ${building ? 'scale-[1.02]' : 'scale-100'}`}>
        {building && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 rounded-lg border-2 border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
          >
            <motion.div 
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute inset-0 rounded-lg opacity-50"
              style={{
                backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                backgroundSize: '200% 100%'
              }}
            />
          </motion.div>
        )}
        <div className={`h-full w-full transition-opacity duration-300 ${building ? 'opacity-30 grayscale' : 'opacity-100'}`}>
          {node}
        </div>
      </div>
    </motion.div>
  );
}

export default function DesignCanvas({ tree, builtIds = null, cursor = null, buildingId = null }) {
  if (!tree) {
    return (
      <div className="flex aspect-[16/9] flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-gray-200 bg-[#f9fafb] p-8 text-center text-[#667085]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Waiting for design stream</p>
          <p className="mt-1 text-xs text-gray-500">The design will appear here block by block as the AI builds it.</p>
        </div>
      </div>
    );
  }

  const tokens = tree.tokens || {};
  const cssVars = {
    '--m-primary': tokens.colors?.primary || '#4338ca',
    '--m-secondary': tokens.colors?.secondary || '#14b8a6',
    '--m-bg': tokens.colors?.bg || '#ffffff',
    '--m-text': tokens.colors?.text || '#0f172a',
    '--m-accent': tokens.colors?.accent || '#f59e0b',
  };

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200/60 bg-white p-2 shadow-sm ring-1 ring-black/[0.02]">
      <div className="relative overflow-hidden rounded-xl bg-gray-50" style={cssVars}>
        {(tree.sections || []).map((section) => (
          <div key={section.id} className="relative mb-4 aspect-[16/9] w-full overflow-hidden border border-gray-100 shadow-sm"
            style={{ background: 'var(--m-bg, #fff)' }}>
            <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white shadow-sm backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              {section.name || section.id}
            </div>
            
            {(section.components || []).map((component, i) => {
              const id = component.id;
              const visible = builtIds ? builtIds.has(id) : true;
              return (
                <Block key={id} component={component} index={i}
                  visible={visible} building={buildingId === id} />
              );
            })}
          </div>
        ))}

        <AnimatePresence>
          {cursor && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                left: `${cursor.x_pct}%`, 
                top: `${cursor.y_pct}%`,
                opacity: 1, 
                scale: 1 
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ 
                left: { type: "spring", stiffness: 170, damping: 22, mass: 0.8 },
                top: { type: "spring", stiffness: 170, damping: 22, mass: 0.8 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 }
              }}
              className="pointer-events-none absolute z-50 flex items-start gap-1"
              style={{ originX: 0, originY: 0 }}
            >
              {/* Premium Cursor SVG matching UX Pilot style */}
              <svg width="28" height="32" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_2px_8px_rgba(79,70,229,0.4)]">
                <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7871 12.3673H5.65376Z" fill="#4F46E5" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
              <div className="mt-4 rounded-full border border-indigo-500/20 bg-indigo-600/95 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-lg backdrop-blur-sm">
                AI Designer
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}