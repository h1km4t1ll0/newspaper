'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

export default function IndexPage() {
  const { push } = useRouter();

  useEffect(() => {
    push('/layout');
  }, [push]);

  return null;
}
