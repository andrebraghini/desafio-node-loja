import 'reflect-metadata';
import { container } from 'tsyringe';
import { PubSubService } from '../services/pubsub.service';
import { ProductRemovePubSub, ProductRemoveData } from './product-remove.pubsub';

describe('ProductRemovePubSub', () => {
    let service: ProductRemovePubSub;
    const pubsubMock = { publish: jest.fn() };
    
    beforeAll(() => {
        container.register<PubSubService>(PubSubService, { useValue: pubsubMock as any });
        service = container.resolve(ProductRemovePubSub);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor()', () => {
        it('deve construir serviço', () => {
            expect(service).toBeDefined();
        });
    });

    describe('topic', () => {
        it('deve conter o valor product-remove', () => {
            expect(ProductRemovePubSub.topic).toBe('product-remove');
        });
    });

    describe('publish()', () => {
        it('fazer publicação no tópico product-remove do PubSub', () => {
            // Setup
            pubsubMock.publish.mockResolvedValue(undefined);
            const data: ProductRemoveData = {
                id: 'e9c18n279e12ve'
            };

            // Execute
            return service.publish(data).then(result => {
                // Validate
                expect(pubsubMock.publish).toBeCalledTimes(1);
                expect(pubsubMock.publish.mock.calls[0][0]).toBe('product-remove');
                expect(pubsubMock.publish.mock.calls[0][1].id).toBe('e9c18n279e12ve');
            });
        });
    });
    
});
