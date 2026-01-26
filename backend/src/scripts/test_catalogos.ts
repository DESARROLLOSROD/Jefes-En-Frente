import {
    materialesService,
    origenesService,
    destinosService,
    capacidadesService,
    tiposVehiculoService
} from '../services/catalogos.service.js';
import fs from 'fs';

async function testCatalogos() {
    const results: any = {};

    const tests = [
        { name: 'materiales', service: materialesService },
        { name: 'origenes', service: origenesService },
        { name: 'destinos', service: destinosService },
        { name: 'capacidades', service: capacidadesService },
        { name: 'tiposVehiculo', service: tiposVehiculoService }
    ];

    for (const test of tests) {
        try {
            const data = await test.service.getAll(true);
            results[test.name] = { status: 'PASS', count: data.length };
        } catch (error: any) {
            results[test.name] = { status: 'FAIL', error: error.message };
        }
    }

    fs.writeFileSync('test_results.json', JSON.stringify(results, null, 2));
    console.log('Results written to test_results.json');
}

testCatalogos();
