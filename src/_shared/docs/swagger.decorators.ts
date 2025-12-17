import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export const AuthApiDoc = {
  Register: () =>
    applyDecorators(
      ApiTags('Auth'),
      ApiOperation({
        summary: 'Register new user',
        description: 'Create a new user account with email and password',
      }),
      ApiResponse({
        status: 201,
        description: 'User successfully registered',
      }),
      ApiResponse({
        status: 400,
        description: 'Invalid input data',
      }),
      ApiResponse({
        status: 409,
        description: 'User already exists',
      }),
    ),

  Login: () =>
    applyDecorators(
      ApiTags('Auth'),
      ApiOperation({
        summary: 'User login',
        description: 'Authenticate user and return tokens',
      }),
      ApiResponse({
        status: 200,
        description: 'Successfully authenticated',
      }),
      ApiResponse({
        status: 401,
        description: 'Invalid credentials',
      }),
    ),

  Refresh: () =>
    applyDecorators(
      ApiTags('Auth'),
      ApiOperation({
        summary: 'Refresh access token',
        description: 'Generate new access token',
      }),
      ApiResponse({
        status: 200,
        description: 'Token successfully refreshed',
      }),
      ApiResponse({
        status: 401,
        description: 'Invalid refresh token',
      }),
    ),

  Logout: () =>
    applyDecorators(
      ApiTags('Auth'),
      ApiOperation({
        summary: 'User logout',
        description: 'Invalidate refresh token',
      }),
      ApiResponse({
        status: 204,
        description: 'Successfully logged out',
      }),
    ),
};

export const ClientsApiDoc = {
  Create: () =>
    applyDecorators(
      ApiTags('Clients'),
      ApiBearerAuth('access-token'),
      ApiOperation({
        summary: 'Create new client',
        description: 'Register a new client',
      }),
      ApiResponse({
        status: 201,
        description: 'Client successfully created',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
      }),
      ApiResponse({
        status: 409,
        description: 'Client already exists',
      }),
    ),

  Fetch: () =>
    applyDecorators(
      ApiTags('Clients'),
      ApiBearerAuth('access-token'),
      ApiOperation({
        summary: 'List clients',
        description: 'Retrieve list of clients',
      }),
      ApiResponse({
        status: 200,
        description: 'Clients retrieved successfully',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
      }),
    ),

  Update: () =>
    applyDecorators(
      ApiTags('Clients'),
      ApiBearerAuth('access-token'),
      ApiOperation({
        summary: 'Update client',
        description: 'Update client information',
      }),
      ApiResponse({
        status: 200,
        description: 'Client successfully updated',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
      }),
      ApiResponse({
        status: 404,
        description: 'Client not found',
      }),
    ),

  Delete: () =>
    applyDecorators(
      ApiTags('Clients'),
      ApiBearerAuth('access-token'),
      ApiOperation({
        summary: 'Delete client',
        description: 'Soft delete a client',
      }),
      ApiResponse({
        status: 204,
        description: 'Client successfully deleted',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
      }),
      ApiResponse({
        status: 404,
        description: 'Client not found',
      }),
    ),
};

export const BusinessServicesApiDoc = {
  Create: () =>
    applyDecorators(
      ApiTags('Business Services'),
      ApiBearerAuth('access-token'),
      ApiOperation({
        summary: 'Create business service',
        description: 'Add a new service',
      }),
      ApiResponse({
        status: 201,
        description: 'Service successfully created',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
      }),
    ),

  Fetch: () =>
    applyDecorators(
      ApiTags('Business Services'),
      ApiBearerAuth('access-token'),
      ApiOperation({
        summary: 'List business services',
        description: 'Retrieve list of services',
      }),
      ApiResponse({
        status: 200,
        description: 'Services retrieved successfully',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
      }),
    ),

  Update: () =>
    applyDecorators(
      ApiTags('Business Services'),
      ApiBearerAuth('access-token'),
      ApiOperation({
        summary: 'Update business service',
        description: 'Update service information',
      }),
      ApiResponse({
        status: 200,
        description: 'Service successfully updated',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
      }),
      ApiResponse({
        status: 404,
        description: 'Service not found',
      }),
    ),

  Delete: () =>
    applyDecorators(
      ApiTags('Business Services'),
      ApiBearerAuth('access-token'),
      ApiOperation({
        summary: 'Delete business service',
        description: 'Soft delete a service',
      }),
      ApiResponse({
        status: 204,
        description: 'Service successfully deleted',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
      }),
      ApiResponse({
        status: 404,
        description: 'Service not found',
      }),
    ),
};

