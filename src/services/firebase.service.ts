import * as fbAdmin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { singleton } from 'tsyringe';

@singleton()
export class FirebaseService {
    private firebaseAdminInstance: fbAdmin.app.App;
    private firestoreInstance: fbAdmin.firestore.Firestore;

    /** Retornar instância do Firebase Admin App */
    admin(): fbAdmin.app.App {
        if (!this.firebaseAdminInstance) {
            this.firebaseAdminInstance = fbAdmin.initializeApp();
        }
        return this.firebaseAdminInstance;
    }
    
    /** Retornar instância do Firestore */
    firestore(): fbAdmin.firestore.Firestore {
        if (!this.firestoreInstance) {
            this.firestoreInstance = this.admin().firestore();
        }
        return this.firestoreInstance;
    }

    /** Retornar configurações de ambiente do Firebase Config */
    config() {
        return functions.config();
    }

}
