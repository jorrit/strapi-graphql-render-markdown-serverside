# Strapi GraphQL plugin to render markdown content server side

This plugin adds an `html` argument to each rich text field in the GraphQL schema.
When a client requests this field with `html` set to `true`, the Markdown content of 
this field will be rendered to HTML before being returned.

## Supported Strapi versions

- v4.x.x

## Installation

```sh
npm install strapi-graphql-render-markdown-serverside
```

**or**

```sh
yarn add strapi-graphql-render-markdown-serverside
```

Add the following to your `config/plugins.js` or `config/plugins.ts` file:

```js
  'strapi-graphql-render-markdown-serverside': {
    config: {
      sanitize: {
        // Additional sanitize-html config
      },
      markdown: {
        // Additional markdown-it config
      },
      linkify: {
        // Additional linkify-it config, optional
      }
    }
  },
```
