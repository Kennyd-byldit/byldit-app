export const PROJECT_MODES = ['maintenance', 'repair', 'upgrade', 'restoration', 'diagnostic'] as const

export type ProjectMode = typeof PROJECT_MODES[number]

export const PLAN_TYPES = ['checklist', 'repair_plan', 'upgrade_plan', 'phase_plan', 'diagnostic_log'] as const

export type PlanType = typeof PLAN_TYPES[number]

export const PROJECT_MODE_LABELS: Record<ProjectMode, string> = {
  maintenance: 'Maintenance',
  repair: 'Repair',
  upgrade: 'Upgrade',
  restoration: 'Restoration',
  diagnostic: 'Diagnostic',
}

export const PROJECT_MODE_DESCRIPTIONS: Record<ProjectMode, string> = {
  maintenance: 'Routine service or repeatable work you want done right.',
  repair: 'Known issue, broken part, or system that needs fixing.',
  upgrade: 'Improve the vehicle with better parts, fitment, or capability.',
  restoration: 'Longer-term build with larger phases and milestones.',
  diagnostic: 'Something feels wrong and Walt needs to help find the cause.',
}

export const PROJECT_MODE_OPENERS: Record<ProjectMode, string> = {
  maintenance: 'What maintenance are we doing?',
  repair: 'What are we fixing or replacing?',
  upgrade: 'What are you looking to upgrade?',
  restoration: 'What is the restoration goal?',
  diagnostic: 'Tell me what is happening. What symptom are you noticing?',
}

export const PROJECT_MODE_EXAMPLES: Record<ProjectMode, string[]> = {
  maintenance: ['Oil change', 'Brake service', 'Tire rotation'],
  repair: ['Replace alternator', 'Fix coolant leak', 'Front brakes'],
  upgrade: ['3-inch lift', 'Wheels and tires', 'Better lighting'],
  restoration: ['Full restoration', 'Interior refresh', 'Body and paint'],
  diagnostic: ['Stiff brake pedal', 'Cranks but will not start', 'Clunk over bumps'],
}

export const PROJECT_MODE_PLAN_TYPE: Record<ProjectMode, PlanType> = {
  maintenance: 'checklist',
  repair: 'repair_plan',
  upgrade: 'upgrade_plan',
  restoration: 'phase_plan',
  diagnostic: 'diagnostic_log',
}

export function inferProjectMode(goalType: string): ProjectMode | null {
  const goal = goalType.toLowerCase()

  if (goal.includes('diagnostic') || goal.includes('symptom') || goal.includes('troubleshoot')) {
    return 'diagnostic'
  }

  if (
    goal.includes('maintenance') ||
    goal.includes('service') ||
    goal.includes('oil change') ||
    goal.includes('tire rotation') ||
    goal.includes('filter') ||
    goal.includes('fluid') ||
    goal.includes('tune-up')
  ) {
    return 'maintenance'
  }

  if (
    goal.includes('upgrade') ||
    goal.includes('mod') ||
    goal.includes('restomod') ||
    goal.includes('lift') ||
    goal.includes('wheels') ||
    goal.includes('tires') ||
    goal.includes('audio') ||
    goal.includes('stereo') ||
    goal.includes('performance') ||
    goal.includes('swap')
  ) {
    return 'upgrade'
  }

  if (
    goal.includes('restoration') ||
    goal.includes('restore') ||
    goal.includes('body') ||
    goal.includes('paint') ||
    goal.includes('interior')
  ) {
    return 'restoration'
  }

  if (
    goal.includes('repair') ||
    goal.includes('replace') ||
    goal.includes('fix') ||
    goal.includes('brake') ||
    goal.includes('electrical')
  ) {
    return 'repair'
  }

  return null
}

export function getPlanTypeForMode(mode: ProjectMode | null): PlanType {
  return mode ? PROJECT_MODE_PLAN_TYPE[mode] : 'phase_plan'
}
