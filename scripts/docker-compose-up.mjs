import { spawnSync } from 'node:child_process';

const mode = process.argv[2];

const upOptions = {
  '--build': ['--build'],
  '--no-build': ['--no-build'],
};

const selectedOptions = upOptions[mode] ?? upOptions['--no-build'];

const runDocker = (args) => {
  const result = spawnSync('docker', args, {
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`Failed to run docker ${args.join(' ')}.`);
    console.error(result.error.message);
    process.exit(1);
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    process.exit(result.status);
  }
};

runDocker(['compose', 'up', '-d', '--wait', ...selectedOptions]);

console.log('');
console.log('App URLs');
console.log('Web: http://localhost:5173');
console.log('API: http://localhost:4000');
console.log('MySQL: localhost:3306');
console.log('');
console.log('Container status');
runDocker(['compose', 'ps']);
console.log('');
console.log('Recent logs');
runDocker(['compose', 'logs', '--tail=20', 'mysql', 'api', 'web']);
console.log('');
console.log('Follow live logs with: yarn docker:logs');
