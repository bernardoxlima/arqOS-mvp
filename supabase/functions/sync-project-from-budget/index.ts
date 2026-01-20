// ============================================================================
// Edge Function: Sync Project from Budget
// Description: Create a project when a budget is approved
// Author: DevOps Senior
// Date: 2026-01-19
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================================================
// TYPES
// ============================================================================

interface SyncProjectRequest {
  budget_id: string
  architect_id?: string
  start_date?: string
  deadline?: string
  notes?: string
}

interface WorkflowStage {
  id: string
  name: string
  color: string
  order: number
}

// ============================================================================
// DEFAULT WORKFLOWS
// ============================================================================

const DEFAULT_WORKFLOWS: Record<string, WorkflowStage[]> = {
  decorexpress: [
    { id: 'formulario', name: 'Formulário', color: '#8B5CF6', order: 1 },
    { id: 'visita_tecnica', name: 'Visita Técnica', color: '#3B82F6', order: 2 },
    { id: 'reuniao_briefing', name: 'Reunião Briefing', color: '#06B6D4', order: 3 },
    { id: 'conceito', name: 'Conceito', color: '#10B981', order: 4 },
    { id: 'projeto_3d', name: 'Projeto 3D', color: '#F59E0B', order: 5 },
    { id: 'revisao', name: 'Revisão', color: '#EF4444', order: 6 },
    { id: 'lista_compras', name: 'Lista de Compras', color: '#EC4899', order: 7 },
    { id: 'apresentacao', name: 'Apresentação', color: '#8B5CF6', order: 8 },
  ],
  interiores: [
    { id: 'briefing', name: 'Briefing', color: '#8B5CF6', order: 1 },
    { id: 'levantamento', name: 'Levantamento', color: '#3B82F6', order: 2 },
    { id: 'estudo_preliminar', name: 'Estudo Preliminar', color: '#06B6D4', order: 3 },
    { id: 'anteprojeto', name: 'Anteprojeto', color: '#10B981', order: 4 },
    { id: 'projeto_3d', name: 'Projeto 3D', color: '#F59E0B', order: 5 },
    { id: 'revisao_cliente', name: 'Revisão Cliente', color: '#EF4444', order: 6 },
    { id: 'projeto_executivo', name: 'Projeto Executivo', color: '#EC4899', order: 7 },
    { id: 'detalhamento', name: 'Detalhamento', color: '#8B5CF6', order: 8 },
    { id: 'entrega', name: 'Entrega', color: '#22C55E', order: 9 },
  ],
  arquitetonico: [
    { id: 'briefing', name: 'Briefing', color: '#8B5CF6', order: 1 },
    { id: 'estudo', name: 'Estudo Preliminar', color: '#3B82F6', order: 2 },
    { id: 'anteprojeto', name: 'Anteprojeto', color: '#06B6D4', order: 3 },
    { id: 'executivo', name: 'Executivo', color: '#22C55E', order: 4 },
    { id: 'obra', name: 'Acompanhamento', color: '#F59E0B', order: 5 },
    { id: 'finalizado', name: 'Finalizado', color: '#6B7280', order: 6 },
  ],
  producao: [
    { id: 'lista_aprovada', name: 'Lista Aprovada', color: '#8B5CF6', order: 1 },
    { id: 'cotacao', name: 'Cotação', color: '#3B82F6', order: 2 },
    { id: 'aprovacao_orcamento', name: 'Aprovação Orçamento', color: '#06B6D4', order: 3 },
    { id: 'compras', name: 'Compras', color: '#10B981', order: 4 },
    { id: 'rastreamento', name: 'Rastreamento', color: '#F59E0B', order: 5 },
    { id: 'recebimento', name: 'Recebimento', color: '#EF4444', order: 6 },
    { id: 'instalacao', name: 'Instalação', color: '#EC4899', order: 7 },
    { id: 'finalizado', name: 'Finalizado', color: '#22C55E', order: 8 },
  ],
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    })

    // Parse request
    const body: SyncProjectRequest = await req.json()
    const { budget_id, architect_id, start_date, deadline, notes } = body

    if (!budget_id) {
      return new Response(
        JSON.stringify({ error: 'budget_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get budget details
    const { data: budget, error: budgetError } = await supabaseClient
      .from('budgets')
      .select('*')
      .eq('id', budget_id)
      .single()

    if (budgetError || !budget) {
      return new Response(
        JSON.stringify({ error: 'Budget not found', details: budgetError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if budget is approved
    if (budget.status !== 'approved') {
      return new Response(
        JSON.stringify({ error: 'Budget must be approved to create a project' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if project already exists for this budget
    const { data: existingProject } = await supabaseClient
      .from('projects')
      .select('id, code')
      .eq('budget_id', budget_id)
      .single()

    if (existingProject) {
      return new Response(
        JSON.stringify({
          error: 'Project already exists for this budget',
          project_id: existingProject.id,
          project_code: existingProject.code,
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get workflow template from lookup_data or use default
    const { data: workflowTemplate } = await supabaseClient
      .from('lookup_data')
      .select('data')
      .eq('organization_id', budget.organization_id)
      .eq('type', 'workflow_template')
      .ilike('name', `%${budget.service_type}%`)
      .limit(1)
      .single()

    const workflowStages = workflowTemplate?.data?.stages ||
      DEFAULT_WORKFLOWS[budget.service_type] ||
      DEFAULT_WORKFLOWS.interiores

    // Get architect name if ID provided
    let architectName = null
    if (architect_id) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('full_name')
        .eq('id', architect_id)
        .single()
      architectName = profile?.full_name
    }

    // Calculate deadline if not provided
    const projectStartDate = start_date || new Date().toISOString().split('T')[0]
    const projectDeadline = deadline || (() => {
      const d = new Date(projectStartDate)
      // Add 60 days as default deadline
      d.setDate(d.getDate() + 60)
      return d.toISOString().split('T')[0]
    })()

    // Extract values from budget
    const calculation = budget.calculation || {}
    const details = budget.details || {}

    // Build project data
    const projectData = {
      organization_id: budget.organization_id,
      budget_id: budget.id,
      client_id: budget.client_id,
      client_snapshot: budget.client_snapshot,
      service_type: budget.service_type,
      status: 'aguardando',
      stage: workflowStages[0]?.id || 'briefing',
      workflow: {
        type: budget.service_type,
        stages: workflowStages,
        current_stage_index: 0,
      },
      team: {
        architect_id: architect_id || null,
        architect_name: architectName,
        members: [],
        squad: null,
      },
      schedule: {
        start_date: projectStartDate,
        deadline: projectDeadline,
        briefing_date: null,
        presentation_date: null,
        milestones: [],
      },
      financials: {
        value: calculation.final_price || 0,
        estimated_hours: calculation.estimated_hours || 0,
        hours_used: 0,
        hour_rate: calculation.hour_rate || 0,
      },
      scope: budget.scope || [],
      notes: notes || budget.notes,
    }

    // Create project (code will be auto-generated by trigger)
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (projectError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create project', details: projectError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create initial finance records based on payment terms
    const paymentTerms = budget.payment_terms || {}
    const installments = paymentTerms.installments || []
    const projectValue = calculation.final_price || 0

    const financeRecords = installments.map((inst: { percent: number; description: string }, index: number) => ({
      organization_id: budget.organization_id,
      type: 'income',
      category: 'projeto',
      project_id: project.id,
      description: `${project.code} - ${inst.description}`,
      value: Math.round((projectValue * inst.percent / 100) * 100) / 100,
      date: projectStartDate,
      due_date: null, // Will be set when milestone is reached
      status: 'pending',
      installment: `${index + 1}/${installments.length}`,
      metadata: {
        client: budget.client_snapshot?.name,
        project_code: project.code,
        payment_method: null,
        receipt_url: null,
      },
    }))

    if (financeRecords.length > 0) {
      const { error: financeError } = await supabaseClient
        .from('finance_records')
        .insert(financeRecords)

      if (financeError) {
        console.error('Failed to create finance records:', financeError)
        // Don't fail the whole operation, just log the error
      }
    }

    // Log activity
    await supabaseClient.from('activity_log').insert({
      organization_id: budget.organization_id,
      entity_type: 'project',
      entity_id: project.id,
      action: 'created',
      changes: {
        source: 'budget_approval',
        budget_id: budget.id,
        budget_code: budget.code,
      },
    })

    return new Response(
      JSON.stringify({
        success: true,
        project_id: project.id,
        project_code: project.code,
        finance_records_created: financeRecords.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error syncing project from budget:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
