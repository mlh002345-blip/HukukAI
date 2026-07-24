import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { ExpoPushService } from "./expo-push.service";
import { NotificationsDeliveryProcessor } from "./notifications-delivery.processor";
import { NotificationsSchedulerService } from "./notifications-scheduler.service";
import { NOTIFICATIONS_QUEUE } from "./notification-queue.token";

@Module({
  imports: [BullModule.registerQueue({ name: NOTIFICATIONS_QUEUE })],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    ExpoPushService,
    NotificationsDeliveryProcessor,
    NotificationsSchedulerService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
