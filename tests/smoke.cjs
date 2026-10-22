// Headless logic/render smoke checks. Does not replace browser visual QA.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const nodes = new Map();
const handlers = {};
function node(key) {
  if (!nodes.has(key)) nodes.set(key, {innerHTML:'',textContent:'',open:false,classList:{add(){},remove(){},toggle(){return true}},showModal(){this.open=true},close(){this.open=false},focus(){},setAttribute(){}});
  return nodes.get(key);
}
const context = vm.createContext({
  document:{querySelector:node,addEventListener:(type,fn)=>handlers[type]=fn,body:node('body'),activeElement:{tagName:'BODY'}},
  window:{addEventListener(){},scrollTo(){},print(){}},location:{hash:'#dashboard'},history:{replaceState(){}},
  console,setTimeout:()=>1,clearTimeout(){},Date,FormData:class{constructor(f){return Object.entries(f.values)[Symbol.iterator]()}},URL,Blob
});
for(const file of ['data.js','app.js']) vm.runInContext(fs.readFileSync(__dirname+'/../dist/'+file,'utf8'),context);
function run(code){return vm.runInContext(code,context)}
assert.equal(run('SOC.routes.length'),18);
for(const module of ['A','B','C']) assert.equal(run(`SOC.routes.filter(r=>r[4]==='${module}').length`),6);
for(const [id,title] of run('SOC.routes')) {
 run(`location.hash='#${id}';render()`);
 assert.ok(node('#app').innerHTML.length>700, id+' should render');
 assert.ok(node('#app').innerHTML.includes(title)||id==='login', id+' heading');
}
run("state.role='Analyst';location.hash='#users';render()");
assert.ok(node('#app').innerHTML.includes('Administrator workspace'));
run("state.role='Admin';state.filter.severity='Critical'");
assert.equal(run('filteredAlerts().length'),2);
run("state.filter.q='missing'");assert.equal(run('filteredAlerts().length'),0);
run("state.report.from='2026-10-22';state.report.to='2026-10-22'");
assert.equal(run('reportRows().length'),5);
assert.equal(run("validIP('203.0.113.24')"),true);
assert.equal(run("validIP('999.0.0.1')"),false);
assert.equal(run("validIP('01.0.0.1')"),false);
assert.equal(run("esc('<script>')"),'&lt;script&gt;');
run("state.selected='ALT-2048';location.hash='#threat-details/ALT-2048';setAlertStatus('Closed')");
assert.equal(run("state.alerts.find(x=>x.id==='ALT-2048').status"),'Closed');
assert.ok(run("state.activities[0].action.includes('ALT-2048')"));
function submit(id,values,dataset={}) {handlers.submit({preventDefault(){},target:{id,values,dataset,querySelectorAll(){return []}}});}
submit('user-form',{name:'Test Analyst',email:'test@example.com',role:'Analyst',status:'Active'},{});
assert.equal(run('state.users.length'),4);
submit('user-form',{name:'Duplicate',email:'test@example.com',role:'Analyst',status:'Active'},{});
assert.equal(run('state.users.length'),4);
submit('ip-form',{ip:'999.1.1.1',reason:'Invalid',policy:'Blocked'});
assert.equal(run('state.ips.length'),3);
submit('ip-form',{ip:'192.0.2.100',reason:'Test fixture',policy:'Blocked'});
assert.equal(run('state.ips.length'),4);
submit('settings-form',{sensor:'Lab',address:'10.0.0.10',subnet:'10.0.0.0/24'}, {kind:'network-settings'});
assert.equal(run("state.settings['network-settings'].sensor"),'Lab');
submit('lookup-form',{ip:'203.0.113.24'});assert.equal(run('state.lookup'),'203.0.113.24');
for(const period of ['24h','7d','30d']) {run(`state.period='${period}'`); assert.ok(run('lineChart()').includes('polyline'));}
console.log('PASS: 18 routes, 6-per-module coverage, role guard, filters, date filtering, status changes, escaping, IPv4 validation, user/IP forms, settings, lookup, and chart periods.');
console.log('NOT VERIFIED: browser layout, keyboard focus, native downloads and print dialog.');
