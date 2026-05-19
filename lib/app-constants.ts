export const WALT_AVATAR_URL =
  'https://bvhdfoemvsrosmlslfro.supabase.co/storage/v1/object/public/Assets/walt-v1.png'

export const FALLBACK_VEHICLE_PHOTOS = {
  ranger: '/photos/ranger-2025.jpg',
  f250: '/photos/f250-hiboy-68.jpg',
} as const

export const APP_NAV_ITEMS = [
  { icon: '🏠', label: 'Garage', href: '/garage' },
  { icon: '🔧', label: 'Projects', href: '/projects' },
  { icon: '🔩', label: 'Parts', href: null },
  { icon: '📋', label: "Walt's Notes", href: null },
] as const
