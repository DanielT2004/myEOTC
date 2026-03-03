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

  // Upload clergy member photo (optional).
  // Uses a unique filename per upload (clergyId-timestamp) so each replace creates a new object
  // and we avoid relying on upsert overwrite (which may not persist with some RLS policies).
  async uploadClergyImage(file: File, churchId: string, clergyIdOrIndex: string): Promise<string> {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/67875fe6-8e9e-45bf-8143-996870d73d61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storageService.ts:uploadClergyImage:entry',message:'Upload clergy image called',data:{fileName:file.name,churchId,clergyIdOrIndex,fileSize:file.size},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    const fileExt = file.name.split('.').pop() || 'jpg';
    const uniqueSuffix = Date.now();
    const fileName = `${churchId}/clergy/${clergyIdOrIndex}-${uniqueSuffix}.${fileExt}`;
    const filePath = `church-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('church-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/67875fe6-8e9e-45bf-8143-996870d73d61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storageService.ts:uploadClergyImage:error',message:'Clergy upload Supabase error',data:{message:uploadError.message,name:uploadError.name},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
      console.error('[StorageService] Clergy image upload error:', uploadError);
      throw new Error('Failed to upload clergy photo. Please try again.');
    }

    const { data: urlData } = supabase.storage.from('church-images').getPublicUrl(filePath);
    if (!urlData?.publicUrl) throw new Error('Failed to get clergy photo URL.');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/67875fe6-8e9e-45bf-8143-996870d73d61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storageService.ts:uploadClergyImage:success',message:'Clergy upload returned URL',data:{urlLen:urlData.publicUrl?.length},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    return urlData.publicUrl;
  },

  /**
   * Delete a clergy photo from storage by its public URL (e.g. when admin removes or replaces the photo).
   * No-op if the URL is not from our church-images bucket.
   */
  async deleteClergyImageByUrl(imageUrl: string): Promise<void> {
    if (!imageUrl || typeof imageUrl !== 'string') return;
    if (imageUrl.startsWith('blob:')) return;

    const bucket = 'church-images';

    try {
      const url = new URL(imageUrl);
      const segments = url.pathname.split('/').filter(Boolean);
      const publicIndex = segments.findIndex((s) => s === 'public');

      if (publicIndex === -1 || publicIndex + 2 >= segments.length) {
        console.warn('[StorageService] Could not parse clergy image URL for deletion:', imageUrl);
        return;
      }

      const bucketFromUrl = segments[publicIndex + 1];
      if (bucketFromUrl !== bucket) {
        console.warn('[StorageService] Clergy image URL is for different bucket, skipping delete:', {
          imageUrl,
          bucketFromUrl,
        });
        return;
      }

      const path = segments.slice(publicIndex + 2).join('/');
      if (!path) return;

      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) {
        console.warn('[StorageService] Failed to delete clergy image from storage:', {
          imageUrl,
          path,
          error,
        });
      } else {
        console.log('[StorageService] Deleted clergy image from storage:', {
          imageUrl,
          path,
        });
      }
    } catch (error) {
      console.warn('[StorageService] Error while parsing clergy image URL for deletion:', {
        imageUrl,
        error,
      });
    }
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

