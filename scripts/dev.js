const { spawn } = require('child_process');
const port = process.env.PORT || '3001';
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const child = spawn(npx, ['next', 'dev', '-p', port], {
  stdio: 'inherit',
});
child.on('exit', (code) => process.exit(code ?? 0));
