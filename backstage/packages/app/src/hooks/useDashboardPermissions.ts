import { useState, useEffect } from 'react';

export interface DashboardPermissions {
  visibility: 'public' | 'team' | 'restricted';
  allowedRoles: string[];
  allowedUsers: string[];
  requiredGroups: string[];
  adminUsers: string[];
}

export interface UserInfo {
  email: string;
  name: string;
  roles: string[];
  groups: string[];
  isAdmin: boolean;
}

interface PermissionResult {
  allowed: boolean;
  reason?: string;
}

// Mock user data - in real implementation, this would come from auth provider
const MOCK_USER: UserInfo = {
  email: 'jaime.henao@ba.com',
  name: 'Jaime Henao',
  roles: ['developer', 'devops', 'admin'],
  groups: ['ba-engineering', 'ba-digital', 'platform-team'],
  isAdmin: true,
};

// Default permissions for each dashboard
const DEFAULT_DASHBOARD_PERMISSIONS: { [key: string]: DashboardPermissions } = {
  'ba-main': {
    visibility: 'public',
    allowedRoles: [],
    allowedUsers: [],
    requiredGroups: [],
    adminUsers: ['jaime.henao@ba.com'],
  },
  'ba-devops': {
    visibility: 'team',
    allowedRoles: ['devops', 'developer', 'platform-engineer'],
    allowedUsers: [],
    requiredGroups: ['ba-engineering'],
    adminUsers: ['jaime.henao@ba.com'],
  },
  'ba-platform': {
    visibility: 'team',
    allowedRoles: ['platform-engineer', 'devops', 'sre'],
    allowedUsers: [],
    requiredGroups: ['ba-engineering', 'platform-team'],
    adminUsers: ['jaime.henao@ba.com'],
  },
  'ba-security': {
    visibility: 'restricted',
    allowedRoles: ['security-engineer', 'ciso', 'security-analyst'],
    allowedUsers: ['security-team@ba.com'],
    requiredGroups: ['security-team'],
    adminUsers: ['jaime.henao@ba.com', 'security-admin@ba.com'],
  },
  'ba-management': {
    visibility: 'restricted',
    allowedRoles: ['executive', 'manager', 'director', 'vp'],
    allowedUsers: ['exec-team@ba.com'],
    requiredGroups: ['leadership-team'],
    adminUsers: ['jaime.henao@ba.com', 'cto@ba.com'],
  },
  'ba-developer': {
    visibility: 'team',
    allowedRoles: ['developer', 'senior-developer', 'tech-lead'],
    allowedUsers: [],
    requiredGroups: ['ba-engineering', 'development-team'],
    adminUsers: ['jaime.henao@ba.com'],
  },
};

