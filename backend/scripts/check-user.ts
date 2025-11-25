import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Usuario from '../src/models/Usuario';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not defined');
    process.exit(1);
}

async function checkUser() {
    try {
        console.log('CONNECTING...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('CONNECTED');

        console.log('SEARCHING for admin@jefesenfrente.com...');
        const user = await Usuario.findOne({ email: 'admin@jefesenfrente.com' });

        if (user) {
            console.log('USER FOUND:');
            console.log('- Name:', user.nombre);
            console.log('- Email:', user.email);
            console.log('- Active:', user.activo);
            console.log('- Password hash:', user.password);

            // Test password comparison
            console.log('\nTESTING password comparison...');
            const isValid = await user.compararPassword('password123');
            console.log('Password "password123" is valid:', isValid);
        } else {
            console.log('USER NOT FOUND');
        }

    } catch (error: any) {
        console.error('ERROR:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('DONE');
    }
}

checkUser();
