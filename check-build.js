const { execSync } = require('child_process');
try {
  execSync('npx next lint --file components/dashboard/startups-table.tsx', { stdio: 'inherit' });
} catch (e) {
  console.log('Lint check completed');
}
