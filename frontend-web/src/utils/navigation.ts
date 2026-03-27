export const getRoleDashboard = (role: string): string => {
  switch (role) {
    case 'Admin':
      return '/admin/dashboard'
    case 'Manager':
      return '/manager/dashboard'
    case 'Trainer':
      return '/trainer/home'
    case 'User':
      return '/dashboard'
    default:
      return '/login'
  }
}