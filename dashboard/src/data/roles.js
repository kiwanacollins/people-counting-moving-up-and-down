export const ROLE_PERMISSIONS = {
  Administrator: {
    routes: ['/overview', '/zones', '/reports', '/alerts'],
    canAddZone: true,
    canExportReports: true,
    canResolveAlerts: true,
  },
  'Security Staff': {
    routes: ['/overview', '/zones', '/alerts'],
    canAddZone: false,
    canExportReports: false,
    canResolveAlerts: true,
  },
  Viewer: {
    routes: ['/overview', '/zones', '/reports'],
    canAddZone: false,
    canExportReports: false,
    canResolveAlerts: false,
  },
}

export function getPermissions(role) {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.Viewer
}
