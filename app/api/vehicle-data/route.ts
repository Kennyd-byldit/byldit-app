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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const year = searchParams.get('year')
  const make = searchParams.get('make')

  try {
    if (type === 'makes' && year) {
      const res = await fetch(`${NHTSA}/GetMakesForVehicleType/Passenger%20Car?format=json`, {
        next: { revalidate: 86400 } // cache 24 hours
      })
      const data = await res.json()
      
      // Also fetch truck makes
      const res2 = await fetch(`${NHTSA}/GetMakesForVehicleType/Truck?format=json`, {
        next: { revalidate: 86400 }
      })
      const data2 = await res2.json()
      
      const allMakes = new Set([
        ...data.Results.map((m: any) => m.MakeName),
        ...data2.Results.map((m: any) => m.MakeName),
      ])
      
      // Filter to well-known brands, title-case, sort
      const makes = [...allMakes]
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
      const data = await res.json()
      const models = data.Results
        .map((m: any) => m.Model_Name)
        .filter((m: string) => m && !m.toLowerCase().includes('police') && !m.toLowerCase().includes('taxi'))
        .sort()
      
      return NextResponse.json({ models })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (e) {
    console.error('Vehicle API error:', e)
    return NextResponse.json({ error: 'Failed to fetch vehicle data' }, { status: 500 })
  }
}
