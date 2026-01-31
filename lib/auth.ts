import { supabaseServer } from './supabaseServer'

export async function validateAuthToken(authHeader: string | null): Promise<string> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header')
  }

  const token = authHeader.replace('Bearer ', '')
  
  const { data: { user }, error } = await supabaseServer.auth.getUser(token)
  
  if (error || !user) {
    throw new Error('Invalid or expired token')
  }

  return user.id
}
