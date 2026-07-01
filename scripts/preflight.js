// Pre-build check: ensures essential files exist before EAS build
const fs = require('fs');
const required = [
  'App.js',
  'src/services/orderService.js',
  'src/lib/supabase.js',
  'src/lib/AuthContext.js',
  '.env',
];
let ok = true;
required.forEach(f => {
  if (!fs.existsSync(f)) {
    console.error(`❌ Missing: ${f}`);
    ok = false;
  }
});
if (ok) console.log('✅ Preflight checks passed.');
else process.exit(1);
