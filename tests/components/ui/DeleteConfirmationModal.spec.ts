import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal.vue'

describe('DeleteConfirmationModal', () => {
  it('renders nothing when isOpen is false', () => {
    const wrapper = mount(DeleteConfirmationModal, {
      props: {
        isOpen: false
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('renders content when isOpen is true', () => {
    const wrapper = mount(DeleteConfirmationModal, {
      props: {
        isOpen: true
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    expect(wrapper.find('h3').text()).toBe('Delete Trade?')
    expect(wrapper.find('button.bg-error').text()).toBe('Delete')
  })

  it('shows loading state when isDeleting is true', () => {
    const wrapper = mount(DeleteConfirmationModal, {
      props: {
        isOpen: true,
        isDeleting: true
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    expect(wrapper.find('button.bg-error').text()).toBe('Deleting...')
    expect(wrapper.find('button.bg-error').element.disabled).toBe(true)
    expect(wrapper.find('button:not(.bg-error)').element.disabled).toBe(true)
  })

  it('emits close when cancel is clicked', async () => {
    const wrapper = mount(DeleteConfirmationModal, {
      props: {
        isOpen: true
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    await wrapper.find('button:not(.bg-error)').trigger('click')
    expect(wrapper.emitted().close).toBeTruthy()
  })

  it('emits confirm when delete is clicked', async () => {
    const wrapper = mount(DeleteConfirmationModal, {
      props: {
        isOpen: true
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    await wrapper.find('button.bg-error').trigger('click')
    expect(wrapper.emitted().confirm).toBeTruthy()
  })
})
