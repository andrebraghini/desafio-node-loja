import { injectable, singleton } from 'tsyringe';
import { PubSubService } from '../services/pubsub.service';

/**
 * Modelo de dados utilizado no tópico product-add do PubSub
 */
export interface ProductAddData {

    /** Nome do produto */
    name: string;

    /** Descrição do produto */
    description?: string;
    
    /** Categoria do produto */
    category?: string;

    /** Preço do produto */
    price?: number

    /** URL da imagem do produto se existir */
    imageURL?: string;
}

@singleton()
@injectable()
export class ProductAddPubSub {

    static topic = 'product-add';

    constructor(
        private pubsub: PubSubService
    ) {}
        
    async publish(data: ProductAddData) {
        return this.pubsub.publish(ProductAddPubSub.topic, data);
    }

}
