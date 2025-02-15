'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');

  useEffect(() => {
    if (!error) {
      signIn('google', { callbackUrl });
    }
  }, [callbackUrl, error]);

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <Typography color="error">
          {error === 'Configuration'
            ? 'There was a problem with the server configuration.'
            : 'An error occurred during sign in.'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography>
        Redirecting to sign in...
      </Typography>
    </Box>
  );
} 