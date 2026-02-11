import { supabase } from '../lib/supabase';
import { Church, ChurchStatus, ClergyMember } from '../types';

// Transform database church to app church format
const transformChurch = (dbChurch: any): Church => {
  return {
    id: dbChurch.id,
    name: dbChurch.name,
    address: dbChurch.address,
    city: dbChurch.city,
    state: dbChurch.state,
    zip: dbChurch.zip,
    phone: dbChurch.phone || '',
    description: dbChurch.description || '',
    imageUrl: dbChurch.image_url || '',
    interiorImageUrl: dbChurch.interior_image_url,
    members: dbChurch.members || 0,
    clergy: dbChurch.clergy || [],
    events: dbChurch.events || [],
    services: dbChurch.services || [],
    serviceSchedule: dbChurch.service_schedule || [],
    languages: dbChurch.languages || [],
    features: dbChurch.features || {
      hasEnglishService: false,
      hasParking: false,
      wheelchairAccessible: false,
      hasSchool: false,
    },
    donationInfo: dbChurch.donation_info || {},
    isVerified: dbChurch.is_verified || false,
    status: dbChurch.status,
    adminId: dbChurch.admin_id,
    verificationDocumentUrl: dbChurch.verification_document_url,
    coordinates: dbChurch.coordinates,
    created_at: dbChurch.created_at,
    updated_at: dbChurch.updated_at,
  };
};

// Transform app church to database format
const transformChurchForDb = (church: Partial<Church>): any => {
  return {
    name: church.name,
    address: church.address,
    city: church.city,
    state: church.state,
    zip: church.zip,
    phone: church.phone,
    description: church.description,
    image_url: church.imageUrl,
    interior_image_url: church.interiorImageUrl,
    members: church.members,
    services: church.services,
    service_schedule: church.serviceSchedule,
    languages: church.languages,
    features: church.features,
    donation_info: church.donationInfo,
    is_verified: church.isVerified,
    status: church.status,
    admin_id: church.adminId,
    verification_document_url: church.verificationDocumentUrl,
    coordinates: church.coordinates,
  };
};

