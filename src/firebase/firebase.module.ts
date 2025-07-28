import { Global, Module } from '@nestjs/common';

//Services
import { FirebaseService } from './firebase.service';

// Guards
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';

@Global()
@Module({
  providers: [FirebaseService, FirebaseAuthGuard],
  exports: [FirebaseService, FirebaseAuthGuard],
})
export class FirebaseModule {}
