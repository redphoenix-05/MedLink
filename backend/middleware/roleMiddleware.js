// Role-based access control middleware
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated (this should be checked by auth middleware first)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Check if user has the required role
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error in role verification',
      });
    }
  };
};

module.exports = roleMiddleware;