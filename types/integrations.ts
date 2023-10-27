import { Database } from './supabase'

export type IntegrationJson = {
    id: string
    username?: string
}

export type Integrations = Database['public']['Enums']['Integrations']
