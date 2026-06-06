const Database = require('better-sqlite3');
const db = new Database('prisma/dev.db');

try {
  db.exec('ALTER TABLE "Room" ADD COLUMN "cleaningStatus" TEXT NOT NULL DEFAULT \'CLEAN\'');
  console.log("Column added to prisma/dev.db");
} catch (e) {
  if (e.message.includes('duplicate column name')) {
    console.log("Column already exists.");
  } else {
    // try the root dev.db
    const db2 = new Database('dev.db');
    try {
      db2.exec('ALTER TABLE "Room" ADD COLUMN "cleaningStatus" TEXT NOT NULL DEFAULT \'CLEAN\'');
      console.log("Column added to dev.db");
    } catch (e2) {
       console.log("Failed on dev.db as well:", e2.message);
    }
  }
}
