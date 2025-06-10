export const clearTicketsAndNotifications = () => {
  // Clear tickets
  localStorage.removeItem('tickets');
  // Clear notifications
  localStorage.removeItem('notifications');
};

// You can call this function from browser console:
// import { clearTicketsAndNotifications } from './utils/clearData';
// clearTicketsAndNotifications(); 