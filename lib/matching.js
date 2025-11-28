import nodemailer from 'nodemailer';

import { ObjectId } from 'mongodb';

export async function runMatching(db, eventId) {
    console.log('runMatching called for event:', eventId);
    const event = await db.collection('events').findOne({ _id: eventId });

    if (!event || event.status !== 'active') {
        console.log('Event not found or not active, status:', event?.status);
        return;
    }

    // Fetch participant details
    const userIds = event.participants.map(p => new ObjectId(p.userId));
    const users = await db.collection('users').find({ _id: { $in: userIds } }).toArray();
    const userMap = users.reduce((acc, u) => {
        acc[u._id.toString()] = u;
        return acc;
    }, {});

    const participants = event.participants.map(p => ({
        ...p,
        email: userMap[p.userId]?.email || p.email,
        name: userMap[p.userId]?.name || p.name
    })).filter(p => p.email && p.name); // Filter out invalid users
    if (participants.length < 2) {
        console.log('Not enough participants:', participants.length);
        return; // Need at least 2 people
    }

    console.log('Running matching for', participants.length, 'participants');

    // Fisher-Yates shuffle for proper randomization
    const shuffled = [...participants];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Assign: i gives to i+1 (last gives to first)
    // This creates a circular chain ensuring:
    // 1. No one gets themselves
    // 2. Everyone gets exactly one person
    // 3. Everyone is assigned to give to exactly one person
    const assignments = shuffled.map((giver, index) => {
        const receiver = shuffled[(index + 1) % shuffled.length];
        return {
            giverEmail: giver.email,
            receiverName: receiver.name,
            receiverWishlist: receiver.wishlist
        };
    });

    // Update DB FIRST before attempting to send emails
    await db.collection('events').updateOne(
        { _id: eventId },
        { $set: { status: 'matched', assignments } }
    );
    console.log('Event status updated to matched');

    // Send Emails (fire and forget - don't block on email failures)
    sendAssignmentEmails(assignments).catch(err => {
        console.error('Email sending failed, but matching completed:', err);
    });
}

async function sendAssignmentEmails(assignments) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: process.env.SMTP_USER || 'ethereal_user',
            pass: process.env.SMTP_PASS || 'ethereal_pass'
        }
    });

    for (const assignment of assignments) {
        try {
            console.log(`Sending email to ${assignment.giverEmail}...`);

            // Format wishlist - handle both array and string
            let wishlistText = 'No specific wishes.';
            if (assignment.receiverWishlist) {
                if (Array.isArray(assignment.receiverWishlist) && assignment.receiverWishlist.length > 0) {
                    wishlistText = assignment.receiverWishlist.map((item, i) => `${i + 1}. ${item}`).join('\n');
                } else if (typeof assignment.receiverWishlist === 'string' && assignment.receiverWishlist.trim()) {
                    wishlistText = assignment.receiverWishlist;
                }
            }

            const wishlistHtml = assignment.receiverWishlist && Array.isArray(assignment.receiverWishlist) && assignment.receiverWishlist.length > 0
                ? `<ol>${assignment.receiverWishlist.map(item => `<li>${item}</li>`).join('')}</ol>`
                : `<em>${wishlistText}</em>`;

            await transporter.sendMail({
                from: '"Secret Santa" <santa@example.com>',
                to: assignment.giverEmail,
                subject: 'Your Secret Santa Assignment!',
                text: `Ho Ho Ho! \n\nYou are the Secret Santa for: ${assignment.receiverName}\n\nTheir Wishlist:\n${wishlistText}\n\nHappy Gifting!`,
                html: `<h1>Ho Ho Ho!</h1><p>You are the Secret Santa for: <strong>${assignment.receiverName}</strong></p><p>Their Wishlist:</p>${wishlistHtml}<p>Happy Gifting!</p>`
            });
            console.log(`Email sent to ${assignment.giverEmail}`);
        } catch (e) {
            console.error(`Failed to send email to ${assignment.giverEmail}`, e.message);
        }
    }
}
