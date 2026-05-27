type ContextValue = string | number | null | undefined

export type WaltContextVehicle = {
  nickname?: ContextValue
  year?: ContextValue
  make?: ContextValue
  model?: ContextValue
  trim?: ContextValue
  vin?: ContextValue
  color?: ContextValue
  engine?: ContextValue
  fuel_type?: ContextValue
  transmission?: ContextValue
  drivetrain?: ContextValue
  mileage?: ContextValue
  condition?: ContextValue
  notes?: ContextValue
}

export type WaltContextProject = {
  name?: ContextValue
  goal_type?: ContextValue
  project_mode?: ContextValue
  plan_type?: ContextValue
  condition?: ContextValue
  intake_summary?: ContextValue
  budget_estimate?: ContextValue
  budget_actual?: ContextValue
  status?: ContextValue
}

export type WaltContextPhase = {
  name?: ContextValue
  status?: ContextValue
  cost_estimate?: ContextValue
}

export type WaltContextStep = {
  name?: ContextValue
  status?: ContextValue
  difficulty?: ContextValue
  estimated_hours?: ContextValue
  cost_estimate?: ContextValue
  diy_or_shop?: ContextValue
  instructions?: ContextValue
}

export type WaltContextPack = {
  screen?: ContextValue
  userName?: ContextValue
  routeContext?: ContextValue
  vehicle?: WaltContextVehicle | null
  project?: WaltContextProject | null
  phase?: WaltContextPhase | null
  step?: WaltContextStep | null
  notes?: string[]
  parts?: string[]
  recentMessages?: string[]
  pageContext?: string
}

const present = (value: ContextValue) => value !== null && value !== undefined && String(value).trim() !== ''
const line = (label: string, value: ContextValue) => present(value) ? `${label}: ${value}` : ''

export function formatVehicleIdentity(vehicle?: WaltContextVehicle | null) {
  if (!vehicle) return 'Vehicle: not available'
  const identity = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(present).join(' ')
  const name = present(vehicle.nickname) ? `${vehicle.nickname} (${identity || 'identity incomplete'})` : identity || 'identity incomplete'

  return [
    `Vehicle: ${name}`,
    line('VIN', vehicle.vin),
    line('Color', vehicle.color),
    line('Engine', vehicle.engine),
    line('Fuel', vehicle.fuel_type),
    line('Transmission', vehicle.transmission),
    line('Drivetrain', vehicle.drivetrain),
    line('Mileage', vehicle.mileage),
    line('Garage condition/status', vehicle.condition),
    line('Vehicle notes', vehicle.notes),
    `Vehicle certainty: ${present(vehicle.vin) ? 'VIN-backed when decoded; user-entered fields still win when more specific.' : 'No VIN saved yet; treat year/make/model/trim/engine as user-entered or estimated.'}`,
  ].filter(Boolean).join('\n')
}

export function formatWaltContextPack(pack: WaltContextPack) {
  return [
    'WALT CONTEXT PACK',
    '',
    'User',
    line('Name', pack.userName) || 'Name: not available',
    '',
    'Screen',
    line('Current screen', pack.screen) || 'Current screen: not specified',
    line('Route/page context', pack.routeContext),
    '',
    'Vehicle',
    formatVehicleIdentity(pack.vehicle),
    '',
    'Project',
    pack.project ? [
      line('Name', pack.project.name),
      line('Goal/type', pack.project.goal_type),
      line('Project mode', pack.project.project_mode),
      line('Plan type', pack.project.plan_type),
      line('Condition/intake', pack.project.condition),
      line('Intake summary', pack.project.intake_summary),
      line('Budget estimate', pack.project.budget_estimate),
      line('Actual spend', pack.project.budget_actual),
      line('Status', pack.project.status),
    ].filter(Boolean).join('\n') : 'Project: not available',
    '',
    'Current Phase',
    pack.phase ? [
      line('Name', pack.phase.name),
      line('Status', pack.phase.status),
      line('Cost estimate', pack.phase.cost_estimate),
    ].filter(Boolean).join('\n') : 'Phase: not available',
    '',
    'Current Step',
    pack.step ? [
      line('Name', pack.step.name),
      line('Status', pack.step.status),
      line('Difficulty', pack.step.difficulty),
      line('Estimated hours', pack.step.estimated_hours),
      line('Cost estimate', pack.step.cost_estimate),
      line('DIY/shop', pack.step.diy_or_shop),
      line('Step detail', pack.step.instructions),
    ].filter(Boolean).join('\n') : 'Step: not available',
    '',
    'Project Memory',
    pack.notes?.length ? `Saved notes:\n- ${pack.notes.join('\n- ')}` : 'Saved notes: none loaded',
    pack.parts?.length ? `Parts:\n- ${pack.parts.join('\n- ')}` : 'Parts: none loaded',
    pack.recentMessages?.length ? `Recent Walt history:\n- ${pack.recentMessages.join('\n- ')}` : 'Recent Walt history: none loaded',
    '',
    'Page-Specific Context',
    pack.pageContext || 'None',
  ].filter(section => section !== '').join('\n')
}
