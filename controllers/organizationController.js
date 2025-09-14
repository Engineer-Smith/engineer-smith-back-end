// /controllers/organizationController.js - FIXED
const Organization = require('../models/Organization');
const createError = require('http-errors');

// Create a new organization (EngineerSmith super org admins only)
const createOrganization = async (req, res, next) => {
  try {
    const { name, inviteCode } = req.body;
    if (!name || !inviteCode) {
      throw createError(400, 'Name and invite code are required');
    }
    const existingOrg = await Organization.findOne({ inviteCode });
    if (existingOrg) {
      throw createError(409, 'Invite code already exists');
    }
    const organization = new Organization({
      name,
      inviteCode,
      isSuperOrg: false,
    });
    await organization.save();
    res.status(201).json({
      _id: organization._id,
      name: organization.name,
      inviteCode: organization.inviteCode,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt, // Add missing updatedAt
    });
  } catch (error) {
    next(error);
  }
};

// Get organization details (super org admins or org admins/instructors)
const getOrganization = async (req, res, next) => {
  try {
    const { id } = req.params; // ✅ Extract 'id' from route parameter
    const user = req.user; // From JWT middleware

    // Validate access: super org admin or user in requested org
    // ✅ FIXED: Use 'id' instead of '_id'
    if (!user.organizationId || (user.organizationId.toString() !== id && !user.isSuperOrgAdmin)) {
      throw createError(403, 'Unauthorized to access this organization');
    }

    // ✅ FIXED: Use 'id' instead of '_id'
    const organization = await Organization.findById(id);
    if (!organization) {
      throw createError(404, 'Organization not found');
    }

    res.json({
      _id: organization._id,
      name: organization.name,
      inviteCode: organization.inviteCode,
      isSuperOrg: organization.isSuperOrg,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

// List all organizations (super org admins only)
const getAllOrganizations = async (req, res, next) => {
  try {
    // Assumes validateSuperOrgAdmin middleware
    const { limit = 10, skip = 0 } = req.query;

    const organizations = await Organization.find()
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .select('name inviteCode createdAt');

    res.json(organizations);
  } catch (error) {
    next(error);
  }
};

// Update organization details (super org admins or org admins)
const updateOrganization = async (req, res, next) => {
  try {
    const { id } = req.params; // ✅ FIXED: Extract 'id' from route parameter
    const { name, inviteCode } = req.body;
    const user = req.user; // From JWT middleware

    // Validate access: super org admin or org admin
    // ✅ FIXED: Use 'id' instead of '_id'
    if (!user.organizationId || (user.organizationId.toString() !== id && !user.isSuperOrgAdmin)) {
      throw createError(403, 'Unauthorized to update this organization');
    }

    // Validate input
    if (!name && !inviteCode) {
      throw createError(400, 'At least one field (name or inviteCode) is required');
    }

    // Check inviteCode uniqueness if provided
    if (inviteCode) {
      // ✅ FIXED: Use 'id' instead of '_id'
      const existingOrg = await Organization.findOne({ inviteCode, _id: { $ne: id } });
      if (existingOrg) {
        throw createError(409, 'Invite code already exists');
      }
    }

    const updateData = { updatedAt: Date.now() };
    if (name) updateData.name = name;
    if (inviteCode) updateData.inviteCode = inviteCode;

    // ✅ FIXED: Use 'id' instead of '_id'
    const organization = await Organization.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!organization) {
      throw createError(404, 'Organization not found');
    }

    res.json({
      _id: organization._id,
      name: organization.name,
      inviteCode: organization.inviteCode,
      updatedAt: organization.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

// Delete an organization (super org admins only)
const deleteOrganization = async (req, res, next) => {
  try {
    // Assumes validateSuperOrgAdmin middleware
    const { id } = req.params; // ✅ FIXED: Extract 'id' from route parameter

    // Prevent deleting super org or Public Org
    // ✅ FIXED: Use 'id' instead of '_id'
    const organization = await Organization.findById(id);
    if (!organization) {
      throw createError(404, 'Organization not found');
    }
    if (organization.isSuperOrg || organization.name === 'Public Org') {
      throw createError(403, 'Cannot delete super org or Public Org');
    }

    // ✅ FIXED: Use 'id' instead of '_id'
    await Organization.deleteOne({ _id: id });
    // Note: Cascade deletion of Users, Questions, Tests, etc., to be implemented later

    res.json({ message: 'Organization deleted' });
  } catch (error) {
    next(error);
  }
};

// Validate invite code for registration
const validateInviteCode = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      throw createError(400, 'Invite code is required');
    }

    const organization = await Organization.findOne({ inviteCode });
    if (!organization) {
      throw createError(404, 'Invalid invite code');
    }

    res.json({
      _id: organization._id,
      name: organization.name,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrganization,
  getOrganization,
  getAllOrganizations,
  updateOrganization,
  deleteOrganization,
  validateInviteCode,
};