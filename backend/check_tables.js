import { query } from './db.js';

(async function(){
  try {
    const rows = await query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = 'doctrack'");
    console.log('tables:', rows.map(r => r.TABLE_NAME));
  } catch (e) {
    console.error('db error', e.message);
  }
})();
