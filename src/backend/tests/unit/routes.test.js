jest.mock('node:crypto', () => require('crypto'), { virtual: true });
jest.mock('../../src/middlewares/validation.middleware', () => ({ validateRequest: jest.fn((req,res,next) => next()) }), { virtual: true });
const express = require('express');

jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

describe('Routes Loading', () => {
  it('debería cargar auth.routes sin errores', () => {
    const authRoutes = require('../../src/routes/auth.routes');
    expect(authRoutes).toBeDefined();
  });

  it('debería cargar admin.routes sin errores', () => {
    const adminRoutes = require('../../src/routes/admin.routes');
    expect(adminRoutes).toBeDefined();
  });

  it('debería cargar incident.routes sin errores', () => {
    const incidentRoutes = require('../../src/routes/incident.routes');
    expect(incidentRoutes).toBeDefined();
  });

  it('debería cargar notification.routes sin errores', () => {
    const notificationRoutes = require('../../src/routes/notification.routes');
    expect(notificationRoutes).toBeDefined();
  });

  it('debería cargar health.routes sin errores', () => {
    const healthRoutes = require('../../src/routes/health.routes');
    expect(healthRoutes).toBeDefined();
  });
  
  it('debería cargar user.routes sin errores', () => {
    const userRoutes = require('../../src/routes/user.routes');
    expect(userRoutes).toBeDefined();
  });
});
