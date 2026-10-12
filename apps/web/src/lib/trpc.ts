import { createTRPCReact, type CreateTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../api/src/routers';

export const trpc: CreateTRPCReact<AppRouter, unknown, null> = createTRPCReact<AppRouter>();
