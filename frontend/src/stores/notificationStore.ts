import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import * as notificationService from "../services/notificationService";
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

function extractErrorMessage(e: unknown): string {
  if (axios.isAxiosError<{ error?: string }>(e)) {
    return e.response?.data?.error ?? e.message;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return "An unexpected error occurred";
}

const notificationStore = new NotificationStore();
export default notificationStore;
