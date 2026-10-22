import http from 'node:http';

const routes = [
  '/',
  '/cadastro',
  '/login',
  '/jogos',
  '/contos',
  '/jogos/tabuada-espacial',
  '/jogos/biomas',
  '/jogos/fracoes',
  '/jogos/matematica',
  '/jogos/portugues',
  '/jogos/ciencias',
  '/jogos/ingles',
  '/jogos/digitacao',
  '/pets',
  '/vila',
  '/ranking',
  '/missoes',
  '/perfil',
  '/responsavel'
];

async function checkRoute(route) {
  const url = `http://localhost:3000${route}`;
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        const isOk = res.statusCode === 200;
        const hasHtml = body.includes('<!DOCTYPE html>') || body.includes('<html');
        resolve({
          route,
          statusCode: res.statusCode,
          passed: isOk && hasHtml,
          length: body.length
        });
      });
    }).on('error', (err) => {
      resolve({
        route,
        passed: false,
        error: err.message
      });
    });
  });
}

async function run() {
  console.log(`🌐 INICIANDO SMOKE TEST DE TODAS AS ${routes.length} ROTAS DO KIDS-PLAYER...\n`);
  let errors = 0;

  for (const r of routes) {
    const res = await checkRoute(r);
    if (res.passed) {
      console.log(`✅ [${res.statusCode}] ${r.padEnd(25)} (${res.length} bytes HTML)`);
    } else {
      console.error(`❌ [${res.statusCode || 'ERR'}] ${r}: ${res.error || 'Falha ao carregar'}`);
      errors++;
    }
  }

  console.log('\n======================================================');
  console.log(`📊 Total: ${routes.length} rotas | Sucesso: ${routes.length - errors} | Falhas: ${errors}`);
  console.log('======================================================\n');
  process.exit(errors > 0 ? 1 : 0);
}

run();
