'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className='border-b border-border'>
      <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
        <Link
          href={user ? '/dashboard' : '/'}
          className='text-xl font-semibold'
        >
          LeetCode Spaced Rep
        </Link>
        <nav className='flex items-center gap-4'>
          {loading ? (
            <div className='w-20 h-9 bg-muted animate-pulse rounded-md' />
          ) : user ? (
            <>
              <Link
                href='/sets'
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                Problem Sets
              </Link>
              <Link
                href='/dashboard'
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                Dashboard
              </Link>
              <Link
                href='/settings'
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                Settings
              </Link>
              <Button variant='outline' size='sm' onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link href='/login'>
              <Button variant='outline' size='sm'>
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
