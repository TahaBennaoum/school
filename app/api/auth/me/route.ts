import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix

    // Create Supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      }
    );

    // Verify token and get user
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token or user not found' },
        { status: 401 }
      );
    }

    // Return user data (you can extend this to fetch from Prisma if needed)
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        supabaseId: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name || 'Utilisateur',
        lastName: user.user_metadata?.last_name || '',
        role: user.user_metadata?.role || 'TEACHER',
        phone: user.user_metadata?.phone,
        avatar: user.user_metadata?.avatar,
        isActive: true,
      },
    });
  } catch (error) {
    console.error('Auth ME endpoint error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
