import type { Access, CollectionConfig } from 'payload'

const isAppUser = (user: unknown): user is { collection: 'users'; id: string | number } =>
  Boolean(user && typeof user === 'object' && 'collection' in user && user.collection === 'users')

const appUserOnly: Access = ({ req }) => isAppUser(req.user)
const ownDocuments: Access = ({ req }) =>
  isAppUser(req.user) ? { owner: { equals: req.user.id } } : false

export const PantryItems: CollectionConfig = {
  slug: 'pantry-items',
  admin: {
    hidden: true,
    useAsTitle: 'name',
  },
  access: {
    create: appUserOnly,
    delete: ownDocuments,
    read: ownDocuments,
    update: ownDocuments,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === 'create' && isAppUser(req.user)) {
          return { ...data, owner: req.user.id }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: {
        update: () => false,
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 100,
    },
    {
      name: 'quantity',
      type: 'text',
      maxLength: 80,
    },
    {
      name: 'place',
      type: 'select',
      required: true,
      options: ['Frigo', 'Dispensa', 'Freezer'],
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
    },
    {
      name: 'iconKey',
      type: 'select',
      required: true,
      options: ['glass', 'wheat', 'bowl', 'leaf', 'package', 'snowflake'],
    },
    {
      name: 'tone',
      type: 'select',
      required: true,
      options: ['cream', 'rose', 'sand', 'blue', 'green', 'mint', 'yellow'],
    },
  ],
  versions: false,
}
