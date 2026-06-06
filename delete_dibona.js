const Database = require('better-sqlite3');
const db = new Database('./dev.db');

try {
  // Check Site
  console.log('--- SITE ---');
  console.log(db.prepare('SELECT * FROM Site').all());
  
  // Check SystemSetting
  console.log('--- SETTINGS ---');
  console.log(db.prepare('SELECT * FROM SystemSetting').all());

  // Find User Dibona
  console.log('--- FIND DIBONA ---');
  const dibonas = db.prepare('SELECT id, name, email FROM User WHERE email LIKE \'%dibona%\' OR name LIKE \'%DIBONA%\'').all();
  console.log(dibonas);

  for (const user of dibonas) {
    console.log('Deleting user:', user.email);
    // Find reservations
    const reservations = db.prepare('SELECT id FROM Reservation WHERE clientId = ?').all(user.id);
    for (const res of reservations) {
      db.prepare('DELETE FROM KycData WHERE reservationId = ?').run(res.id);
    }
    db.prepare('DELETE FROM Reservation WHERE clientId = ?').run(user.id);
    db.prepare('DELETE FROM GuestPreferences WHERE userId = ?').run(user.id);
    db.prepare('DELETE FROM LoyaltyProgram WHERE userId = ?').run(user.id);
    db.prepare('DELETE FROM Transaction WHERE userId = ?').run(user.id);
    db.prepare('DELETE FROM Review WHERE userId = ?').run(user.id);
    db.prepare('DELETE FROM User WHERE id = ?').run(user.id);
  }
  
  console.log('--- DONE ---');
} catch (e) {
  console.error(e);
} finally {
  db.close();
}
