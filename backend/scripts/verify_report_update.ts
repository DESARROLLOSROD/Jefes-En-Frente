import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Vehiculo from '../src/models/Vehiculo.js';
import ReporteActividades from '../src/models/ReporteActividades.js';
import Usuario from '../src/models/Usuario.js';
import Proyecto from '../src/models/Proyecto.js';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 5000}/api`;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

async function runVerification() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected.');

        // 1. Create Test User & Token
        const testUser = await Usuario.findOne({});
        if (!testUser) throw new Error('No users found');
        const token = jwt.sign({ id: testUser._id }, JWT_SECRET, { expiresIn: '1h' });

        // 2. Create Test Project (or find one)
        let project = await Proyecto.findOne({});
        if (!project) {
            project = await Proyecto.create({ nombre: 'Test Project', codigo: 'TEST', ubicacion: 'Test' });
        }

        // 3. Create Test Vehicle
        const vehicle = await Vehiculo.create({
            nombre: 'Test Vehicle',
            tipo: 'Maquinaria',
            horometroInicial: 100,
            horasOperacion: 0,
            noEconomico: 'TEST-001-' + Date.now(),
            proyectos: [project._id]
        });
        console.log(`Created vehicle ${vehicle.noEconomico} with hours: ${vehicle.horasOperacion} (Total: ${vehicle.horometroInicial + vehicle.horasOperacion})`);

        // 4. Create Report via API
        const reportData = {
            fecha: new Date(),
            ubicacion: 'Test Location',
            proyectoId: project._id,
            controlMaquinaria: [{
                vehiculoId: vehicle._id,
                horometroFinal: 105,
                horasOperacion: 5,
                tipo: 'Maquinaria',
                modelo: 'Test',
                numeroEconomico: vehicle.noEconomico
            }]
        };

        console.log('Creating report via API...');
        const createRes = await fetch(`${API_URL}/reportes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(reportData)
        });
        const createJson = await createRes.json();
        if (!createRes.ok) throw new Error(`Failed to create report: ${JSON.stringify(createJson)}`);
        const reportId = createJson.data._id;
        console.log('Report created:', reportId);

        // 5. Verify Vehicle Hours
        let updatedVehicle = await Vehiculo.findById(vehicle._id);
        console.log(`Vehicle hours after creation: ${updatedVehicle?.horasOperacion} (Expected: 5)`);
        if (updatedVehicle?.horasOperacion !== 5) throw new Error('Vehicle hours not updated correctly on creation');

        // 6. Update Report via API (Increase hours)
        const updateData = {
            ...reportData,
            controlMaquinaria: [{
                vehiculoId: vehicle._id,
                horometroFinal: 108,
                horasOperacion: 8,
                tipo: 'Maquinaria',
                modelo: 'Test',
                numeroEconomico: vehicle.noEconomico
            }]
        };

        console.log('Updating report via API (Increasing hours)...');
        const updateRes = await fetch(`${API_URL}/reportes/${reportId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(updateData)
        });
        const updateJson = await updateRes.json();
        if (!updateRes.ok) throw new Error(`Failed to update report: ${JSON.stringify(updateJson)}`);

        // 7. Verify Vehicle Hours
        updatedVehicle = await Vehiculo.findById(vehicle._id);
        console.log(`Vehicle hours after update (increase): ${updatedVehicle?.horasOperacion} (Expected: 8)`);
        if (updatedVehicle?.horasOperacion !== 8) throw new Error(`Vehicle hours incorrect. Expected 8, got ${updatedVehicle?.horasOperacion}`);

        // 8. Update Report via API (Decrease hours)
        const updateData2 = {
            ...reportData,
            controlMaquinaria: [{
                vehiculoId: vehicle._id,
                horometroFinal: 103,
                horasOperacion: 3,
                tipo: 'Maquinaria',
                modelo: 'Test',
                numeroEconomico: vehicle.noEconomico
            }]
        };

        console.log('Updating report via API (Decreasing hours)...');
        const updateRes2 = await fetch(`${API_URL}/reportes/${reportId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(updateData2)
        });
        if (!updateRes2.ok) throw new Error('Failed to update report 2');

        // 9. Verify Vehicle Hours
        updatedVehicle = await Vehiculo.findById(vehicle._id);
        console.log(`Vehicle hours after update (decrease): ${updatedVehicle?.horasOperacion} (Expected: 3)`);
        if (updatedVehicle?.horasOperacion !== 3) throw new Error(`Vehicle hours incorrect. Expected 3, got ${updatedVehicle?.horasOperacion}`);

        console.log('✅ VERIFICATION SUCCESSFUL');

        // Cleanup
        await ReporteActividades.findByIdAndDelete(reportId);
        await Vehiculo.findByIdAndDelete(vehicle._id);
        if (project.nombre === 'Test Project') await Proyecto.findByIdAndDelete(project._id);

    } catch (error) {
        console.error('❌ Verification Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

runVerification();
