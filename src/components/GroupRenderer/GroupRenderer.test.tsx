import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import type { UseFormRegister, FieldValues } from 'react-hook-form'
import { GroupRenderer } from './GroupRenderer'
import type { GroupConfig } from '../../types/form.types'

describe('GroupRenderer', () => {
  const mockRegister = vi.fn() as unknown as UseFormRegister<FieldValues>

  const simpleGroup: GroupConfig = {
    id: 'personal',
    type: 'group',
    title: 'Personal Information',
    description: 'Your details',
    fields: [
      {
        id: 'firstName',
        type: 'text',
        label: 'First Name',
      },
    ],
  }

  const renderWithForm = (group: GroupConfig, errors = {}) => {
    const Wrapper = () => {
      const { control } = useForm<FieldValues>()
      return (
        <GroupRenderer
          group={group}
          control={control}
          register={mockRegister}
          errors={errors}
        />
      )
    }
    return render(<Wrapper />)
  }

  it('renders group with title and description', () => {
    renderWithForm(simpleGroup)

    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('Your details')).toBeInTheDocument()
  })

  it('renders nested fields', () => {
    renderWithForm(simpleGroup)

    expect(screen.getByLabelText('First Name')).toBeInTheDocument()
  })

  it('hides group when visibility condition not met', () => {
    const Wrapper = () => {
      const { control } = useForm<FieldValues>({
        defaultValues: { userType: 'business' },
      })

      const conditionalGroup: GroupConfig = {
        ...simpleGroup,
        showWhen: {
          field: 'userType',
          equals: 'individual',
        },
      }

      return (
        <GroupRenderer
          group={conditionalGroup}
          control={control}
          register={mockRegister}
          errors={{}}
        />
      )
    }

    render(<Wrapper />)

    expect(screen.queryByText('Personal Information')).not.toBeInTheDocument()
  })

  it('renders nested groups recursively', () => {
    const nestedGroup: GroupConfig = {
      id: 'parent',
      type: 'group',
      title: 'Parent Group',
      fields: [
        {
          id: 'child',
          type: 'group',
          title: 'Child Group',
          fields: [
            {
              id: 'name',
              type: 'text',
              label: 'Name',
            },
          ],
        },
      ],
    }

    renderWithForm(nestedGroup)

    expect(screen.getByText('Parent Group')).toBeInTheDocument()
    expect(screen.getByText('Child Group')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })
})
