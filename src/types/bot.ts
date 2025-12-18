export type BotStep =
  | 'NULL' // Início
  | 'MENU_PRINCIPAL' // Menu inicial
  | 'ESCOLHER_BARBEIRO' // Lista de barbeiros
  | 'ESCOLHER_SERVICO' // Lista de serviços (NOVO) 🆕
  | 'ESCOLHER_HORARIO' // Lista de horários

export interface SessionData {
  step: BotStep
  barbershopId: string
  tempBooking?: {
    professionalId?: string
    serviceId?: string // Agora vamos capturar isso corretamente
    date?: string
    time?: string
  }
}
