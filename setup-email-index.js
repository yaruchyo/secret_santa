// Script to create unique index on users.email field for security
// Run this once to ensure email uniqueness at the database level

import clientPromise from './lib/mongodb.js';

async function createUniqueEmailIndex() {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGO_DB_NAME);

        // Create unique index on email field
        const result = await db.collection('users').createIndex(
            { email: 1 },
            { unique: true, name: 'unique_email_index' }
        );

        console.log('✅ Unique email index created successfully:', result);
        console.log('📧 Users can no longer have duplicate emails at the database level');

        process.exit(0);
    } catch (error) {
        if (error.code === 85) {
            console.log('ℹ️  Index already exists, no action needed');
            process.exit(0);
        } else {
            console.error('❌ Error creating index:', error);
            process.exit(1);
        }
    }
}

createUniqueEmailIndex();
