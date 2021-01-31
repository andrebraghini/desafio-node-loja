import { Change } from 'firebase-functions';
import { QueryDocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
import { onFirestoreWrite } from 'firebase-triggers';
import { injectable, singleton } from 'tsyringe';
import { FirebaseService } from '../services/firebase.service';

@singleton()
@injectable()
export class UserCtrl {

    constructor(
        private firebase: FirebaseService
    ) {}

    /**
     * Alterar custom claims do usuários ao editar registro na base.
     * 
     * @param change Dados do registro antes e depois da alteração
     */
    @onFirestoreWrite('users/{uid}')
    async setRole(change: Change<QueryDocumentSnapshot>) {
        if (!change.after.exists) {
            return;
        }

        const data = change.after.data();
        return this.firebase
            .admin()
            .auth()
            .setCustomUserClaims(change.after.id, { admin: data.role === 'admin' })
    }

}
