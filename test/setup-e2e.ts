import { config } from 'dotenv';

// Carrega .env.test, mas NÃO sobrescreve variáveis já definidas (ex: CI)
config({ path: '.env.test', override: false });
