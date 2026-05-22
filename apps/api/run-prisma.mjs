import { spawnSync } from 'node:child_process';

const fallbackEnv = {
  DATABASE_URL:
    'mysql://task_user:task_password@localhost:3306/task_management',
  DATABASE_URL_TEST:
    'mysql://task_user:task_password@localhost:3306/task_management_test',
  SHADOW_DATABASE_URL:
    'mysql://task_user:task_password@localhost:3306/task_management_shadow',
};

const env = { ...process.env };

for (const [key, value] of Object.entries(fallbackEnv)) {
  if (!env[key]) {
    env[key] = value;
  }
}

const result = spawnSync('prisma', process.argv.slice(2), {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

if (typeof result.status === 'number') {
  process.exit(result.status);
}

if (result.error) {
  console.error(result.error.message);
}

process.exit(1);
