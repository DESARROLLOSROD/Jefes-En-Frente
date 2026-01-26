import {
    materialesService,
    origenesService,
    destinosService,
    capacidadesService,
    tiposVehiculoService
} from '../services/catalogos.service.js';
import fs from 'fs';

async function testAll() {
    const results: any = {};

    const check = async (name: string, service: any) => {
        try {
            const data = await service.getAll(true);
            results[name] = { status: 'PASS', count: data.length };
        } catch (e: any) {
            results[name] = { status: 'FAIL', error: e.message };
        }
    };

    await check('Materiales', materialesService);
    await check('Origenes', origenesService);
    await check('Destinos', destinosService);
    await check('Capacidades', capacidadesService);
    await check('TiposVehiculo', tiposVehiculoService);

    fs.writeFileSync('all_catalogos_results.json', JSON.stringify(results, null, 2));
}

testAll();
