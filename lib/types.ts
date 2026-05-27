import type { PlanType, ProjectMode } from './project-modes'

export type VehicleSummary = {
  id: string
  nickname: string | null
  year: number
  make: string
  model: string
  trim: string | null
  cover_photo_url: string | null
}

export type VehicleDetail = VehicleSummary & {
  vin: string | null
  color: string | null
  engine: string | null
  fuel_type: string | null
  transmission: string | null
  drivetrain: string | null
  mileage: number | null
  condition: string | null
  title_status: string | null
  notes: string | null
  is_primary: boolean
}

export type ProjectSummary = {
  id: string
  vehicle_id: string
  name: string
  goal_type: string
  project_mode: ProjectMode | null
  plan_type: PlanType | null
  intake_summary: string | null
  status: string
}

export type WaltMessage = {
  role: 'user' | 'walt'
  content: string
}
