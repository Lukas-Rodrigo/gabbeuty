import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Gabbeuty API')
  .setDescription(
    `
# Gabbeuty API Documentation

Professional Beauty & Wellness Management System API

## Features
- 🔐 **Authentication**: Secure JWT-based authentication with refresh tokens
- 👥 **Client Management**: Complete CRUD operations for managing clients
- 💼 **Business Services**: Manage services offered by professionals
- 📅 **Appointments**: Schedule, track, and manage appointments
- 📊 **Metrics & Analytics**: Track appointment metrics and invoicing
- 📱 **WhatsApp Integration**: Connect and manage WhatsApp sessions

## Architecture
- Clean Architecture with Domain-Driven Design (DDD)
- Event-Driven Architecture
- Repository Pattern
- Use Cases Pattern
- Value Objects and Entities

## Authentication
Most endpoints require authentication using JWT Bearer tokens.

### How to authenticate:
1. Register a new user at \`POST /auth/register\`
2. Login at \`POST /auth/login\` to get access and refresh tokens
3. Use the access token in the Authorization header: \`Bearer <token>\`
4. Refresh tokens when expired at \`POST /auth/refresh\`

## Error Handling
All endpoints return standardized error responses:

\`\`\`json
{
  "message": "Error description",
  "error": "ErrorType",
  "statusCode": 400
}
\`\`\`

Common error codes:
- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Missing or invalid authentication
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **409**: Conflict - Resource already exists
- **500**: Internal Server Error

## Pagination
List endpoints support pagination with the following query parameters:
- \`page\`: Page number (default: 1)
- \`perPage\`: Items per page (default: 10, max: 100)

## Date Filtering
Endpoints support date range filtering:
- \`startDate\`: Start date (ISO 8601 format)
- \`endDate\`: End date (ISO 8601 format)

## Rate Limiting
API requests are rate-limited to prevent abuse. If you exceed the limit, you'll receive a 429 status code.

## Support
For issues or questions, contact: support@gabbeuty.com
  `,
  )
  .setVersion('1.0.0')
  .setContact(
    'Gabbeuty Support',
    'https://gabbeuty.com',
    'support@gabbeuty.com',
  )
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT access token',
      in: 'header',
    },
    'access-token',
  )
  .addTag('Auth', 'User authentication and authorization endpoints')
  .addTag('Clients', 'Client management operations')
  .addTag('Business Services', 'Business services management')
  .addTag('Appointments', 'Appointment scheduling and management')
  .addTag('WhatsApp', 'WhatsApp integration and messaging')
  .addServer('http://localhost:3333', 'Development server')
  .addServer('https://api.gabbeuty.com', 'Production server')
  .build();
