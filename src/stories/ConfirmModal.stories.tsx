import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ConfirmModal } from '../components/ConfirmModal'

const meta: Meta<typeof ConfirmModal> = {
  title: 'Common/ConfirmModal',
  component: ConfirmModal,
}

export default meta
type Story = StoryObj<typeof ConfirmModal>

export const Basic: Story = {
  render: () => {
    const [open, setOpen] = useState(true)

    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Открыть модалку
        </button>
        <ConfirmModal
          open={open}
          title="Добавить фильм в избранное?"
          description="Интерстеллар"
          confirmLabel="Добавить"
          cancelLabel="Отмена"
          onClose={() => setOpen(false)}
          onConfirm={() => {}}
        />
      </>
    )
  },
}

