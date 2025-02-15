'use client';

import { useSearchParams } from 'next/navigation';
import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification link is no longer valid.';
      default:
        return 'An error occurred during authentication.';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 3,
        p: 2,
      }}
    >
      <Typography variant="h5" color="error" gutterBottom>
        Authentication Error
      </Typography>
      <Typography align="center">
        {getErrorMessage(error)}
      </Typography>
      <Button
        variant="contained"
        onClick={() => router.push('/')}
        sx={{ mt: 2 }}
      >
        Return to Home
      </Button>
    </Box>
  );
} 