import type { Access, CollectionConfig } from 'payload'

const isAppUser = (user: unknown): user is { collection: 'users'; id: string | number } =>
  Boolean(user && typeof user === 'object' && 'collection' in user && user.collection === 'users')

const appUserOnly: Access = ({ req }) => isAppUser(req.user)
const ownDocuments: Access = ({ req }) =>
  isAppUser(req.user) ? { owner: { equals: req.user.id } } : false

export const PantryEvents: CollectionConfig = {
  slug: 'pantry-events',
  admin: {
    hidden: true,
    useAsTitle: 'productName',
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
      name: 'productName',
      type: 'text',
      required: true,
      maxLength: 100,
    },
    {
      name: 'outcome',
      type: 'select',
      required: true,
      options: [
        { label: 'Salvato', value: 'saved' },
        { label: 'Buttato', value: 'wasted' },
      ],
    },
    {
      name: 'occurredAt',
      type: 'date',
      required: true,
    },
  ],
  versions: false,
}