export const useDashboardPermissions = () => {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [permissions, setPermissions] = useState<{ [key: string]: DashboardPermissions }>(DEFAULT_DASHBOARD_PERMISSIONS);

  // Initialize user info (in real app, this would come from auth context)
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        // Simulate loading user info from auth provider
        console.log('🔐 Loading user permissions...');
        
        // In real implementation, this would be:
        // const userInfo = await authProvider.getUserInfo();
        const userInfo = MOCK_USER;
        
        setCurrentUser(userInfo);
        console.log('👤 User loaded:', userInfo);
      } catch (error) {
        console.error('Failed to load user info:', error);
        // Set guest user
        setCurrentUser({
          email: 'guest@ba.com',
          name: 'Guest User',
          roles: ['guest'],
          groups: [],
          isAdmin: false,
        });
      }
    };

    loadUserInfo();
  }, []);

  const checkDashboardAccess = (dashboardId: string): PermissionResult => {
    if (!currentUser) {
      return { allowed: false, reason: 'User not authenticated' };
    }

    const dashboardPerms = permissions[dashboardId];
    if (!dashboardPerms) {
      return { allowed: false, reason: 'Dashboard permissions not configured' };
    }

    // Admin users always have access
    if (currentUser.isAdmin || dashboardPerms.adminUsers.includes(currentUser.email)) {
      console.log(`🔓 Admin access granted to ${dashboardId} for ${currentUser.email}`);
      return { allowed: true };
    }

    // Check visibility level
    switch (dashboardPerms.visibility) {
      case 'public':
        return { allowed: true };
        
      case 'team':
        // Check roles
        if (dashboardPerms.allowedRoles.length > 0) {
          const hasRole = currentUser.roles.some(role => dashboardPerms.allowedRoles.includes(role));
          if (!hasRole) {
            return { 
              allowed: false, 
              reason: `Requires one of these roles: ${dashboardPerms.allowedRoles.join(', ')}` 
            };
          }
        }
        
        // Check groups
        if (dashboardPerms.requiredGroups.length > 0) {
          const hasGroup = currentUser.groups.some(group => dashboardPerms.requiredGroups.includes(group));
          if (!hasGroup) {
            return { 
              allowed: false, 
              reason: `Requires membership in: ${dashboardPerms.requiredGroups.join(', ')}` 
            };
          }
        }
        
        return { allowed: true };
        
      case 'restricted':
        // Check specific users
        if (dashboardPerms.allowedUsers.includes(currentUser.email)) {
          return { allowed: true };
        }
        
        // Check roles (must have ALL required roles for restricted access)
        if (dashboardPerms.allowedRoles.length > 0) {
          const hasRole = currentUser.roles.some(role => dashboardPerms.allowedRoles.includes(role));
          if (!hasRole) {
            return { 
              allowed: false, 
              reason: `Restricted access. Contact admin for ${dashboardPerms.allowedRoles.join(', ')} role.` 
            };
          }
        }
        
        // Check required groups
        if (dashboardPerms.requiredGroups.length > 0) {
          const hasAllGroups = dashboardPerms.requiredGroups.every(group => 
            currentUser.groups.includes(group)
          );
          if (!hasAllGroups) {
            return { 
              allowed: false, 
              reason: `Restricted access. Requires: ${dashboardPerms.requiredGroups.join(', ')}` 
            };
          }
        }
        
        return { allowed: true };
        
      default:
        return { allowed: false, reason: 'Invalid permission configuration' };
    }
  };

  const getAccessibleDashboards = (dashboardIds: string[]): string[] => {
    return dashboardIds.filter(id => checkDashboardAccess(id).allowed);
  };

  const getUserAccessSummary = () => {
    if (!currentUser) return null;
    
    const summary = {
      user: currentUser,
      accessLevels: Object.entries(permissions).map(([dashboardId, perms]) => ({
        dashboardId,
        access: checkDashboardAccess(dashboardId),
        permissions: perms,
      })),
    };
    
    return summary;
  };

  const updateDashboardPermissions = (dashboardId: string, newPermissions: DashboardPermissions) => {
    if (!currentUser?.isAdmin) {
      console.warn('Only admin users can update permissions');
      return false;
    }
    
    setPermissions(prev => ({
      ...prev,
      [dashboardId]: newPermissions,
    }));
    
    console.log(`🔐 Updated permissions for ${dashboardId}:`, newPermissions);
    return true;
  };

  // Mock function to simulate role/group changes
  const simulateUserRoleChange = (newRoles: string[], newGroups: string[]) => {
    if (!currentUser) return;
    
    setCurrentUser(prev => prev ? {
      ...prev,
      roles: newRoles,
      groups: newGroups,
    } : null);
    
    console.log('👤 User roles updated:', newRoles);
    console.log('👥 User groups updated:', newGroups);
  };

  return {
    currentUser,
    permissions,
    checkDashboardAccess,
    getAccessibleDashboards,
    getUserAccessSummary,
    updateDashboardPermissions,
    simulateUserRoleChange, // For testing
  };
};