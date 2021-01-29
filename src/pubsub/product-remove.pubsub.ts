import { injectable, singleton } from 'tsyringe';
import { PubSubService } from '../services/pubsub.service';

/**
 * Modelo de dados utilizado no tópico product-remove do PubSub
 */
export interface ProductRemoveData {

    /** Código de identificação do produto */
    id: string;
}

@singleton()
@injectable()
export class ProductRemovePubSub {

    static topic = 'product-remove';

    constructor(
        private pubsub: PubSubService
    ) {}
        
    async publish(data: ProductRemoveData) {
        return this.pubsub.publish(ProductRemovePubSub.topic, data);
    }

}
