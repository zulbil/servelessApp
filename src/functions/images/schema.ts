export default {
  type: "object",
  title: 'image',
  properties: {
    title: { type: 'string' },
    url: { type: 'string' }
  },
  required: ['title'],
  additionalProperties: false
} as const;
