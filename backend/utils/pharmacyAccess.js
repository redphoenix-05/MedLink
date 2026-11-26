const { Pharmacy } = require('../models');

const getEffectivePharmacyRole = (user) => {
  if (!user || user.role !== 'pharmacy') return null;
  return user.pharmacyRole || 'owner';
};

const isPharmacyOwner = (user) => getEffectivePharmacyRole(user) === 'owner';
const isPharmacyManager = (user) => getEffectivePharmacyRole(user) === 'manager';
const isPharmacyStaff = (user) => getEffectivePharmacyRole(user) === 'staff';

/**
 * Returns all Pharmacy branches accessible to a logged-in pharmacy user:
 * - owner: all branches where userId === user.id
 * - manager / staff: only their assignedPharmacyId branch
 */
const getAccessiblePharmacies = async (user, include = []) => {
  if (!user || user.role !== 'pharmacy') return [];

  if (isPharmacyManager(user) || isPharmacyStaff(user)) {
    if (!user.assignedPharmacyId) return [];
    const branch = await Pharmacy.findByPk(user.assignedPharmacyId, { include });
    return branch ? [branch] : [];
  }

  return Pharmacy.findAll({
    where: { userId: user.id },
    include,
    order: [['city', 'ASC'], ['id', 'ASC']],
  });
};

module.exports = {
  getEffectivePharmacyRole,
  isPharmacyOwner,
  isPharmacyManager,
  isPharmacyStaff,
  getAccessiblePharmacies,
};
