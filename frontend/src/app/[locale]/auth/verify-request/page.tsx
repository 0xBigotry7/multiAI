'use client';

import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Email as EmailIcon } from '@mui/icons-material';

export default function VerifyRequestPage() {
  const router = useRouter();

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
      <EmailIcon sx={{ fontSize: 48, color: 'primary.main' }} />
      <Typography variant="h5" gutterBottom>
        Check your email
      </Typography>
      <Typography align="center" color="text.secondary">
        A sign in link has been sent to your email address.
        Please check your inbox and click the link to continue.
      </Typography>
      <Button
        variant="outlined"
        onClick={() => router.push('/')}
        sx={{ mt: 2 }}
      >
        Return to Home
      </Button>
    </Box>
  );
} 