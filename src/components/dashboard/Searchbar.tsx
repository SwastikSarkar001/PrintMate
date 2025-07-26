import React from 'react'
import { LuSearch } from 'react-icons/lu'
import { SidebarTrigger } from '../ui/sidebar'

export default function Searchbar() {
  return (
    <header className='flex items-center gap-4 pl-4 max-md:px-2'>
      <SidebarTrigger className="cursor-pointer" />
      <div className='grow max-sm:text-sm flex items-center gap-3 sm:gap-4 border border-muted-foreground rounded-full bg-background py-2 sm:py-3 px-4 sm:px-6 focus-within:ring'>
        <label htmlFor="search"><LuSearch className='text-muted-foreground size-[1.2em] sm:size-[1.1em]' /></label>
        <input
          type="search"
          name="search"
          id="search"
          placeholder='Search anything...'
          className='grow outline-none bg-transparent border-none'
        />
      </div>
    </header>
  )
}
