import type { Config } from 'payload/config'
import type { RichTextAdapterProvider } from 'payload/types'

import { sanitizeFields } from 'payload/config'
import { withNullableJSONSchemaType } from 'payload/utilities'

import type { AdapterArguments } from './types.js'

import { RichTextCell } from './cell/index.js'
import { richTextRelationshipPromise } from './data/richTextRelationshipPromise.js'
import { richTextValidate } from './data/validation.js'
import { transformExtraFields } from './field/elements/link/utilities.js'
import { RichTextField } from './field/index.js'
import { getGenerateComponentMap } from './generateComponentMap.js'
import { getGenerateSchemaMap } from './generateSchemaMap.js'

export function slateEditor(
  args: AdapterArguments,
): RichTextAdapterProvider<any[], AdapterArguments, any> {
  return async ({ config }) => {
    const validRelationships = config.collections.map((c) => c.slug) || []

    if (!args.admin) {
      args.admin = {}
    }
    if (!args.admin.link) {
      args.admin.link = {}
    }
    if (!args.admin.link.fields) {
      args.admin.link.fields = []
    }
    args.admin.link.fields = await sanitizeFields({
      config: config as unknown as Config,
      fields: transformExtraFields(args.admin?.link?.fields, config),
      validRelationships,
    })

    if (args?.admin?.upload?.collections) {
      for (const collection of Object.keys(args.admin.upload.collections)) {
        if (args?.admin?.upload?.collections[collection]?.fields) {
          args.admin.upload.collections[collection].fields = await sanitizeFields({
            config: config as unknown as Config,
            fields: args.admin?.upload?.collections[collection]?.fields,
            validRelationships,
          })
        }
      }
    }

    return {
      CellComponent: RichTextCell,
      FieldComponent: RichTextField,
      generateComponentMap: getGenerateComponentMap(args),
      generateSchemaMap: getGenerateSchemaMap(args),
      outputSchema: ({ isRequired }) => {
        return {
          type: withNullableJSONSchemaType('array', isRequired),
          items: {
            type: 'object',
          },
        }
      },
      populationPromises({
        context,
        currentDepth,
        depth,
        field,
        fieldPromises,
        findMany,
        flattenLocales,
        overrideAccess,
        populationPromises,
        req,
        showHiddenFields,
        siblingDoc,
      }) {
        if (
          field.admin?.elements?.includes('relationship') ||
          field.admin?.elements?.includes('upload') ||
          field.admin?.elements?.includes('link') ||
          !field?.admin?.elements
        ) {
          richTextRelationshipPromise({
            context,
            currentDepth,
            depth,
            field,
            fieldPromises,
            findMany,
            flattenLocales,
            overrideAccess,
            populationPromises,
            req,
            showHiddenFields,
            siblingDoc,
          })
        }
      },
      validate: richTextValidate,
    }
  }
}

export { ElementButton } from './field/elements/Button.js'

export { toggleElement } from './field/elements/toggle.js'
export { LeafButton } from './field/leaves/Button.js'
export type {
  AdapterArguments,
  ElementNode,
  FieldProps,
  RichTextCustomElement,
  RichTextCustomLeaf,
  RichTextElement,
  RichTextLeaf,
  TextNode,
} from './types.js'

export { nodeIsTextNode } from './types.js'