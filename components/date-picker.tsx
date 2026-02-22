'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

interface DatePickerProps {
  value: string // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void
  className?: string
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selectedDate = value ? new Date(value) : undefined

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const isoDate = format(date, 'yyyy-MM-dd')
      onChange(isoDate)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center justify-between w-full px-4 py-3 bg-budget-card border-b border-budget-divider touch-manipulation',
            className
          )}
        >
          <span className="text-budget-text text-[15px]">Date</span>
          <span className="flex items-center gap-1">
            <span className="text-[15px] text-budget-text">
              {value || 'Select date'}
            </span>
            <CalendarIcon className="h-4 w-4 text-budget-text-secondary" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-budget-card border-budget-divider" align="end">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
