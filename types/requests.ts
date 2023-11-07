// Every API Request Response should be defined here

import type { USCFMember, USCFMemberTournament, USCFPlayerSearchResult, USCFTournament } from './uscf'
import type { CleanedGame } from '~/utils/games'
import type { Integrations } from '~/types/integrations'
import type { TableIntegrations } from '~/types/supabase'

type Failure = {
    success: false
    error: string
}

type GenericResponse = {
    success: boolean
    error?: string
}

export function failureResponse(message?: string): Failure {
    return {
        success: false,
        error: message || 'An unknown error occurred'
    }
}

// /api/auth //

// POST /api/auth/register
export type RegisterResponse = GenericResponse

// /api/games //

// GET /api/games/[id]
export type GetGameResponse = GenericResponse & { games: CleanedGame[] }

// POST /api/games/save
export type SaveGameResponse = GenericResponse

// /api/uscf //

// GET /api/uscf/[id]
export type USCFMemberResponse = GenericResponse & USCFMember

// GET /api/uscf/[id]/tournaments
export type USCFMemberTournamentsResponse = GenericResponse & { tournaments: USCFMemberTournament[], page: number, totalPages: number, totalEvents: number }

// GET /api/uscf/tournament/[id]
export type USCFTournamentResponse = USCFTournament

// POST /api/uscf/player-search
export type USCFPlayerSearchResponse = GenericResponse & { results: USCFPlayerSearchResult[], totalPlayers: number }

// /users/[id] //

// GET /users/[id]
export type UserResponse = GenericResponse & { user: { id: number, name: string } }

// GET /users/[id]/integrations
export type UserIntegrationsResponse = GenericResponse & { integrations: Record<Integrations, TableIntegrations | null> }

// /users/me //

// POST /users/me/integrations/link
export type UserLinkIntegrationResponse = GenericResponse & { integration: TableIntegrations }

// POST /users/me/integrations/unlink
export type UserUnlinkIntegrationResponse = GenericResponse
