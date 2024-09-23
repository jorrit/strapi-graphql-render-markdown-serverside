import type { Plugin } from '@strapi/types';
import type { Config } from 'apollo-server-core';
import { RenderMarkdownPlugin } from './htmlplugin';
import sanitize, { type IOptions as SanitizeHtmlOptions } from 'sanitize-html';
import type { Options as MarkdownItOptions } from 'markdown-it/lib';

export interface PluginConfig {
  sanitize?: SanitizeHtmlOptions;
  markdown?: MarkdownItOptions;
}

const plugin: Partial<Plugin.LoadedPlugin> = {
  config: {
    default: {
      sanitize: {
        ...sanitize.defaults,
        allowedTags: false,
        allowedAttributes: {
          '*': ['href', 'align', 'alt', 'center', 'width', 'height', 'type', 'controls', 'target'],
          img: ['src', 'alt'],
          source: ['src', 'type'],
        },
      },
      markdown: {

      }
    },
    validator: (config: PluginConfig) => void(0),
  },
  register: ({ strapi }) => {
    const pluginConfig: PluginConfig = strapi.config.get('plugin.strapi-graphql-render-markdown-serverside');
    const graphQlPlugin = strapi.plugin('graphql');
    const apolloServerConfig: Config = graphQlPlugin.config('apolloServer');

    if (!apolloServerConfig.plugins) {
      apolloServerConfig.plugins = [];
    }

    apolloServerConfig.plugins.push(RenderMarkdownPlugin(strapi, pluginConfig));
  }
};

export default plugin;
