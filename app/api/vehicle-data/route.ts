import { NextRequest, NextResponse } from 'next/server'

// NHTSA vPIC API — free, no key needed
const NHTSA = 'https://vpic.nhtsa.dot.gov/api/vehicles'

// Well-known makes to include (filters out obscure/commercial-only brands)
const KNOWN_MAKES = new Set([
  'Acura','Alfa Romeo','Aston Martin','Audi','Bentley','BMW','Buick','Cadillac',
  'Chevrolet','Chrysler','Dodge','Ferrari','Fiat','Ford','Genesis','GMC','Honda',
  'Hummer','Hyundai','Infiniti','Jaguar','Jeep','Kia','Lamborghini','Land Rover',
  'Lexus','Lincoln','Lotus','Maserati','Mazda','McLaren','Mercedes-Benz','Mercury',
  'Mini','Mitsubishi','Nissan','Oldsmobile','Plymouth','Pontiac','Porsche','Ram',
  'Rolls-Royce','Saab','Saturn','Scion','Smart','Subaru','Suzuki','Tesla','Toyota',
  'Volkswagen','Volvo'
])

type NhtsaMake = {
  MakeName?: string
}

type NhtsaModel = {
  Model_Name?: string
}

type NhtsaDecode = Record<string, string | null | undefined>

type NhtsaResponse<T> = {
  Results?: T[]
}

const cleanValue = (value: unknown) => {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed || trimmed.toLowerCase() === 'not applicable') return ''
  return trimmed
}

const joinParts = (parts: string[]) => parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()

function normalizeDecode(result: NhtsaDecode) {
  const displacement = cleanValue(result.DisplacementL)
  const cylinders = cleanValue(result.EngineCylinders)
  const engineModel = cleanValue(result.EngineModel)
  const engineConfig = cleanValue(result.EngineConfiguration)
  const trim = cleanValue(result.Trim) || cleanValue(result.Series)
  const driveType = cleanValue(result.DriveType)
  const drivetrain = driveType.toLowerCase().includes('4') ? '4WD'
    : driveType.toLowerCase().includes('all') ? 'AWD'
      : driveType.toLowerCase().includes('front') ? 'FWD'
        : driveType.toLowerCase().includes('rear') ? 'RWD'
          : driveType

  return {
    vin: cleanValue(result.VIN),
    year: cleanValue(result.ModelYear),
    make: cleanValue(result.Make),
    model: cleanValue(result.Model),
    trim,
    bodyClass: cleanValue(result.BodyClass),
    engine: joinParts([
      displacement ? `${displacement}L` : '',
      cylinders ? `${cylinders}-cyl` : '',
      engineConfig,
      engineModel,
    ]),
    fuel_type: cleanValue(result.FuelTypePrimary),
    transmission: cleanValue(result.TransmissionStyle) || cleanValue(result.TransmissionSpeeds),
    drivetrain,
    source: 'NHTSA vPIC',
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const year = searchParams.get('year')
  const make = searchParams.get('make')
  const vin = searchParams.get('vin')?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

  try {
    if (type === 'decode-vin' && vin) {
      if (vin.length !== 17) {
        return NextResponse.json({ error: 'VIN must be 17 characters.' }, { status: 400 })
      }

      const modelYear = year ? `&modelyear=${encodeURIComponent(year)}` : ''
      const res = await fetch(`${NHTSA}/DecodeVinValues/${encodeURIComponent(vin)}?format=json${modelYear}`, {
        next: { revalidate: 86400 },
      })
      const data = await res.json() as NhtsaResponse<NhtsaDecode>
      const decoded = data.Results?.[0] ? normalizeDecode(data.Results[0]) : null

      if (!decoded) return NextResponse.json({ error: 'VIN could not be decoded.' }, { status: 404 })
      return NextResponse.json({ vehicle: decoded })
    }

    if (type === 'makes' && year) {
      const res = await fetch(`${NHTSA}/GetMakesForVehicleType/Passenger%20Car?format=json`, {
        next: { revalidate: 86400 } // cache 24 hours
      })
      const data = await res.json() as NhtsaResponse<NhtsaMake>
      
      // Also fetch truck makes
      const res2 = await fetch(`${NHTSA}/GetMakesForVehicleType/Truck?format=json`, {
        next: { revalidate: 86400 }
      })
      const data2 = await res2.json() as NhtsaResponse<NhtsaMake>
      
      const allMakes = new Set([
        ...(data.Results || []).map(m => m.MakeName),
        ...(data2.Results || []).map(m => m.MakeName),
      ])
      
      // Filter to well-known brands, title-case, sort
      const makes = [...allMakes]
        .filter((m): m is string => Boolean(m))
        .map((m: string) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase())
        .map((m: string) => {
          // Fix specific capitalizations
          if (m === 'Bmw') return 'BMW'
          if (m === 'Gmc') return 'GMC'
          if (m === 'Mini') return 'MINI'
          return m
        })
        .filter(m => KNOWN_MAKES.has(m))
        .sort()
      
      return NextResponse.json({ makes })
    }

    if (type === 'models' && year && make) {
      const res = await fetch(
        `${NHTSA}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`,
        { next: { revalidate: 86400 } }
      )
      const data = await res.json() as NhtsaResponse<NhtsaModel>
      const models = (data.Results || [])
        .map(m => m.Model_Name)
        .filter((m): m is string => {
          if (!m) return false
          const model = m.toLowerCase()
          return !model.includes('police') && !model.includes('taxi')
        })
        .sort()
      
      return NextResponse.json({ models })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (e) {
    console.error('Vehicle API error:', e)
    return NextResponse.json({ error: 'Failed to fetch vehicle data' }, { status: 500 })
  }
}
