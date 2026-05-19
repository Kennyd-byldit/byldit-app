import { FALLBACK_VEHICLE_PHOTOS } from './app-constants'
import type { VehicleSummary } from './types'

export function getVehicleName(vehicle: Pick<VehicleSummary, 'nickname' | 'year' | 'make' | 'model'>) {
  return vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`
}

export function getVehiclePhoto(vehicle: Pick<VehicleSummary, 'model' | 'cover_photo_url'>): string | null {
  if (vehicle.cover_photo_url) return vehicle.cover_photo_url

  const model = vehicle.model?.toLowerCase() || ''
  if (model.includes('ranger')) return FALLBACK_VEHICLE_PHOTOS.ranger
  if (model.includes('f250') || model.includes('f-250')) return FALLBACK_VEHICLE_PHOTOS.f250

  return null
}
