'use client';

import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { LogIn, LogOut, User } from 'lucide-react';
import Logo from './Logo';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="flex h-[64px] items-center justify-between border-b border-border px-4 shadow-md">
      <Logo />
      <div className="flex items-center gap-4">
        {session?.user && (
          <Button asChild variant={'link'}>
            <Link href={'/dashboard'} className='text-lg'>
              Dashboard
            </Link>
          </Button>
        )}
        <ThemeSwitcher />
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session.user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant={'secondary'}
            className="flex items-center gap-2 font-bold text-foreground"
            asChild
          >
            <Link href="/sign-in">
              <LogIn className="h-5 w-5" />
              Sign In
            </Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
