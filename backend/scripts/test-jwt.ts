import * as jwt from 'jsonwebtoken';

const JWT_SECRET = 'test_secret';

try {
    console.log('Testing jwt.sign...');
    console.log('jwt object:', jwt);
    console.log('jwt.sign type:', typeof jwt.sign);

    const token = jwt.sign(
        { userId: '123', email: 'test@test.com' },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    console.log('✅ Token generated successfully:', token);
} catch (error) {
    console.error('❌ Error:', error);
}
