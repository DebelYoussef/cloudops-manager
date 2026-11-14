import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ServerStatus } from '../generated/prisma/client';
import { AlertEvaluationService } from './../alerts/alert-evaluation.service';
import { PrismaService } from '../prisma/prisma.service';
import { MonitoringService } from './monitoring.service';

const clamp = (v: number) => Math.min(100, Math.max(1, v));
const rand = (min: number, max: number) => min + Math.random() * (max - min);

@Injectable()
export class MetricsSimulatorService {
  private readonly logger = new Logger(MetricsSimulatorService.name);
  private state = new Map<string, { cpu: number; ram: number }>();
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly monitoring: MonitoringService,
    private readonly evaluator: AlertEvaluationService,
    private readonly config: ConfigService,
  ) {}

  @Cron('*/15 * * * * *')
  async tick() {
    if (this.config.get('SIMULATOR_ENABLED') === 'false' || this.running) return;
    this.running = true;
    try {
      const servers = await this.prisma.server.findMany({ select: { id: true, status: true } });
      for (const s of servers) {
        if (s.status === ServerStatus.OFFLINE) {
          if (Math.random() < 0.05) await this.setStatus(s.id, ServerStatus.ONLINE); // retour en ligne
          continue;
        }
        if (s.status !== ServerStatus.ONLINE) continue;
        if (Math.random() < 0.005) {
          this.state.delete(s.id);
          await this.setStatus(s.id, ServerStatus.OFFLINE);
          continue;
        }
        const { cpu, ram } = this.next(s.id);
        const metric = await this.monitoring.create({ serverId: s.id, cpuUsage: cpu, ramUsage: ram });
        await this.evaluator.evaluate(metric);
      }
    } catch (e) {
      this.logger.error('Simulation tick failed', e as Error);
    } finally {
      this.running = false;
    }
  }

  // Dérive (marche aléatoire + retour vers la moyenne) et pics occasionnels
  private next(id: string) {
    const prev = this.state.get(id) ?? { cpu: rand(20, 50), ram: rand(40, 65) };
    let cpu = prev.cpu + rand(-5, 5) + (35 - prev.cpu) * 0.1;
    let ram = prev.ram + rand(-2, 2) + (55 - prev.ram) * 0.05;
    if (Math.random() < 0.03) cpu = rand(85, 98);
    if (Math.random() < 0.02) ram = rand(88, 97);
    const value = { cpu: clamp(cpu), ram: clamp(ram) };
    this.state.set(id, value);
    return value;
  }

  private setStatus(id: string, status: ServerStatus) {
    this.logger.warn(`Server ${id} -> ${status}`);
    return this.prisma.server.update({ where: { id }, data: { status } });
  }

  // Purge des métriques de plus de 7 jours
  @Cron(CronExpression.EVERY_HOUR)
  async purge() {
    const cutoff = new Date(Date.now() - 7 * 24 * 3600_000);
    const { count } = await this.prisma.metric.deleteMany({ where: { timestamp: { lt: cutoff } } });
    if (count) this.logger.log(`Purged ${count} old metrics`);
  }
}