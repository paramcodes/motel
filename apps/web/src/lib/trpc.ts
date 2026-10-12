import { type CreateTRPCReact, createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../api/src/routers';

export const trpc: CreateTRPCReact<AppRouter, any, any> = createTRPCReact<AppRouter>();
