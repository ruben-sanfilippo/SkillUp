import type { RispostaMessaggio } from './auth.interfaces';

export type RispostaOperazione = RispostaMessaggio & Record<string, unknown>;
