import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Menu } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import ThemeToggler from './ThemeToggler'
import { Separator } from '@/components/ui/separator'

export default function Navbar() {
  return (
    <header>
      <nav className="flex items-center gap-4 justify-between py-4 px-6 md:py-8 md:px-12 font-heading">
        <Link href='/' className="text-xl">My Website</Link>
        <ul className="flex gap-4 max-sm:hidden">
          <li><Link href="/" className="hover:underline">Home</Link></li>
          <li><Link href="/about" className="hover:underline">About</Link></li>
          <li><Link href="/contact" className="hover:underline">Contact</Link></li>
        </ul>
        <div className='gap-4 flex items-center max-sm:hidden'>
          <ThemeToggler />
          <Button asChild>
            <Link href="/auth">Login / Register</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="sm:hidden">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 sm:hidden" align="end">
              <div className="grid gap-4">
                {/* Mobile Navigation Links */}
                <div className="grid gap-3">
                  <h4 className="font-medium">Navigation</h4>
                  <div className="grid gap-1 text-sm *:py-1 *:px-2">
                    <Link 
                      href="/" 
                      className="hover:bg-accent hover:text-accent-foreground rounded-sm"
                    >
                      Home
                    </Link>
                    <Link 
                      href="/about" 
                      className="hover:bg-accent hover:text-accent-foreground rounded-sm"
                    >
                      About
                    </Link>
                    <Link 
                      href="/contact" 
                      className="hover:bg-accent hover:text-accent-foreground rounded-sm"
                    >
                      Contact
                    </Link>
                  </div>
                </div>

                <Separator orientation='horizontal' />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Change Theme</span>
                  <ThemeToggler />
                </div>

                <Separator orientation='horizontal' />
                
                <Button asChild className="w-full">
                  <Link href="/login">Login / Register</Link>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </nav>
    </header>
  )
}