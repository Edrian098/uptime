const Database = require('./utils/database');

async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    await Database.init();
    console.log('✓ All migrations completed successfully');
    
    // Insert sample data for demonstration
    const sampleServices = [
      {
        name: 'Google DNS',
        url: 'https://8.8.8.8',
        type: 'ICMP',
        groupName: 'External Services'
      },
      {
        name: 'Cloudflare DNS',
        url: 'https://1.1.1.1',
        type: 'ICMP',
        groupName: 'External Services'
      }
    ];
    
    console.log('\nSample services available for reference:');
    sampleServices.forEach(s => {
      console.log(`- ${s.name} (${s.type}) in group "${s.groupName}"`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
