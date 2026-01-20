// ============================================================================
// Edge Function: Calculate Budget
// Description: Calculate budget pricing based on service type and parameters
// Author: DevOps Senior
// Date: 2026-01-19
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================================================
// TYPES
// ============================================================================

interface Room {
  id: number
  name: string
  size: 'P' | 'M' | 'G'
}

interface CalculateBudgetRequest {
  organization_id: string
  service_type: string
  calc_mode: 'sqm' | 'room'
  area?: number
  rooms?: number
  room_list?: Room[]
  complexity: 'simples' | 'padrao' | 'complexo' | 'muito_complexo'
  finish: 'economico' | 'padrao' | 'alto_padrao' | 'luxo'
  modality?: 'online' | 'presencial'
  extras?: Array<{ name: string; value: number; hours?: number }>
  discount_percent?: number
  survey_fee?: number
}

interface CalculateBudgetResponse {
  base_price: number
  multipliers: {
    complexity: number
    finish: number
  }
  extras_total: number
  survey_fee: number
  discount: number
  final_price: number
  estimated_hours: number
  hour_rate: number
  efficiency: 'Ótimo' | 'Bom' | 'Reajustar'
  price_per_m2: number | null
  breakdown: {
    label: string
    value: number
    hours?: number
  }[]
}

// ============================================================================
// PRICING CONSTANTS
// ============================================================================

const COMPLEXITY_FACTORS = {
  simples: 0.8,
  padrao: 1.0,
  complexo: 1.3,
  muito_complexo: 1.5,
}

const FINISH_FACTORS = {
  economico: 0.9,
  padrao: 1.0,
  alto_padrao: 1.2,
  luxo: 1.4,
}

const ROOM_PRICING = {
  interiores: { P: 2500, M: 4000, G: 6000 },
  decoracao: { P: 1500, M: 2500, G: 4000 },
  decorexpress: { P: 1200, M: 2000, G: 3200 },
}

const SQM_PRICING = {
  arquitetonico: { min: 80, max: 150 },
  interiores: { min: 120, max: 200 },
  reforma: { min: 100, max: 180 },
  comercial: { min: 150, max: 250 },
}

const HOURS_PER_M2 = {
  arquitetonico: 1.2,
  interiores: 1.0,
  reforma: 0.8,
  comercial: 1.1,
}

