import type { Access, CollectionConfig } from 'payload'

const isAppUser = (user: unknown): user is { collection: 'users'; id: string | number } =>
  Boolean(user && typeof user === 'object' && 'collection' in user && user.collection === 'users')

const ownProfile: Access = ({ req }) =>
  isAppUser(req.user) ? { id: { equals: req.user.id } } : false

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    hidden: true,
    useAsTitle: 'email',
  },
  access: {
    create: () => true,
    delete: ownProfile,
    read: ownProfile,
    update: ownProfile,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 40,
    },
    {
      name: 'alertDays',
      type: 'select',
      defaultValue: '2',
      options: [
        { label: '1 giorno', value: '1' },
        { label: '2 giorni', value: '2' },
        { label: '3 giorni', value: '3' },
      ],
    },
    {
      name: 'dailyLimit',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'quietHours',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  versions: false,
}
