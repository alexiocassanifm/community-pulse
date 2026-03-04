import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerClient();

    // Test the connection by querying Supabase
    const { error } = await supabase.from('anonymous_submissions').select('count', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json(
        { status: 'error', message: `Supabase connection failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { status: 'ok', supabase: 'connected' },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { status: 'error', message: `Health check failed: ${message}` },
      { status: 500 }
    );
  }
}
