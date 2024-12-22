const notificationSound = new Audio('/notification.mp3');

export const playNotificationSound = () => {
  notificationSound.play().catch(error => {
    console.log('Error playing notification sound:', error);
  });
};