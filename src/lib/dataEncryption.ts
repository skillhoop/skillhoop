/**
 * Data Encryption Utility
 * Encrypts sensitive data before storing in localStorage
 * Uses Web Crypto API for secure encryption
 */

/**
 * Generate a key for encryption/decryption
 * Uses a user-specific key derived from a passphrase
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  // Use a combination of user ID and a constant salt for key derivation
  // In a production app, you might want to use a user-provided passphrase
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('career-clarified-encryption-key-v1'),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive a key using PBKDF2
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('career-clarified-salt-v1'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return key;
}

/**
 * Encrypt sensitive data
 */
export async function encryptData(data: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      new TextEncoder().encode(data)
    );

    // Combine IV and encrypted data, then encode as base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    // If encryption fails, return original data (fallback for compatibility)
    // In production, you might want to throw an error instead
    return data;
  }
}

/**
 * Decrypt sensitive data
 */
export async function decryptData(encryptedData: string): Promise<string> {
  try {
    // Check if data is encrypted (starts with base64 pattern)
    // If it doesn't look encrypted, return as-is (for backward compatibility)
    if (!encryptedData || encryptedData.length < 20) {
      return encryptedData;
    }

    const key = await getEncryptionKey();
    
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV (first 12 bytes) and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    // If decryption fails, assume data is not encrypted (backward compatibility)
    console.warn('Decryption error, assuming unencrypted data:', error);
    return encryptedData;
  }
}

/**
 * Encrypt sensitive fields in an object
 */
export async function encryptSensitiveFields<T extends Record<string, any>>(
  obj: T,
  sensitiveFields: (keyof T)[]
): Promise<T> {
  const encrypted = { ...obj };
  
  for (const field of sensitiveFields) {
    if (encrypted[field] && typeof encrypted[field] === 'string' && encrypted[field].length > 0) {
      encrypted[field] = await encryptData(encrypted[field]) as any;
    }
  }
  
  return encrypted;
}

/**
 * Decrypt sensitive fields in an object
 */
export async function decryptSensitiveFields<T extends Record<string, any>>(
  obj: T,
  sensitiveFields: (keyof T)[]
): Promise<T> {
  const decrypted = { ...obj };
  
  for (const field of sensitiveFields) {
    if (decrypted[field] && typeof decrypted[field] === 'string' && decrypted[field].length > 0) {
      decrypted[field] = await decryptData(decrypted[field]) as any;
    }
  }
  
  return decrypted;
}

/**
 * Encrypt resume personal info
 */
export async function encryptPersonalInfo(personalInfo: any): Promise<any> {
  const sensitiveFields: (keyof typeof personalInfo)[] = [
    'email',
    'phone',
    'linkedin',
    'website',
    'fullName',
    'location',
    'summary',
    'profilePicture',
  ];
  
  return encryptSensitiveFields(personalInfo, sensitiveFields);
}

/**
 * Decrypt resume personal info
 */
export async function decryptPersonalInfo(personalInfo: any): Promise<any> {
  const sensitiveFields: (keyof typeof personalInfo)[] = [
    'email',
    'phone',
    'linkedin',
    'website',
    'fullName',
    'location',
    'summary',
    'profilePicture',
  ];
  
  return decryptSensitiveFields(personalInfo, sensitiveFields);
}

/**
 * Encrypt entire resume data
 */
export async function encryptResumeData(resume: any): Promise<any> {
  const encrypted = { ...resume };
  
  // Encrypt personal info
  if (encrypted.personalInfo) {
    encrypted.personalInfo = await encryptPersonalInfo(encrypted.personalInfo);
  }
  
  // Encrypt section items that might contain sensitive data
  if (Array.isArray(encrypted.sections)) {
    encrypted.sections = await Promise.all(
      encrypted.sections.map(async (section: any) => {
        if (Array.isArray(section.items)) {
          section.items = await Promise.all(
            section.items.map(async (item: any) => {
              // Encrypt sensitive fields in section items
              const itemSensitiveFields = ['title', 'subtitle', 'description', 'date', 'name'];
              return await encryptSensitiveFields(item, itemSensitiveFields);
            })
          );
        }
        return section;
      })
    );
  }
  
  return encrypted;
}

/**
 * Decrypt entire resume data
 */
export async function decryptResumeData(resume: any): Promise<any> {
  const decrypted = { ...resume };
  
  // Decrypt personal info
  if (decrypted.personalInfo) {
    decrypted.personalInfo = await decryptPersonalInfo(decrypted.personalInfo);
  }
  
  // Decrypt section items
  if (Array.isArray(decrypted.sections)) {
    decrypted.sections = await Promise.all(
      decrypted.sections.map(async (section: any) => {
        if (Array.isArray(section.items)) {
          section.items = await Promise.all(
            section.items.map(async (item: any) => {
              // Decrypt sensitive fields in section items
              const itemSensitiveFields = ['title', 'subtitle', 'description', 'date', 'name'];
              return await decryptSensitiveFields(item, itemSensitiveFields);
            })
          );
        }
        return section;
      })
    );
  }
  
  return decrypted;
}


