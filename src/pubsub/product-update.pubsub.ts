import { injectable, singleton } from 'tsyringe';
import { PubSubService } from '../services/pubsub.service';

/**
 * Modelo de dados utilizado no tópico product-update do PubSub
 */
export interface ProductUpdateData {

    /** Código de identificação do produto */
    id: string;

    /** Nome do produto */
    name?: string;
    
    /** Descrição do produto */
    description?: string;
    
    /** Categoria do produto */
    category?: string;

    /** Preço do produto */
    price?: number

    /** URL da imagem do produto se existir */
    imageURL?: string;

    /** Indicar se o produto receberá alteração parcial */
    partialUpdate?: boolean;
}

@singleton()
@injectable()
export class ProductUpdatePubSub {

    static topic = 'product-update';

    constructor(
        private pubsub: PubSubService
    ) {}
        
    async publish(data: ProductUpdateData) {
        return this.pubsub.publish(ProductUpdatePubSub.topic, data);
    }

}
