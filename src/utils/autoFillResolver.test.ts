import { describe, expect, it } from 'vitest'
import type { FormSchema } from '../types/form.types'
import { resolveAutoFillConfigs } from './autoFillResolver'

describe('resolveAutoFillConfigs', () => {
  it('resolves top-level field references to absolute paths', () => {
    const schema: FormSchema = {
      title: 'AutoFill',
      fields: [
        { id: 'zipCode', type: 'text', label: 'ZIP' },
        {
          id: 'city',
          type: 'text',
          label: 'City',
          autoFill: {
            apiEndpoint: '/api/address',
            dependsOn: ['zipCode'],
            targetFields: ['city', 'state'],
          },
        },
        { id: 'state', type: 'text', label: 'State' },
      ],
    }

    const configs = resolveAutoFillConfigs(schema.fields)

    expect(configs).toHaveLength(1)
    expect(configs[0]).toMatchObject({
      key: 'city',
      apiEndpoint: '/api/address',
      dependsOn: [{ key: 'zipCode', path: 'zipCode' }],
      targetFields: [
        { key: 'city', path: 'city' },
        { key: 'state', path: 'state' },
      ],
    })
  })

  it('resolves nested references inside groups', () => {
    const schema: FormSchema = {
      title: 'Nested AutoFill',
      fields: [
        {
          id: 'address',
          type: 'group',
          title: 'Address',
          fields: [
            { id: 'zipCode', type: 'text', label: 'ZIP' },
            {
              id: 'city',
              type: 'text',
              label: 'City',
              autoFill: {
                apiEndpoint: '/api/address',
                dependsOn: ['zipCode'],
                targetFields: ['city', 'state'],
              },
            },
            { id: 'state', type: 'text', label: 'State' },
          ],
        },
      ],
    }

    const configs = resolveAutoFillConfigs(schema.fields)

    expect(configs).toHaveLength(1)
    expect(configs[0].dependsOn[0]).toEqual({
      key: 'zipCode',
      path: 'address.zipCode',
    })
    expect(configs[0].targetFields).toEqual([
      { key: 'city', path: 'address.city' },
      { key: 'state', path: 'address.state' },
    ])
  })
})
