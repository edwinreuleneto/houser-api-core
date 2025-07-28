// Dependencies
import { Module } from '@nestjs/common';

// Controllers
import { GraphController } from './graph.controller';

// Services
import { GraphService } from './graph.service';

// Modules
import { UserModule } from '../user/user.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [UserModule, FirebaseModule, FilesModule],
  controllers: [GraphController],
  providers: [GraphService],
  exports: [GraphService],
})
export class GraphModule {}
