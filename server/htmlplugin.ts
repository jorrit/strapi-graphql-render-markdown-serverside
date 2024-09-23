import type { Schema, Strapi } from '@strapi/types';
import type { ApolloServerPlugin } from 'apollo-server-plugin-base';
import type { Common } from '@strapi/types/dist/types';
import { assertInputType, GraphQLArgument, isObjectType } from 'graphql';
import { buildMarkdown } from './utils/mdRenderer';
import { GraphQLFieldResolver } from 'graphql/type/definition';
import { PluginConfig } from './index';
import sanitize from 'sanitize-html';

const resolveToHtml = (pluginConfig: PluginConfig): GraphQLFieldResolver<object, unknown, { html?: boolean }> => {
  const md = buildMarkdown(pluginConfig.markdown);

  return (root, opts, graphqlContext, info) => {
    const data = root[info.fieldName];
    if (data === undefined || data === null || typeof data !== 'string' || data === '' || !('html' in opts) || !opts.html) {
      return data;
    }

    return sanitize(md.render(data || ''), pluginConfig.sanitize);
  };
};

const getRichTextFields = (strapi: Strapi) => {
  const contentTypes: Schema.ContentType[] = Object.values(strapi.contentTypes).filter(model => model.internal !== true);

  const pluginContentTypes = Object.values(strapi.plugins)
    .map((plugin: Common.Plugin) => Object.values(plugin.contentTypes) || [])
    .reduce((acc, arr) => acc.concat(arr), []);

  const components = Object.values(strapi.components);

  return [...contentTypes, ...pluginContentTypes, ...components].reduce((acc, { globalId, attributes }) => {
    Object.keys(attributes).forEach(attributeName => {
      if (attributes[attributeName].type === 'richtext') {
        acc.push({ typeName: globalId, fieldName: attributeName });
      }
    });
    return acc;
  }, []);
};

const RenderMarkdownPlugin = (strapi: Strapi, pluginConfig: PluginConfig): ApolloServerPlugin => {
  return {
    async serverWillStart({ schema }): Promise<void> {
      // Get all richtext fields.
      const richtTextFields = getRichTextFields(strapi);

      const booleanInputType = assertInputType(schema.getType('Boolean'));

      const htmlArgument: GraphQLArgument = {
        name: 'html',
        type: booleanInputType,
        description: 'Render this field as HTML',
        defaultValue: false,
        deprecationReason: undefined,
        extensions: undefined,
        astNode: undefined,
      };

      const fieldResolver = resolveToHtml(pluginConfig);

      // Set resolver and attributes.
      richtTextFields.forEach(({ typeName, fieldName }) => {
        const type = schema.getType(typeName);
        if (!type || !isObjectType(type)) {
          return;
        }

        const field = type.getFields()[fieldName];
        if (!field) {
          return;
        }

        field.args.push(htmlArgument);
        field.resolve = fieldResolver;
      });
    }
  };
};

export { RenderMarkdownPlugin };