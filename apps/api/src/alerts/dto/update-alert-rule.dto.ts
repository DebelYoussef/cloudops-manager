import { PartialType } from '@nestjs/swagger';
import { CreateAlertRuleDto } from './create-alert-rule.dto';

export class UpdateAlertRuleDto extends PartialType(CreateAlertRuleDto) {}
