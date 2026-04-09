import { execSync } from 'child_process';

console.log('Running Prisma migration...');

try {
  // Generate Prisma client with new schema
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Push schema changes to database
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('✓ Database schema updated successfully');
} catch (error) {
  console.error('✗ Migration failed:', error);
  process.exit(1);
}
