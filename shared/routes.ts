import { z } from 'zod';
import { mobileInfoSchema, aadharInfoSchema, vehicleInfoSchema, emailInfoSchema, ipInfoSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  serverError: z.object({
    message: z.string(),
  }),
};

export const api = {
  user: {
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.object({
          id: z.string(),
          username: z.string(),
        }),
        401: errorSchemas.unauthorized,
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/user/history',
      responses: {
        200: z.array(z.any()),
        401: errorSchemas.unauthorized,
      },
    },
  },
  services: {
    mobile: {
      method: 'POST' as const,
      path: '/api/services/mobile',
      input: mobileInfoSchema,
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    aadhar: {
      method: 'POST' as const,
      path: '/api/services/aadhar',
      input: aadharInfoSchema,
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    vehicle: {
      method: 'POST' as const,
      path: '/api/services/vehicle',
      input: vehicleInfoSchema,
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    email: {
      method: 'POST' as const,
      path: '/api/services/email',
      input: emailInfoSchema,
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    ip: {
      method: 'POST' as const,
      path: '/api/services/ip',
      input: ipInfoSchema,
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
};
