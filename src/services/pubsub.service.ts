import { ClientConfig, PubSub } from '@google-cloud/pubsub';
import { singleton, injectable } from 'tsyringe';

@singleton()
@injectable()
export class PubSubService {

    /** Configurações do PubSub */
    options: ClientConfig;
    private pubsubInstance: PubSub;

    /**
     * Retornar instância singleton do PubSub instanciando se não existir
     */
    private pubsub(): PubSub {
        if (!this.pubsubInstance) {
            this.pubsubInstance = new PubSub(this.options)
        }
        return this.pubsubInstance;
    }

    /**
     * Fazer publicação via PubSub no tópico especificado
     * 
     * @param topic Nome do tópico
     * @param data Dados que serão publicados
     * @param attributes Atributos personalizados
     */
    async publish(topic: string, data?: any, attributes?: any) {
        const content = !data ? '{}' : ((typeof data === 'string') ? data : JSON.stringify(data));
        const dataBuffer = Buffer.from(content);
        const pubsubTopic = this.pubsub().topic(topic);

        return pubsubTopic.publish(dataBuffer, attributes);
    }

}
