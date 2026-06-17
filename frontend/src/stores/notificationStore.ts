import { makeAutoObservable, runInAction } from "mobx";
import * as notificationService from "../services/notificationService";
import { extractErrorMessage } from "../utils/errorUtils";
import type { Notification } from "../types/finance";

class NotificationStore {
  notifications: Notification[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  async fetchNotifications(): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await notificationService.getAll();
      runInAction(() => {
        this.notifications = data;
      });
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async markAsRead(id: number): Promise<boolean> {
    this.error = null;
    try {
      await notificationService.markAsRead(id);
      runInAction(() => {
        const notification = this.notifications.find((n) => n.id === id);
        if (notification) {
          notification.isRead = true;
        }
      });
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    }
  }
}

const notificationStore = new NotificationStore();
export default notificationStore;
