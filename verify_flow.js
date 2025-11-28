const BASE_URL = 'http://localhost:3000';

async function request(path, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Cookie'] = `token=${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${path}`, options);
    const data = await res.json().catch(() => ({}));

    // Extract token from set-cookie if present
    let newToken = null;
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
        const match = setCookie.match(/token=([^;]+)/);
        if (match) newToken = match[1];
    }

    return { status: res.status, data, token: newToken };
}

async function run() {
    console.log('Starting Verification...');

    // 1. Register User A
    const emailA = `userA_${Date.now()}@example.com`;
    console.log(`Registering User A: ${emailA}`);
    let res = await request('/api/auth/signup', 'POST', { email: emailA, password: 'password', name: 'User A' });
    if (res.status !== 201) throw new Error(`Failed to register User A: ${JSON.stringify(res.data)}`);

    // 2. Login User A
    console.log('Logging in User A');
    res = await request('/api/auth/login', 'POST', { email: emailA, password: 'password' });
    if (res.status !== 200) throw new Error('Failed to login User A');
    const tokenA = res.token;

    // 3. Create Event
    console.log('Creating Event');
    const deadline = new Date(Date.now() + 5000).toISOString(); // 5 seconds from now
    res = await request('/api/events', 'POST', { name: 'Test Event', deadline }, tokenA);
    if (res.status !== 201) throw new Error('Failed to create event');
    const eventId = res.data._id;
    const code = res.data.code;
    console.log(`Event Created: ${eventId}, Code: ${code}`);

    // 4. Register User B
    const emailB = `userB_${Date.now()}@example.com`;
    console.log(`Registering User B: ${emailB}`);
    res = await request('/api/auth/signup', 'POST', { email: emailB, password: 'password', name: 'User B' });
    if (res.status !== 201) throw new Error('Failed to register User B');

    // 5. Login User B
    console.log('Logging in User B');
    res = await request('/api/auth/login', 'POST', { email: emailB, password: 'password' });
    if (res.status !== 200) throw new Error('Failed to login User B');
    const tokenB = res.token;

    // 6. Join Event
    console.log('User B Joining Event');
    res = await request('/api/events/join', 'POST', { code }, tokenB);
    if (res.status !== 200) throw new Error(`Failed to join event: ${JSON.stringify(res.data)}`);

    // 7. Wait for deadline
    console.log('Waiting 10s for deadline...');
    await new Promise(r => setTimeout(r, 10000));

    // 8. Trigger Matching (Lazy)
    console.log('Triggering Matching (Lazy)');
    res = await request(`/api/events/${eventId}`, 'GET', null, tokenA);
    if (res.status !== 200) throw new Error('Failed to get event');

    if (res.data.status !== 'matched') {
        throw new Error(`Event status is ${res.data.status}, expected 'matched'`);
    }
    console.log('Event Status: MATCHED');

    if (!res.data.myAssignment) {
        // User A should have an assignment (User B)
        // Wait, with 2 people: A -> B, B -> A.
        throw new Error('User A has no assignment');
    }
    console.log(`User A assigned to: ${res.data.myAssignment.receiverName}`);

    console.log('Verification Successful!');
}

run().catch(e => {
    console.error('Verification Failed:', e);
    process.exit(1);
});
