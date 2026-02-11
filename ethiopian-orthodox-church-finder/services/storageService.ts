import { supabase } from '../lib/supabase';

export const storageService = {
  // Upload church image (used in registration form)
  // This is the only storage function used by the RegisterChurch form
  async uploadChurchImage(file: File, churchId: string, type: 'main' | 'interior' = 'main'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${churchId}/${type}.${fileExt}`;
    const filePath = `church-images/${fileName}`;

    console.log('[StorageService] Attempting to upload church image:', {
      fileName,
      filePath,
      churchId,
      type,
      fileSize: file.size,
      fileType: file.type,
    });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('church-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      // Detailed error logging for developers
      console.error('[StorageService] Upload error (detailed):', {
        message: uploadError.message,
        name: uploadError.name,
        filePath,
        churchId,
        type,
        error: uploadError,
        // Detailed diagnosis for developers
        diagnosis: uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('bucket')
          ? 'Bucket "church-images" not found. Create it in Supabase Storage settings.'
          : uploadError.message?.includes('new row violates row-level security policy') || uploadError.message?.includes('RLS')
          ? 'Storage upload failed due to security policy. Check storage bucket permissions in Supabase.'
          : uploadError.message?.includes('JWT') || uploadError.message?.includes('token')
          ? 'Authentication error. User may not be signed in or session expired.'
          : 'Unknown storage error. Check Supabase storage configuration.',
      });
      
      // Simple user-friendly error message
      const userErrorMessage = 'Failed to upload photo. Please try again.';
      
      const enhancedError = new Error(userErrorMessage);
      (enhancedError as any).originalError = uploadError;
      (enhancedError as any).isStorageError = true;
      throw enhancedError;
    }

    console.log('[StorageService] Upload successful:', {
      path: uploadData?.path,
      filePath,
    });

    const { data: urlData } = supabase.storage
      .from('church-images')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      // Detailed error logging for developers
      console.error('[StorageService] Failed to get public URL (detailed):', { 
        filePath, 
        urlData,
        churchId,
        type,
      });
      // Simple user-friendly error message
      const error = new Error('Failed to upload photo. Please try again.');
      throw error;
    }

    console.log('[StorageService] Public URL generated:', urlData.publicUrl);
    return urlData.publicUrl;
  },

  // Upload event image
  async uploadEventImage(file: File, eventId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${eventId}/image.${fileExt}`;
    const filePath = `event-images/${fileName}`;

    console.log('[StorageService] Attempting to upload event image:', {
      fileName,
      filePath,
      eventId,
      fileSize: file.size,
      fileType: file.type,
    });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      // Detailed error logging for developers
      console.error('[StorageService] Event image upload error (detailed):', {
        message: uploadError.message,
        name: uploadError.name,
        filePath,
        eventId,
        error: uploadError,
        // Detailed diagnosis for developers
        diagnosis: uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('bucket')
          ? 'Bucket "event-images" not found. Create it in Supabase Storage settings.'
          : uploadError.message?.includes('new row violates row-level security policy') || uploadError.message?.includes('RLS')
          ? 'Storage upload failed due to security policy. Check storage bucket permissions in Supabase.'
          : uploadError.message?.includes('JWT') || uploadError.message?.includes('token')
          ? 'Authentication error. User may not be signed in or session expired.'
          : 'Unknown storage error. Check Supabase storage configuration.',
      });
      
      // Simple user-friendly error message
      const userErrorMessage = 'Failed to upload photo. Please try again.';
      
      const enhancedError = new Error(userErrorMessage);
      (enhancedError as any).originalError = uploadError;
      (enhancedError as any).isStorageError = true;
      throw enhancedError;
    }

    console.log('[StorageService] Event image upload successful:', {
      path: uploadData?.path,
      filePath,
    });

    const { data: urlData } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      // Detailed error logging for developers
      console.error('[StorageService] Failed to get public URL (detailed):', { 
        filePath, 
        urlData,
        eventId,
      });
      // Simple user-friendly error message
      const error = new Error('Failed to upload photo. Please try again.');
      throw error;
    }

    return urlData.publicUrl;
  },
};

