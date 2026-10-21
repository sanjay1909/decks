// The components' drawn identities: plain inline SVG on a 64×64 grid, one stroke style (currentColor, 3px,
// round joins), so each icon takes its colour from the piece it sits in and works in light and dark.
// Written in a slide as <i class="ic" data-icon="name"></i>; build.mjs inlines them.
export const ICONS = {
  // a VM's window with a scan image in it
  vm: `<rect x="4" y="8" width="56" height="48" rx="5"/><path d="M4 19h56"/><circle class="f" cx="11" cy="13.5" r="1.8"/><circle class="f" cx="17" cy="13.5" r="1.8"/><circle class="f" cx="23" cy="13.5" r="1.8"/>
       <rect x="13" y="25" width="38" height="24" rx="2"/><ellipse cx="32" cy="37" rx="11" ry="8"/><ellipse cx="32" cy="37" rx="4" ry="3"/><path class="thin" d="M13 37h7M44 37h7"/>`,
  // the OS file client: a folder handing out a file
  client: `<path d="M5 18h18l5 6h31v26a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M5 24h54"/><path class="thin" d="M26 39h20M40 33l6 6-6 6"/>`,
  // the network: a wire between two ports, a packet riding it
  net: `<circle cx="7" cy="32" r="4"/><circle cx="57" cy="32" r="4"/><path d="M11 32h42"/><rect class="f net-pkt" x="17" y="27" width="12" height="10" rx="2"/>`,
  // PowerScale: a cluster of four node blades
  blades: `<rect x="6" y="5" width="52" height="11" rx="2.5"/><rect x="6" y="19" width="52" height="11" rx="2.5"/><rect x="6" y="33" width="52" height="11" rx="2.5"/><rect x="6" y="47" width="52" height="11" rx="2.5"/>
       <circle class="f led" cx="13" cy="10.5" r="2"/><circle class="f led" cx="13" cy="24.5" r="2"/><circle class="f led" cx="13" cy="38.5" r="2"/><circle class="f led" cx="13" cy="52.5" r="2"/>
       <path class="thin" d="M22 10.5h28M22 24.5h28M22 38.5h28M22 52.5h28"/>`,
  // the collector: a clipboard with a pulse on it (a probe beside the path)
  probe: `<rect x="12" y="10" width="40" height="48" rx="4"/><rect x="23" y="5" width="18" height="10" rx="3"/><path d="M18 36h7l4-9 6 17 4-8h7"/>`,
  // InfluxDB: a stacked time-series store
  tsdb: `<ellipse cx="32" cy="12" rx="22" ry="7"/><path d="M10 12v38c0 4 10 7 22 7s22-3 22-7V12"/><path d="M10 25c0 4 10 7 22 7s22-3 22-7M10 38c0 4 10 7 22 7s22-3 22-7"/>`,
  // Footprint evidence: a receipt / ledger
  receipt: `<path d="M14 5h36v52l-6-4-6 4-6-4-6 4-6-4-6 4z"/><path class="thin" d="M21 16h22M21 24h22M21 32h14"/><path d="M33 43l4 4 8-9"/>`,
  // a device response: a document holding braces
  doc: `<path d="M14 5h26l12 12v42H14z"/><path d="M40 5v12h12"/><path class="thin" d="M27 28c-4 0-4 2-4 5s-2 4-4 4c2 0 4 1 4 4s0 5 4 5M39 28c4 0 4 2 4 5s2 4 4 4c-2 0-4 1-4 4s0 5-4 5"/>`,
  // a window of polls: bars over time
  bars: `<path d="M6 56h52"/><path d="M12 50V36M20 50V26M28 50V40M36 50V20M44 50V30M52 50V34"/>`,
};
