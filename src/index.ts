import * as fs from 'fs';
import * as path from 'path';
import { GraphQLSchema,  IntrospectionQuery } from 'graphql';
import { GenerateTypescriptOptions, defaultOptions } from './types';
import { TSResolverGenerator } from './typescriptResolverGenerator';
import { TypeScriptGenerator } from './typescriptGenerator';
import { formatTabSpace, introspectSchema, introspectSchemaViaLocalFile } from './utils';

export { GenerateTypescriptOptions } from './types';

const packageJson = require(path.join(__dirname, '../package.json'));

const jsDoc =
    `/**
 * This file is auto-generated by ${packageJson.name}
 * Please note that any changes in this file may be overwritten
 */
 
`;

const typeDefsDecoration = [
    '/*******************************',
    ' *                             *',
    ' *          TYPE DEFS          *',
    ' *                             *',
    ' *******************************/'
];

const typeResolversDecoration = [
    '/*********************************',
    ' *                               *',
    ' *         TYPE RESOLVERS        *',
    ' *                               *',
    ' *********************************/'
];

export const generateTSTypesAsString = (
    schema: GraphQLSchema | string,
    outputPath: string,
    options: GenerateTypescriptOptions
): string => {
    const mergedOptions = { ...defaultOptions, ...options };

    let introspectResult: IntrospectionQuery | null = null;
    if (typeof schema === 'string') {
        // is is a path to schema folder?
        try {
            const schemaPath = path.resolve(schema);
            const exists = fs.existsSync(schemaPath);
            if (exists) {
                introspectResult = introspectSchemaViaLocalFile(schemaPath);
            }
        } catch {
            // fall-through in case the provided string is a graphql definition,
            // which can make path.resolve throw error
        }

        // it's not a folder, maybe it's a schema definition
        if (!introspectResult) {
            introspectResult = introspectSchemaStr(schema);
        }
    } else {
        introspectResult = introspectSchema(schema);
    }

    const tsGenerator = new TypeScriptGenerator(mergedOptions, introspectResult, outputPath);
    const typeDefs = tsGenerator.generate();

    const tsResolverGenerator = new TSResolverGenerator(mergedOptions, introspectResult);
    const typeResolvers = tsResolverGenerator.generate();

    let header = [...typeResolvers.importHeader, jsDoc];

    let body: string[] = [
        ...typeDefsDecoration,
        ...typeDefs,
        ...typeResolversDecoration,
        ...typeResolvers.body
    ];

    if (mergedOptions.namespace) {
        body = [
            // if namespace is under global, it doesn't need to be declared again
            `${mergedOptions.global ? '' : 'declare '}namespace ${options.namespace} {`,
            ...body,
            '}'
        ];
    }

    if (mergedOptions.global) {
        body = [
            'export { };',
            '',
            'declare global {',
            ...body,
            '}'
        ];
    }

    const formatted = formatTabSpace([...header, ...body], mergedOptions.tabSpaces);
    return formatted.join('\n');
};

export function generateTypeScriptTypes(
    schema: GraphQLSchema | string,
    outputPath: string,
    options: GenerateTypescriptOptions = defaultOptions
) {
    const content = generateTSTypesAsString(schema, outputPath, options);
    fs.writeFileSync(outputPath, content, 'utf-8');
}
