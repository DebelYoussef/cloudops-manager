import { PartialType } from '@nestjs/swagger';
import { CreateApplicationDto } from './create-application.dto.js';

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {}
