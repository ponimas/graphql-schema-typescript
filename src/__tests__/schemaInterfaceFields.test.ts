import { executeApiTest } from './testUtils';

describe('interface fields declaration', () => {
  it('should generate interface field resolvers', async () => {
    const schemaStr = `schema { query: Query } type Query implements IQuery { foo: String } interface IQuery { foo: String }`;
    const generated = await executeApiTest('schemaString.ts', {}, schemaStr);
    expect(generated).toEqual(expect.stringContaining(`
export interface GQLIQueryTypeResolver<TParent = any> {
  __resolveType: GQLIQueryResolveType
  foo?: IQueryToFooResolver<TParent>;
}`));
  });
});
