import * as fbAdmin from 'firebase-admin';
import { singleton } from 'tsyringe';

@singleton()
export class FirebaseService {
    private firebaseAdminInstance: fbAdmin.app.App;
    private firestoreInstance: fbAdmin.firestore.Firestore;

    /** Retorna instância do Firebase Admin App */
    admin(): fbAdmin.app.App {
        if (!this.firebaseAdminInstance) {
            this.firebaseAdminInstance = fbAdmin.initializeApp();
        }
        return this.firebaseAdminInstance;
    }
    
    /** Retorna instância do Firestore */
    firestore(): fbAdmin.firestore.Firestore {
        if (!this.firestoreInstance) {
            this.firestoreInstance = this.admin().firestore();
        }
        return this.firestoreInstance;
    }

}
