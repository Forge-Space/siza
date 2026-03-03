'use client';

import { useEffect } from 'react';
import { AlertTriangle, KeySquare, Loader2 } from 'lucide-react';
import { AIKeyManager } from '@/components/ai-keys/AIKeyManager';
import { useAIKeyStore } from '@/stores/ai-keys';
import { generateUserEncryptionKey, deriveEncryptionKey } from '@/lib/encryption';
import { DashboardSection } from '@/components/migration/migration-primitives';

export function AIKeysClient() {
  const { encryptionKey, initialize, loading, error } = useAIKeyStore();

  useEffect(() => {
    // Initialize the AI key manager if encryption key exists
    const initKeyManager = async () => {
      // Check if we have an encryption key in localStorage
      const storedKey = localStorage.getItem('siza-encryption-key');

      if (storedKey) {
        // Derive the actual encryption key from the stored key
        const derivedKey = deriveEncryptionKey(storedKey);
        await initialize(derivedKey);
      } else {
        // Generate a new encryption key for the user
        const newKey = generateUserEncryptionKey();
        const derivedKey = deriveEncryptionKey(newKey);

        // Store the base key (not the derived one)
        localStorage.setItem('siza-encryption-key', newKey);
        await initialize(derivedKey);
      }
    };

    if (!encryptionKey && !loading) {
      initKeyManager();
    }
  }, [encryptionKey, initialize, loading]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Initializing AI Key Manager...</p>
        </div>
      </div>
    );
  }

  if (error && !encryptionKey) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h2 className="text-lg font-semibold mb-2">Initialization Failed</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <DashboardSection
        title="AI Keys"
        description="Bring your own keys, keep full control, and manage provider routing."
        actions={<KeySquare className="h-5 w-5 text-text-muted-foreground" aria-hidden="true" />}
      />
      <AIKeyManager />
    </div>
  );
}