export const churchService = {
  // Get all approved churches (public)
  async getApprovedChurches(): Promise<Church[]> {
    try {
      const { data, error } = await supabase
        .from('churches')
        .select('*')
        .eq('status', 'approved')
        .order('name');

      if (error) {
        console.error('Error fetching churches:', error);
        // Return empty array if Supabase isn't configured
        if (error.message?.includes('Invalid API key') || error.message?.includes('JWT')) {
          return [];
        }
        throw error;
      }
      return (data || []).map(transformChurch);
    } catch (error: any) {
      console.error('Error in getApprovedChurches:', error);
      // Return empty array on any error to prevent app crash
      return [];
    }
  },

  // Get churches for admin (all statuses)
  async getAllChurchesForAdmin(): Promise<Church[]> {
    const { data, error } = await supabase
      .from('churches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(transformChurch);
  },

  // Get pending churches
  async getPendingChurches(): Promise<Church[]> {
    const { data, error } = await supabase
      .from('churches')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(transformChurch);
  },

  // Get churches for a specific church admin
  async getChurchesForAdmin(userId: string): Promise<Church[]> {
    const { data, error } = await supabase
      .from('church_admins')
      .select(`
        church_id,
        churches (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map((item: any) => transformChurch(item.churches));
  },

  // Check if a user is an admin of a specific church
  async isUserAdminOfChurch(userId: string, churchId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('church_admins')
      .select('id')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (error) {
      // If no record found, also check if user is the admin_id of the church
      const { data: churchData, error: churchError } = await supabase
        .from('churches')
        .select('admin_id')
        .eq('id', churchId)
        .single();

      if (churchError) return false;
      return churchData?.admin_id === userId;
    }
    return !!data;
  },

  // Get single church by ID
  async getChurchById(id: string): Promise<Church | null> {
    const { data, error } = await supabase
      .from('churches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return transformChurch(data);
  },

  // Create new church (pending status)
  async createChurch(church: Partial<Church>, userId: string, verificationDocUrl?: string): Promise<Church> {
    const churchData = transformChurchForDb({
      ...church,
      status: 'pending',
      adminId: userId,
      verificationDocumentUrl: verificationDocUrl,
    });

    console.log('[ChurchService] Creating church:', {
      name: churchData.name,
      status: churchData.status,
      admin_id: churchData.admin_id,
      userId,
      hasCoordinates: !!churchData.coordinates,
      hasImage: !!churchData.image_url,
    });

    // Check authentication before attempting insert
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      console.error('[ChurchService] Authentication check failed:', {
        authError: authError?.message,
        userId,
        authUser: authUser?.id,
      });
      throw new Error('You must be authenticated to create a church. Please sign in and try again.');
    }

    // Also check session to verify JWT token exists
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('[ChurchService] Authentication status:', {
      userId: authUser.id,
      email: authUser.email,
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      tokenExpiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
      sessionError: sessionError?.message,
    });

    if (!session || !session.access_token) {
      console.error('[ChurchService] No valid session/token found:', {
        session: !!session,
        accessToken: !!session?.access_token,
        'This means auth.uid() will return NULL in RLS policy': true,
      });
      throw new Error('Your session has expired. Please sign in again.');
    }

    // Log the exact data being sent (for debugging)
    console.log('[ChurchService] Data being inserted:', {
      name: churchData.name,
      status: churchData.status,
      statusType: typeof churchData.status,
      statusValue: JSON.stringify(churchData.status),
      admin_id: churchData.admin_id,
      admin_idType: typeof churchData.admin_id,
      hasCoordinates: !!churchData.coordinates,
      coordinatesType: typeof churchData.coordinates,
      allFields: Object.keys(churchData),
    });

    // Verify status is exactly 'pending' (string)
    if (churchData.status !== 'pending') {
      console.error('[ChurchService] CRITICAL: Status is not "pending"!', {
        actualStatus: churchData.status,
        statusType: typeof churchData.status,
        expected: 'pending',
      });
      throw new Error(`Invalid status: expected 'pending', got '${churchData.status}'`);
    }

    const { data, error } = await supabase
      .from('churches')
      .insert(churchData)
      .select()
      .single();

    if (error) {
      console.error('[ChurchService] Church insert error (DETAILED):', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        // Full error object
        fullError: error,
        // What we tried to insert
        attemptedInsert: {
          name: churchData.name,
          status: churchData.status,
          statusType: typeof churchData.status,
          admin_id: churchData.admin_id,
          admin_idType: typeof churchData.admin_id,
        },
        // Auth context
        authContext: {
          userId: authUser.id,
          userEmail: authUser.email,
          authRole: authUser.role || 'unknown',
        },
      });
      
      // If it's an RLS error, provide more context
      if (error.message?.includes('row-level security policy') || error.message?.includes('RLS')) {
        console.error('[ChurchService] RLS ERROR DIAGNOSIS:', {
          'Is user authenticated?': !!authUser,
          'User ID': authUser.id,
          'Status value': churchData.status,
          'Status type': typeof churchData.status,
          'Status === "pending"?': churchData.status === 'pending',
          'Admin ID': churchData.admin_id,
          'Suggestion': 'Check if INSERT policy exists in Supabase. Run DEBUG_CHURCHES_INSERT_RLS.sql',
        });
      }
      
      throw error;
    }

    console.log('[ChurchService] Church created successfully:', data.id);

    // Create church_admin relationship
    console.log('[ChurchService] Creating church_admin relationship:', {
      user_id: userId,
      church_id: data.id,
    });

    const { error: adminError } = await supabase
      .from('church_admins')
      .insert({
        user_id: userId,
        church_id: data.id,
      });

    if (adminError) {
      console.error('[ChurchService] Church admin insert error:', {
        message: adminError.message,
        code: adminError.code,
        details: adminError.details,
        hint: adminError.hint,
        user_id: userId,
        church_id: data.id,
      });
      throw adminError;
    }

    console.log('[ChurchService] Church admin relationship created successfully');

    // Update user role to church_admin
    console.log('[ChurchService] Updating user role to church_admin:', userId);

    const { error: roleError } = await supabase
      .from('profiles')
      .update({ role: 'church_admin' })
      .eq('id', userId);

    if (roleError) {
      console.error('[ChurchService] Role update error:', {
        message: roleError.message,
        code: roleError.code,
        details: roleError.details,
        userId,
      });
      throw roleError;
    }

    console.log('[ChurchService] User role updated successfully');

    return transformChurch(data);
  },

  // Update church (only by admin or super admin)
  async updateChurch(id: string, updates: Partial<Church>): Promise<Church> {
    const churchData = transformChurchForDb(updates);
    delete churchData.status; // Don't allow status updates through this method
    delete churchData.admin_id; // Don't allow admin_id updates through this method

    const { data, error } = await supabase
      .from('churches')
      .update(churchData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformChurch(data);
  },

  // Approve/reject church (super admin only)
  async updateChurchStatus(id: string, status: ChurchStatus): Promise<Church> {
    // First, verify the church exists and we can see it
    const { data: existingChurch, error: checkError } = await supabase
      .from('churches')
      .select('id, status')
      .eq('id', id)
      .single();

    if (checkError) {
      console.error('Error checking church existence:', checkError);
      throw new Error(`Church not found or not accessible: ${checkError.message}`);
    }

    if (!existingChurch) {
      throw new Error(`Church with id ${id} not found`);
    }

    // Perform the update
    const { data, error } = await supabase
      .from('churches')
      .update({ 
        status,
        is_verified: status === 'approved',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating church status:', error);
      // If it's a PGRST116 error, it means UPDATE might have succeeded but SELECT failed
      if (error.code === 'PGRST116') {
        throw new Error(
          `Update may have succeeded but could not read the result. ` +
          `This usually means the RLS policy is missing a WITH CHECK clause. ` +
          `Original error: ${error.message}`
        );
      }
      throw error;
    }

    if (!data) {
      throw new Error(`Update succeeded but no data returned. This indicates an RLS policy issue.`);
    }

    return transformChurch(data);
  },

  // Delete church
  async deleteChurch(id: string): Promise<void> {
    const { error } = await supabase
      .from('churches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get clergy for a church
  async getClergyForChurch(churchId: string): Promise<ClergyMember[]> {
    const { data, error } = await supabase
      .from('clergy_members')
      .select('*')
      .eq('church_id', churchId)
      .order('name');

    if (error) throw error;
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      role: item.role,
      imageUrl: item.image_url || '',
    }));
  },

  // Add clergy member
  async addClergyMember(churchId: string, clergy: Omit<ClergyMember, 'id'>): Promise<ClergyMember> {
    const { data, error } = await supabase
      .from('clergy_members')
      .insert({
        church_id: churchId,
        name: clergy.name,
        role: clergy.role,
        image_url: clergy.imageUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      role: data.role,
      imageUrl: data.image_url || '',
    };
  },

  // Delete clergy member
  async deleteClergyMember(clergyId: string): Promise<void> {
    const { error } = await supabase
      .from('clergy_members')
      .delete()
      .eq('id', clergyId);

    if (error) throw error;
  },
};

