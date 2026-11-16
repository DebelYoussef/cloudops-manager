import { Injectable } from '@nestjs/common';
import { Incident } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createForIncident(incident: Incident) {
    const users = await this.prisma.user.findMany({
      where: { isActive: true, role: { in: ['ADMIN', 'DEVOPS'] } },
      select: { id: true },
    });
    if (!users.length) return;
    await this.prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        incidentId: incident.id,
        title: `Incident ${incident.severity}`,
        message: incident.message,
      })),
    });
  }
}
