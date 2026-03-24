const adminService = require('../services/admin.service');
const notificationService = require('../services/notification.service');
const emailService = require('../services/email.service');

// DASHBOARD
const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
};

// INCIDENTS
const getAdminIncidents = async (req, res, next) => {
  try {
    const result = await adminService.getAdminIncidents(req.query);
    res.json({ success: true, data: result.incidents, meta: { total: result.total, pages: result.pages } });
  } catch (error) { next(error); }
};

const assignIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { entityId } = req.body;
    const adminId = req.user.id;

    const result = await adminService.assignIncidentToEntity(id, entityId, adminId);
    
    // Notifications
    await notificationService.createNotification({
      type: 'assignment',
      title: 'Incidencia Asignada',
      message: `La incidencia "${result.incident.title}" ha sido asignada a su entidad: ${result.entity.name}`,
      referenceType: 'incident',
      referenceId: id
    }); // TODO: We need to know who receives this notification. Usually entity users. Will add in incident.service integration.

    // Email
    await emailService.sendAssignmentEmail(result.entity.email, result.incident.title, id);

    res.json({ success: true, data: result.incident });
  } catch (error) { next(error); }
};

const updateIncidentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const adminId = req.user.id;

    const incident = await adminService.updateIncidentStatusAdmin(id, status, adminId, note);
    res.json({ success: true, data: incident });
  } catch (error) { next(error); }
};

// USERS
const getUsers = async (req, res, next) => {
  try {
    const result = await adminService.getUsers(req.query);
    res.json({ success: true, data: result.users, meta: { total: result.total, pages: result.pages } });
  } catch (error) { next(error); }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await adminService.updateUserRole(id, role);
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

const toggleUserActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await adminService.toggleUserActive(id);
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

// ENTITIES
const getEntities = async (req, res, next) => {
  try {
    const entities = await adminService.getEntities();
    res.json({ success: true, data: entities });
  } catch (error) { next(error); }
};

const createEntity = async (req, res, next) => {
  try {
    const entity = await adminService.createEntity(req.body);
    res.status(201).json({ success: true, data: entity });
  } catch (error) { next(error); }
};

const updateEntity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const entity = await adminService.updateEntity(id, req.body);
    res.json({ success: true, data: entity });
  } catch (error) { next(error); }
};

const deleteEntity = async (req, res, next) => {
  try {
    const { id } = req.params;
    await adminService.deleteEntity(id);
    res.json({ success: true, message: 'Entity deactivated' });
  } catch (error) { next(error); }
};

module.exports = {
  getDashboardStats,
  getAdminIncidents,
  assignIncident,
  updateIncidentStatus,
  getUsers,
  updateUserRole,
  toggleUserActive,
  getEntities,
  createEntity,
  updateEntity,
  deleteEntity
};
