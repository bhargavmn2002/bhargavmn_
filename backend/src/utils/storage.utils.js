const prisma = require('../config/db');

/**
 * Get the client admin ID for a given user
 * @param {string} userId - The user ID
 * @returns {Promise<string|null>} - The client admin ID or null
 */
async function getClientAdminId(userId) {
  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        managedByClientAdmin: true,
        createdByUserAdmin: {
          select: {
            id: true,
            managedByClientAdminId: true
          }
        }
      }
    });

    if (!user) {
      console.warn('User not found for ID:', userId);
      return null;
    }

    // If user is a CLIENT_ADMIN, return their own ID
    if (user.role === 'CLIENT_ADMIN') {
      return user.id;
    }

    // If user is managed by a client admin (USER_ADMIN case), return the client admin's ID
    if (user.managedByClientAdminId) {
      return user.managedByClientAdminId;
    }

    // If user is STAFF, traverse through their User Admin to find the Client Admin
    if (user.role === 'STAFF') {
      if (user.createdByUserAdminId && user.createdByUserAdmin) {
        // Use the included data if available
        if (user.createdByUserAdmin.managedByClientAdminId) {
          return user.createdByUserAdmin.managedByClientAdminId;
        }
      } else if (user.createdByUserAdminId) {
        // Fallback: fetch the User Admin separately if include didn't work
        const userAdmin = await prisma.user.findUnique({
          where: { id: user.createdByUserAdminId },
          select: { managedByClientAdminId: true }
        });
        if (userAdmin?.managedByClientAdminId) {
          return userAdmin.managedByClientAdminId;
        }
      } else {
        console.warn('STAFF user has no createdByUserAdminId:', userId);
      }
    }

    // USER_ADMIN fallback: if managedByClientAdminId is missing, find client admin who has this user in userAdmins
    if (user.role === 'USER_ADMIN') {
      const clientAdmin = await prisma.user.findFirst({
        where: {
          role: 'CLIENT_ADMIN',
          userAdmins: { some: { id: userId } }
        },
        select: { id: true }
      });
      if (clientAdmin) return clientAdmin.id;
    }

    console.warn('Unable to determine client admin ID for user:', {
      userId,
      role: user.role,
      staffRole: user.staffRole,
      managedByClientAdminId: user.managedByClientAdminId,
      createdByUserAdminId: user.createdByUserAdminId
    });
    return null;
  } catch (error) {
    console.error('Error in getClientAdminId:', error);
    return null;
  }
}

/**
 * Calculate total media storage used by a client (in bytes)
 * @param {string} clientAdminId - The client admin ID
 * @returns {Promise<number>} - Total storage used in bytes
 */
async function calculateClientStorageUsage(clientAdminId) {
  if (!clientAdminId) return 0;

  // Get all USER_ADMINs under this client admin
  const userAdmins = await prisma.user.findMany({
    where: {
      role: 'USER_ADMIN',
      managedByClientAdminId: clientAdminId
    },
    select: { id: true }
  });

  const userAdminIds = userAdmins.map(ua => ua.id);

  // Get all STAFF users created by these USER_ADMINs
  const staffUsers = await prisma.user.findMany({
    where: {
      role: 'STAFF',
      createdByUserAdminId: {
        in: userAdminIds
      }
    },
    select: { id: true }
  });

  // Combine all user IDs: client admin + user admins + staff users
  const userIds = [
    clientAdminId,
    ...userAdminIds,
    ...staffUsers.map(s => s.id)
  ];

  if (userIds.length === 0) return 0;

  // Calculate total file size for all media created by these users
  const result = await prisma.media.aggregate({
    where: {
      createdById: {
        in: userIds
      }
    },
    _sum: {
      fileSize: true
    }
  });

  return result._sum.fileSize || 0;
}

/**
 * Get client storage limits and usage
 * @param {string} clientAdminId - The client admin ID
 * @returns {Promise<{limitMB: number, usedBytes: number, usedMB: number, availableBytes: number, availableMB: number}>}
 */
async function getClientStorageInfo(clientAdminId) {
  if (!clientAdminId) {
    return {
      limitMB: 0,
      usedBytes: 0,
      usedMB: 0,
      availableBytes: 0,
      availableMB: 0
    };
  }

  // Get client profile to find storage limit
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { clientAdminId },
    select: { maxStorageMB: true }
  });

  const limitMB = clientProfile?.maxStorageMB || 25;
  const limitBytes = limitMB * 1024 * 1024;

  const usedBytes = await calculateClientStorageUsage(clientAdminId);
  const usedMB = Math.round((usedBytes / (1024 * 1024)) * 100) / 100; // Round to 2 decimal places

  const availableBytes = Math.max(0, limitBytes - usedBytes);
  const availableMB = Math.round((availableBytes / (1024 * 1024)) * 100) / 100;

  return {
    limitMB,
    usedBytes,
    usedMB,
    availableBytes,
    availableMB
  };
}

/**
 * Check if a client can upload a file of given size
 * @param {string} userId - The user ID attempting to upload
 * @param {number} fileSizeBytes - The size of the file to upload in bytes
 * @returns {Promise<{canUpload: boolean, reason?: string, storageInfo: object}>}
 */
async function checkStorageLimit(userId, fileSizeBytes) {
  const clientAdminId = await getClientAdminId(userId);
  
  if (!clientAdminId) {
    return {
      canUpload: false,
      reason: 'Unable to determine client association',
      storageInfo: null
    };
  }

  const storageInfo = await getClientStorageInfo(clientAdminId);

  if (fileSizeBytes > storageInfo.availableBytes) {
    const fileSizeMB = Math.round((fileSizeBytes / (1024 * 1024)) * 100) / 100;
    return {
      canUpload: false,
      reason: `File size (${fileSizeMB}MB) exceeds available storage (${storageInfo.availableMB}MB). Total limit: ${storageInfo.limitMB}MB, currently used: ${storageInfo.usedMB}MB.`,
      storageInfo
    };
  }

  return {
    canUpload: true,
    storageInfo
  };
}

module.exports = {
  getClientAdminId,
  calculateClientStorageUsage,
  getClientStorageInfo,
  checkStorageLimit
};