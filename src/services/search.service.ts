import { injectable, singleton } from 'tsyringe';
import { FirebaseService } from './firebase.service';
import { SearchClient, SearchIndex } from 'algoliasearch';
import * as algoliasearch from 'algoliasearch';

@singleton()
@injectable()
export class SearchService {

    indexes: {[key: string]: SearchIndex} = {};
    private clientInstance: SearchClient;

    constructor(
        private firebase: FirebaseService
    ) {}

    /** Retornar instância única do client do algolia */
    client() {
        if (!this.clientInstance) {
            const APP_ID = this.firebase.config().algolia.app;
            const ADMIN_KEY = this.firebase.config().algolia.key;
            this.clientInstance = algoliasearch.default(APP_ID, ADMIN_KEY);
        }
        return this.clientInstance;
    }

    /**
     * Retorna objeto de índice do algolia (único para cada índice).
     * 
     * @param indexName Nome de identificação do índice
     */
    index(indexName: string): SearchIndex {
        if (!this.indexes[indexName]) {
            this.indexes[indexName] = this.client().initIndex(indexName);
        }
        return this.indexes[indexName];
    }
    
}
