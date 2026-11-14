import { PartialType } from '@nestjs/swagger';
import { CreateServerDto } from './create-server.dto.js';

export class UpdateServerDto extends PartialType(CreateServerDto) {}
