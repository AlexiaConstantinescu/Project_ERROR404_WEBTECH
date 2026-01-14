const { sequelize } = require('../config/database');

async function ensureColumn(table, column, type = 'uuid') {
    const query = `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS "${column}" ${type};`;
    try {
        await sequelize.query(query);
        console.log(`Ensured column ${column} on ${table}`);
    } catch (err) {
        console.error(`Failed to ensure ${column} on ${table}:`, err.message || err);
    }
}

async function run() {
    try {
        await sequelize.authenticate();
        console.log('DB connected — running schema fixes');

        // Add commonly missing snake_case FK columns (non-destructive)
        await ensureColumn('subjects', 'user_id');
        await ensureColumn('tags', 'user_id');
        await ensureColumn('notes', 'user_id');
        await ensureColumn('notes', 'subject_id');
        await ensureColumn('attachments', 'user_id');

        console.log('Schema check completed');
        process.exit(0);
    } catch (err) {
        console.error('Schema fix script failed:', err);
        process.exit(1);
    }
}

run();
