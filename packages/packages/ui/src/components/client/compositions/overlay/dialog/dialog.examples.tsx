/**
 * Dialog Component Examples
 *
 * This file demonstrates various usage patterns for the Dialog component
 */

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'

// Example 1: Basic Dialog
// ============================================================================

export function BasicDialogExample() {
  return (
    <Dialog>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a simple dialog description that explains what this dialog
            is about.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <button>Close</button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Example 2: Confirmation Dialog
// ============================================================================

export function ConfirmationDialogExample() {
  const handleConfirm = () => {
    console.log('Confirmed!')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn-primary">Delete Item</button>
      </DialogTrigger>
      <DialogContent size="sm" variant="bordered">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <button className="btn-secondary">Cancel</button>
          </DialogClose>
          <button className="btn-danger" onClick={handleConfirm}>
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Example 3: Form Dialog
// ============================================================================

export function FormDialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn-primary">Create New</button>
      </DialogTrigger>
      <DialogContent size="lg" variant="elevated">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new item.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="mt-1 block w-full rounded-md border"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="mt-1 block w-full rounded-md border"
            />
          </div>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <button className="btn-secondary">Cancel</button>
          </DialogClose>
          <button className="btn-primary" type="submit">
            Create
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Example 4: Controlled Dialog
// ============================================================================

export function ControlledDialogExample() {
  const [open, setOpen] = React.useState(false)

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    console.log('Dialog open state:', isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="btn-primary">Open Controlled Dialog</button>
      </DialogTrigger>
      <DialogContent size="md" overlayBlur="heavy">
        <DialogHeader>
          <DialogTitle>Controlled Dialog</DialogTitle>
          <DialogDescription>
            This dialog&apos;s open state is controlled by React state.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button onClick={() => setOpen(false)} className="btn-primary">
            Close Programmatically
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Example 5: Full Screen Dialog
// ============================================================================

export function FullScreenDialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn-primary">Open Full Screen</button>
      </DialogTrigger>
      <DialogContent size="full" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>Full Screen Dialog</DialogTitle>
          <DialogDescription>
            This dialog takes up most of the screen (95vh x 95vw).
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <p>Your full-screen content goes here...</p>
          <p>
            This is useful for complex forms, data tables, or detailed views.
          </p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <button className="btn-secondary">Close</button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Example 6: Custom Styled Dialog with Layer 1 Typography
// ============================================================================

import * as React from 'react'
import { Heading } from '../../../../shared/typography/heading'
import { Text } from '../../../../shared/typography/text'

export function CustomStyledDialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn-primary">Custom Styled</button>
      </DialogTrigger>
      <DialogContent size="lg" variant="bordered" overlayBlur="medium">
        <DialogHeader>
          <DialogTitle asChild>
            <Heading level={2} size="xl" color="primary">
              Custom Typography
            </Heading>
          </DialogTitle>
          <DialogDescription asChild>
            <Text size="md" color="muted">
              This dialog uses Layer 1 Typography components with custom
              styling.
            </Text>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Text size="sm">
            You can fully customize the typography by using the asChild prop and
            providing your own Layer 1 Typography components.
          </Text>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <button className="btn-primary">Got it!</button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