const HOURS_PER_ROOM = {
  P: 6,
  M: 10,
  G: 14,
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

function calculateBySquareMeter(
  area: number,
  serviceType: string,
  complexity: string,
  finish: string
): { basePrice: number; hours: number } {
  const pricing = SQM_PRICING[serviceType as keyof typeof SQM_PRICING] || SQM_PRICING.interiores
  const hoursPerM2 = HOURS_PER_M2[serviceType as keyof typeof HOURS_PER_M2] || 1.0

  // Progressive pricing: smaller areas have higher per-m2 cost
  let pricePerM2: number
  if (area <= 50) {
    pricePerM2 = pricing.max
  } else if (area >= 200) {
    pricePerM2 = pricing.min
  } else {
    // Linear interpolation
    const ratio = (area - 50) / 150
    pricePerM2 = pricing.max - ratio * (pricing.max - pricing.min)
  }

  const basePrice = area * pricePerM2
  const hours = area * hoursPerM2

  return { basePrice, hours }
}

function calculateByRooms(
  roomList: Room[],
  serviceType: string
): { basePrice: number; hours: number; breakdown: { label: string; value: number; hours: number }[] } {
  const pricing = ROOM_PRICING[serviceType as keyof typeof ROOM_PRICING] || ROOM_PRICING.interiores

  let basePrice = 0
  let hours = 0
  const breakdown: { label: string; value: number; hours: number }[] = []

  for (const room of roomList) {
    const roomPrice = pricing[room.size]
    const roomHours = HOURS_PER_ROOM[room.size]

    basePrice += roomPrice
    hours += roomHours

    breakdown.push({
      label: `${room.name} (${room.size})`,
      value: roomPrice,
      hours: roomHours,
    })
  }

  return { basePrice, hours, breakdown }
}

function calculateEfficiency(hourRate: number): 'Ótimo' | 'Bom' | 'Reajustar' {
  if (hourRate >= 250) return 'Ótimo'
  if (hourRate >= 150) return 'Bom'
  return 'Reajustar'
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request
    const body: CalculateBudgetRequest = await req.json()

    const {
      organization_id,
      service_type,
      calc_mode,
      area = 0,
      rooms = 0,
      room_list = [],
      complexity,
      finish,
      modality = 'presencial',
      extras = [],
      discount_percent = 0,
      survey_fee = 0,
    } = body

    // Validate required fields
    if (!organization_id || !service_type || !complexity || !finish) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get organization settings for custom pricing (optional)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: orgData } = await supabaseClient
      .from('organizations')
      .select('settings')
      .eq('id', organization_id)
      .single()

    // Calculate base price and hours
    let basePrice = 0
    let estimatedHours = 0
    let breakdown: { label: string; value: number; hours?: number }[] = []

    if (calc_mode === 'sqm' && area > 0) {
      const sqmResult = calculateBySquareMeter(area, service_type, complexity, finish)
      basePrice = sqmResult.basePrice
      estimatedHours = sqmResult.hours
      breakdown.push({
        label: `Área ${area}m² (${service_type})`,
        value: basePrice,
        hours: estimatedHours,
      })
    } else if (calc_mode === 'room' && room_list.length > 0) {
      const roomResult = calculateByRooms(room_list, service_type)
      basePrice = roomResult.basePrice
      estimatedHours = roomResult.hours
      breakdown = roomResult.breakdown
    } else if (rooms > 0) {
      // Simple room count without sizes
      const pricing = ROOM_PRICING[service_type as keyof typeof ROOM_PRICING] || ROOM_PRICING.interiores
      basePrice = rooms * pricing.M // Use medium as default
      estimatedHours = rooms * HOURS_PER_ROOM.M
      breakdown.push({
        label: `${rooms} ambientes`,
        value: basePrice,
        hours: estimatedHours,
      })
    }

    // Apply multipliers
    const complexityFactor = COMPLEXITY_FACTORS[complexity]
    const finishFactor = FINISH_FACTORS[finish]

    const priceAfterMultipliers = basePrice * complexityFactor * finishFactor
    const hoursAfterComplexity = estimatedHours * complexityFactor

    // Add extras
    let extrasTotal = 0
    let extrasHours = 0
    for (const extra of extras) {
      extrasTotal += extra.value
      extrasHours += extra.hours || 0
      breakdown.push({
        label: extra.name,
        value: extra.value,
        hours: extra.hours,
      })
    }

    // Add survey fee
    if (survey_fee > 0) {
      breakdown.push({
        label: 'Taxa de levantamento',
        value: survey_fee,
      })
    }

    // Calculate totals
    const subtotal = priceAfterMultipliers + extrasTotal + survey_fee
    const discount = subtotal * (discount_percent / 100)
    const finalPrice = subtotal - discount
    const totalHours = hoursAfterComplexity + extrasHours

    // Calculate metrics
    const hourRate = totalHours > 0 ? finalPrice / totalHours : 0
    const pricePerM2 = area > 0 ? finalPrice / area : null
    const efficiency = calculateEfficiency(hourRate)

    // Build response
    const response: CalculateBudgetResponse = {
      base_price: Math.round(priceAfterMultipliers * 100) / 100,
      multipliers: {
        complexity: complexityFactor,
        finish: finishFactor,
      },
      extras_total: Math.round(extrasTotal * 100) / 100,
      survey_fee,
      discount: Math.round(discount * 100) / 100,
      final_price: Math.round(finalPrice * 100) / 100,
      estimated_hours: Math.round(totalHours * 10) / 10,
      hour_rate: Math.round(hourRate * 100) / 100,
      efficiency,
      price_per_m2: pricePerM2 ? Math.round(pricePerM2 * 100) / 100 : null,
      breakdown,
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error calculating budget:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
