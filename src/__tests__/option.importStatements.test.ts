import { executeApiTest } from './testUtils';

describe('importStatements', () => {
    it('should inject import statements', async () => {
        const importStatements = [`import * as fs from 'fs';`, `import * as path from 'path';`];
        const generated = await executeApiTest('importStatements.ts', { importStatements });
        const lines = generated.split('\n');
        expect(lines[2]).toBe(importStatements[0]);
        expect(lines[3]).toBe(importStatements[1]);
    });
});
