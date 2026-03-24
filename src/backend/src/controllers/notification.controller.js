const notificationService = require('../services/notification.service');

const getMyNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getNotifications(req.user.id, req.query);
    res.json({
      success: true,
      data: result.notifications,
      meta: {
        total: result.total,
        unreadCount: result.unreadCount,
        pages: result.pages
      }
    });
  } catch (error) { next(error); }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id, req.user.id);
    res.json({ success: true, data: notification });
  } catch (error) { next(error); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    res.json({ success: true, meta: result });
  } catch (error) { next(error); }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead
};
