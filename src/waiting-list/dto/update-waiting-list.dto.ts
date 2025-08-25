// Dependencies
import { PartialType } from '@nestjs/swagger';

// DTOs
import { CreateWaitingListDto } from './create-waiting-list.dto';

export class UpdateWaitingListDto extends PartialType(CreateWaitingListDto) {}
