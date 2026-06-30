const fs = require('fs');
const required = ['App.js', 'src/services/firebase.js', 'src/services/orderService.js', '.env.example'];
let ok = true;
for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing: ${file}`);
    ok = false;
  }
}
if (!ok) process.exit(1);
console.log('BrewHouse preflight passed.');
