/**
 * Tests unitarios — Incident Service
 * EcoAlerta — Sprint 2
 */

// Mock de dependencias
jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  getClient: jest.fn(),
}));

jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

const { query } = require('../../src/config/database');
const incidentService = require('../../src/services/incident.service');

describe('Incident Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── createIncident ───────────────────────────────────────────────────────

  describe('createIncident', () => {
    it('debería crear una incidencia con datos válidos', async () => {
      const mockIncident = {
        id: 'incident-uuid-1',
        title: 'Vertido ilegal en Barranco',
        description: 'Descripción detallada del vertido',
        category_id: 1,
        reporter_id: 'user-uuid-1',
        severity: 'high',
        status: 'pending',
        longitude: -0.4615,
        latitude: 38.3580,
        priority_score: 30,
        created_at: new Date(),
      };

      query.mockResolvedValueOnce({ rows: [mockIncident] });

      const result = await incidentService.createIncident({
        title: 'Vertido ilegal en Barranco',
        description: 'Descripción detallada del vertido',
        categoryId: 1,
        severity: 'high',
        latitude: 38.3580,
        longitude: -0.4615,
        isAnonymous: false,
        reporterId: 'user-uuid-1',
      });

      expect(result.id).toBe('incident-uuid-1');
      expect(result.title).toBe('Vertido ilegal en Barranco');
      expect(result.severity).toBe('high');

      // Verificar que usa ST_SetSRID(ST_MakePoint...)
      const sql = query.mock.calls[0][0];
      expect(sql).toContain('ST_SetSRID');
      expect(sql).toContain('ST_MakePoint');
    });
  });

  // ─── getIncidents ─────────────────────────────────────────────────────────

  describe('getIncidents', () => {
    it('debería listar incidencias con paginación', async () => {
      // Mock: count
      query.mockResolvedValueOnce({ rows: [{ total: '25' }] });
      // Mock: data
      query.mockResolvedValueOnce({
        rows: Array.from({ length: 10 }, (_, i) => ({
          id: `inc-${i}`,
          title: `Incidencia ${i}`,
          status: 'pending',
        })),
      });

      const result = await incidentService.getIncidents({ page: 1, limit: 10 });

      expect(result.total).toBe(25);
      expect(result.pages).toBe(3);
      expect(result.incidents).toHaveLength(10);
    });

    it('debería filtrar por categoría', async () => {
      query.mockResolvedValueOnce({ rows: [{ total: '5' }] });
      query.mockResolvedValueOnce({ rows: [{ id: 'inc-1', category_id: 1 }] });

      const result = await incidentService.getIncidents({ categoryId: 1, page: 1, limit: 20 });

      expect(result.total).toBe(5);
      // Verificar que el filtro está en la query
      const countSql = query.mock.calls[0][0];
      expect(countSql).toContain('category_id');
    });

    it('debería filtrar por severidad', async () => {
      query.mockResolvedValueOnce({ rows: [{ total: '3' }] });
      query.mockResolvedValueOnce({ rows: [] });

      await incidentService.getIncidents({ severity: 'critical', page: 1, limit: 20 });

      const countSql = query.mock.calls[0][0];
      expect(countSql).toContain('severity');
    });
  });

  // ─── getNearbyIncidents ───────────────────────────────────────────────────

  describe('getNearbyIncidents', () => {
    it('debería buscar incidencias en un radio dado', async () => {
      query.mockResolvedValueOnce({
        rows: [
          { id: 'inc-1', distance_meters: 150 },
          { id: 'inc-2', distance_meters: 980 },
        ],
      });

      const result = await incidentService.getNearbyIncidents(38.3580, -0.4615, 5);

      expect(result).toHaveLength(2);
      // Verificar uso de ST_DWithin
      const sql = query.mock.calls[0][0];
      expect(sql).toContain('ST_DWithin');
      // Verificar que el radio se convierte a metros (5km = 5000m)
      const params = query.mock.calls[0][1];
      expect(params[2]).toBe(5000);
    });
  });

  // ─── voteIncident ─────────────────────────────────────────────────────────

  describe('voteIncident', () => {
    it('debería votar una incidencia e incrementar conteo', async () => {
      // Mock: INSERT voto
      query.mockResolvedValueOnce({ rows: [] });
      // Mock: UPDATE priority
      query.mockResolvedValueOnce({ rows: [{ severity: 'high', vote_count: '1' }] });
      query.mockResolvedValueOnce({ rows: [] }); // UPDATE priority_score
      // Mock: COUNT votos
      query.mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const result = await incidentService.voteIncident('incident-uuid-1', 'user-uuid-1');

      expect(result.voteCount).toBe(1);
    });

    it('debería fallar al votar dos veces (PK duplicada)', async () => {
      // Mock: unique_violation
      const dbError = new Error('duplicate key');
      dbError.code = '23505';
      query.mockRejectedValueOnce(dbError);

      await expect(
        incidentService.voteIncident('incident-uuid-1', 'user-uuid-1')
      ).rejects.toThrow('Ya has votado esta incidencia');
    });
  });

  // ─── updateIncidentStatus ─────────────────────────────────────────────────

  describe('updateIncidentStatus', () => {
    it('debería cambiar estado y generar registro en historial', async () => {
      // Mock: SELECT existing
      query.mockResolvedValueOnce({ rows: [{ id: 'inc-1', status: 'pending' }] });
      // Mock: UPDATE estado
      query.mockResolvedValueOnce({
        rows: [{ id: 'inc-1', status: 'validated', longitude: -0.46, latitude: 38.35 }],
      });
      // Mock: INSERT historial
      query.mockResolvedValueOnce({ rows: [] });

      const result = await incidentService.updateIncidentStatus(
        'inc-1', 'validated', 'admin-uuid', 'Incidencia verificada'
      );

      expect(result.status).toBe('validated');
      // Verificar INSERT en incident_status_history
      const insertSql = query.mock.calls[2][0];
      expect(insertSql).toContain('incident_status_history');
      const insertParams = query.mock.calls[2][1];
      expect(insertParams).toContain('pending');    // old_status
      expect(insertParams).toContain('validated');   // new_status
    });
  });

  // ─── updateIncident (permisos) ────────────────────────────────────────────

  describe('updateIncident', () => {
    it('debería permitir al autor editar si status es pending', async () => {
      query.mockResolvedValueOnce({
        rows: [{ reporter_id: 'user-1', status: 'pending' }],
      });
      query.mockResolvedValueOnce({
        rows: [{ id: 'inc-1', title: 'Nuevo título', longitude: -0.46, latitude: 38.35 }],
      });

      const result = await incidentService.updateIncident(
        'inc-1',
        { title: 'Nuevo título' },
        { id: 'user-1', role: 'citizen' }
      );

      expect(result.title).toBe('Nuevo título');
    });

    it('debería rechazar edición de otro usuario', async () => {
      query.mockResolvedValueOnce({
        rows: [{ reporter_id: 'user-1', status: 'pending' }],
      });

      await expect(
        incidentService.updateIncident(
          'inc-1',
          { title: 'Intento' },
          { id: 'user-2', role: 'citizen' }
        )
      ).rejects.toThrow('No tienes permiso para editar esta incidencia');
    });
  });
});
