import { executeApiTest } from './testUtils';

describe('resolveInfoType', () => {
    it('should default to GraphQLResolveInfo', async () => {
        const schemaStr = `schema { query: RootQuery } type RootQuery { test: String! }`;
        const generated = await executeApiTest('schemaString.ts', {}, schemaStr);
        expect(generated).toContain('GraphQLResolveInfo');
    });

    it('should use custom resolve info', async () => {
        const schemaStr = `schema { query: RootQuery } type RootQuery { test: String! }`;
        const generated = await executeApiTest('schemaString.ts', {
                                                   resolveInfoType: 'CustomResolveInfo',
                                                   importStatements: ['interface CustomResolveInfo {}'] // so ts compiles
                                               },
                                               schemaStr);
        expect(generated).toContain('CustomResolveInfo');
        expect(generated).not.toContain('GraphQLResolveInfo');
    });
});