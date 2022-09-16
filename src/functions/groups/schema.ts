export default {
  type: "object",
  title: 'group',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' }
  },
  required: ['name', 'description'],
  additionalProperties: false
} as const;
