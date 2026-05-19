'use client'
import WaltPanel from '@/components/WaltPanel'
import { BottomNav, LoadingScreen, MobileAppFrame, MobileHeader, VehicleHero, WaltEntryBar } from '@/components/AppChrome'
import { supabase } from '@/lib/supabase'
import { WALT_AVATAR_URL } from '@/lib/app-constants'
import { getVehicleName, getVehiclePhoto } from '@/lib/vehicle-display'
import type { VehicleSummary } from '@/lib/types'

export const WALT = WALT_AVATAR_URL
export type Vehicle = VehicleSummary
export { LoadingScreen, VehicleHero, getVehicleName, getVehiclePhoto, supabase }

export const CreateProjectFrame = ({
  backHref,
  children,
  waltOpen,
  onOpenWalt,
  onCloseWalt,
  waltContext,
  waltOpeningLine,
  waltPrompt,
  vehicleId,
  screen,
}: {
  backHref: string
  children: React.ReactNode
  waltOpen: boolean
  onOpenWalt: () => void
  onCloseWalt: () => void
  waltContext: string
  waltOpeningLine: string
  waltPrompt?: string
  vehicleId?: string
  screen: string
}) => (
  <MobileAppFrame>
    <MobileHeader backHref={backHref} />
    {children}
    <WaltEntryBar onOpenWalt={onOpenWalt} prompt={waltPrompt} />
    <BottomNav active="Projects" />
    <WaltPanel
      open={waltOpen}
      onClose={onCloseWalt}
      context={waltContext}
      openingLine={waltOpeningLine}
      vehicleId={vehicleId}
      screen={screen}
    />
  </MobileAppFrame>
)

export async function loadCreateProjectVehicle(vehicleId: string) {
  if (!vehicleId) return { vehicle: null, needsRedirect: '/create-project' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { vehicle: null, needsRedirect: '/login' }

  const { data } = await supabase
    .from('vehicles')
    .select('id, nickname, year, make, model, cover_photo_url')
    .eq('id', vehicleId)
    .eq('user_id', user.id)
    .single()

  if (!data) return { vehicle: null, needsRedirect: '/create-project' }
  return { vehicle: data as Vehicle, needsRedirect: null, userId: user.id }
}