export const AppointmentsApiDoc = {
  Create: () =>
    applyDecorators(
      ApiTags('Appointments'),
      ApiBearerAuth('access-token'),
      ApiOperation({
        summary: 'Create appointment',
        description: 'Schedule a new appointment',
      }),
      ApiResponse({
        status: 201,
        description: 'Appointment successfully created',
      }),
      ApiResponse({
        status: 400,
        description: 'Invalid input data',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
      }),
    ),

  Fetch: () =>
    applyDecorators(
      ApiTags('Appointments'),
      ApiBearerAuth('access-token'),
      ApiOperation({
        summary: 'List appointments',
        description: 'Retrieve list of appointments',
      }),
      ApiResponse({
        status: 200,
        description: 'Appointments retrieved successfully',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
      }),
    ),

  Update: () =>
    applyDecorators(
      ApiTags('Appointments'),
      ApiBearerAuth('access-token'),
      ApiOperation({
        summary: 'Update appointment',
        description: 'Update appointment status or date',
      }),
      ApiResponse({
        status: 200,
        description: 'Appointment successfully updated',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
      }),
      ApiResponse({
        status: 404,
        description: 'Appointment not found',
      }),
    ),

  FetchInvoicing: () =>
    applyDecorators(
      ApiTags('Appointments'),
      ApiBearerAuth('access-token'),
      ApiOperation({
        summary: 'Get invoicing total',
        description: 'Calculate total invoicing',
      }),
      ApiResponse({
        status: 200,
        description: 'Invoicing calculated successfully',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
      }),
    ),

  FetchMetrics: () =>
    applyDecorators(
      ApiTags('Appointments'),
      ApiBearerAuth('access-token'),
      ApiOperation({
        summary: 'Get appointment metrics',
        description: 'Retrieve appointment metrics',
      }),
      ApiResponse({
        status: 200,
        description: 'Metrics retrieved successfully',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
      }),
    ),

  CountByStatus: () =>
    applyDecorators(
      ApiTags('Appointments'),
      ApiBearerAuth('access-token'),
      ApiOperation({
        summary: 'Count appointments by status',
        description: 'Count appointments for specific status',
      }),
      ApiResponse({
        status: 200,
        description: 'Count retrieved successfully',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
      }),
    ),
};

export const WhatsAppApiDoc = {
  CreateSession: () =>
    applyDecorators(
      ApiTags('WhatsApp'),
      ApiBearerAuth('access-token'),
      ApiOperation({
        summary: 'Create WhatsApp session',
        description: 'Initialize new WhatsApp session',
      }),
      ApiResponse({
        status: 201,
        description: 'Session created successfully',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
      }),
    ),

  DisconnectSession: () =>
    applyDecorators(
      ApiTags('WhatsApp'),
      ApiBearerAuth('access-token'),
      ApiOperation({
        summary: 'Disconnect WhatsApp session',
        description: 'Disconnect WhatsApp session',
      }),
      ApiResponse({
        status: 204,
        description: 'Session disconnected successfully',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
      }),
    ),

  SendMessage: () =>
    applyDecorators(
      ApiTags('WhatsApp'),
      ApiBearerAuth('access-token'),
      ApiOperation({
        summary: 'Send WhatsApp message',
        description: 'Send message to WhatsApp contact',
      }),
      ApiResponse({
        status: 200,
        description: 'Message sent successfully',
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
      }),
    ),
};
