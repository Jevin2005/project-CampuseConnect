const r2 = require('./services/r2.service');

async function run() {
  console.log('Configuring R2 bucket CORS...');
  await r2.ensureBucketCors();
  process.exit(0);
}

run();
