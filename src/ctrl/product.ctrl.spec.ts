import 'reflect-metadata';
import { container } from 'tsyringe';
import { ProductAddPubSub } from '../pubsub/product-add.pubsub';
import { ProductRemovePubSub } from '../pubsub/product-remove.pubsub';
import { ProductUpdatePubSub } from '../pubsub/product-update.pubsub';
import { AuthService } from '../services/auth.service';
import { ProductService } from '../services/product.service';
import { SearchService } from '../services/search.service';
import { ProductCtrl } from './product.ctrl';

describe('ProductCtrl', () => {
    let ctrl: ProductCtrl;
    const authServiceMock = {
        getUserByToken: jest.fn(),
    };
    const productServiceMock = {
        get: jest.fn(),
        insert: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };
    const productAddPubSubMock = {
        topic: 'product-add',
        publish: jest.fn(),
    };
    const productUpdatePubSubMock = {
        topic: 'product-update',
        publish: jest.fn(),
    };
    const productRemovePubSubMock = {
        topic: 'product-remove',
        publish: jest.fn(),
    };
    const searchServiceMock = {
        index: jest.fn(),
        saveObject: jest.fn(),
        deleteObject: jest.fn(),
    };

    const resMock = {
        status: jest.fn(),
        json: jest.fn(),
        send: jest.fn()
    }
    
    beforeEach(() => {
        jest.clearAllMocks();
        searchServiceMock.index.mockReturnThis();
        resMock.status.mockReturnThis();
        resMock.json.mockReturnThis();
        resMock.send.mockReturnThis();

        ctrl = container
            .register<AuthService>(AuthService, { useValue: authServiceMock as any })
            .register<AuthService>(AuthService, { useValue: authServiceMock as any })
            .register<ProductService>(ProductService, { useValue: productServiceMock as any })
            .register<ProductAddPubSub>(ProductAddPubSub, { useValue: productAddPubSubMock as any })
            .register<ProductUpdatePubSub>(ProductUpdatePubSub, { useValue: productUpdatePubSubMock as any })
            .register<ProductRemovePubSub>(ProductRemovePubSub, { useValue: productRemovePubSubMock as any })
            .register<SearchService>(SearchService, { useValue: searchServiceMock as any })
            .resolve(ProductCtrl);
    });

    describe('constructor()', () => {
        it('deve ser construído', () => {
            expect(ctrl).toBeDefined();
        });
    });

    describe('validateRequest()', () => {
        it('deve retornar true sempre que o método for GET', () => {
            // Setup
            const req = {
                method: 'GET'
            };

            // Execute
            return ctrl['validateRequest'](req as any, resMock as any).then(result => {
                // Validate
                expect(result).toBe(true);
                expect(resMock.status).not.toBeCalled();
                expect(resMock.json).not.toBeCalled();
                expect(resMock.send).not.toBeCalled();
            });
        });
        ['POST', 'PUT', 'PATCH', 'DELETE'].forEach(method => {
            it(`deve retornar true se o usuário tiver permissão para uma requisição ${method}`, () => {
                // Setup
                const req = {
                    method,
                    get: jest.fn(),
                };
                req.get.mockReturnValue('fej98j2');
                authServiceMock.getUserByToken
                    .mockResolvedValue({
                        uid: 'dj8798333r',
                        customClaims: {
                            admin: true
                        }
                    });
    
                // Execute
                return ctrl['validateRequest'](req as any, resMock as any).then(result => {
                    // Validate
                    expect(result).toBe(true);
                    expect(req.get).toBeCalledWith('Authorization');
                    expect(resMock.status).not.toBeCalled();
                    expect(resMock.json).not.toBeCalled();
                    expect(resMock.send).not.toBeCalled();
                });
            });
            it(`deve retornar false e responder com erro HTTP 401 se não tiver token usando ${method}`, () => {
                // Setup
                const req = {
                    method,
                    get: jest.fn(),
                };
                req.get.mockReturnValue(undefined);
                authServiceMock.getUserByToken.mockResolvedValue(undefined);
    
                // Execute
                return ctrl['validateRequest'](req as any, resMock as any).then(result => {
                    // Validate
                    expect(result).toBe(false);
                    expect(req.get).toBeCalledWith('Authorization');
                    expect(resMock.status).toBeCalledWith(401);
                    expect(resMock.json).toBeCalledTimes(1);
                    expect(resMock.json.mock.calls[0][0])
                        .toMatchObject({
                            success: false,
                            msg: 'Access denied'
                        });
                });
            });
            it(`deve retornar false e responder com erro HTTP 403 se encontrar usuário sem acesso usando ${method}`, () => {
                // Setup
                const req = {
                    method,
                    get: jest.fn(),
                };
                req.get.mockReturnValue('wefoiouj89j903');
                authServiceMock.getUserByToken.mockResolvedValue({ uid: '20984323' });
    
                // Execute
                return ctrl['validateRequest'](req as any, resMock as any).then(result => {
                    // Validate
                    expect(result).toBe(false);
                    expect(req.get).toBeCalledWith('Authorization');
                    expect(resMock.status).toBeCalledWith(403);
                    expect(resMock.json).toBeCalledTimes(1);
                    expect(resMock.json.mock.calls[0][0])
                        .toMatchObject({
                            success: false,
                            msg: 'Access denied'
                        });
                });
            });
        });
    });
    
    // TODO: Implementar testes do método rest()
    
    describe('post()', () => {
        it('deve fazer publicação PubSub para inserir novo produto', () => {
            // Setup
            const req = {
                body: {
                    name: 'Fanta Uva',
                    description: 'Refri Lata',
                    category: 'bebidas',
                    price: 3.99,
                    imageURL: 'https://trimais.vteximg.com.br/arquivos/ids/1002987-1000-1000/foto_original.jpg'
                }
            };

            // Execute
            return ctrl['post'](req as any, resMock as any).then(() => {
                // Validate
                expect(productAddPubSubMock.publish).toBeCalledTimes(1);
                expect(productAddPubSubMock.publish.mock.calls[0][0])
                    .toMatchObject({
                        name: 'Fanta Uva',
                        description: 'Refri Lata',
                        category: 'bebidas',
                        price: 3.99,
                        imageURL: 'https://trimais.vteximg.com.br/arquivos/ids/1002987-1000-1000/foto_original.jpg'
                    });
                expect(resMock.status).toBeCalledWith(201);
                expect(resMock.send).toBeCalled();
            });
        });
    });

    describe('put()', () => {
        it('deve fazer publicação PubSub para alterar produto', () => {
            // Setup
            const req = {
                path: '/wweqdwdw',
                method: 'PUT',
                body: {
                    name: 'Fanta Uva',
                    description: 'Refri Lata',
                    category: 'bebidas',
                    price: 3.45,
                    imageURL: 'https://trimais.vteximg.com.br/arquivos/ids/1002987-1000-1000/foto_original.jpg'
                }
            };

            // Execute
            return ctrl['put'](req as any, resMock as any).then(() => {
                // Validate
                expect(productUpdatePubSubMock.publish).toBeCalledTimes(1);
                expect(productUpdatePubSubMock.publish.mock.calls[0][0])
                    .toMatchObject({
                        id: 'wweqdwdw',
                        name: 'Fanta Uva',
                        description: 'Refri Lata',
                        category: 'bebidas',
                        price: 3.45,
                        imageURL: 'https://trimais.vteximg.com.br/arquivos/ids/1002987-1000-1000/foto_original.jpg',
                        partialUpdate: false
                    });
                expect(resMock.status).toBeCalledWith(204);
                expect(resMock.send).toBeCalled();
            });
        });
    });

    describe('del()', () => {
        it('deve fazer publicação PubSub para remover produto', () => {
            // Setup
            const req = {
                path: '/j9uf84hj',
            };

            // Execute
            return ctrl['del'](req as any, resMock as any).then(() => {
                // Validate
                expect(productRemovePubSubMock.publish).toBeCalledTimes(1);
                expect(productRemovePubSubMock.publish.mock.calls[0][0].id).toBe('j9uf84hj');
                expect(resMock.status).toBeCalledWith(204);
                expect(resMock.send).toBeCalled();
            });
        });
    });

    describe('get()', () => {
        it('deve chamar serviço para consultar produto específico', () => {
            // Setup
            const products = [{
                id: 'we2ee2',
                name: 'Fanta Uva',
                description: 'Refrigerante',
                category: 'A & B',
                price: 3.5,
                imageURL: 'https://trimais.vteximg.com.br/arquivos/ids/1002987-1000-1000/foto_original.jpg'
            }];
            productServiceMock.get.mockResolvedValue(products);
            const req = {
                path: '/r83787hr'
            };

            // Execute
            return ctrl['get'](req as any, resMock as any).then(() => {
                // Validate
                expect(productServiceMock.get).toBeCalledTimes(1);
                expect(productServiceMock.get.mock.calls[0][0].id).toBe('r83787hr');
                expect(resMock.json).toBeCalledWith(products[0]);
            });
        });
        it('deve retornar erro HTTP 404 se não encontrar o produto informado', () => {
            // Setup
            productServiceMock.get.mockResolvedValue([]);
            const req = {
                path: '/efj98j2'
            };

            // Execute
            return ctrl['get'](req as any, resMock as any).then(() => {
                // Validate
                expect(productServiceMock.get).toBeCalledTimes(1);
                expect(productServiceMock.get.mock.calls[0][0].id).toBe('efj98j2');
                expect(resMock.status).toBeCalledWith(404);
                expect(resMock.json).toBeCalledTimes(1);
                expect(resMock.json.mock.calls[0][0])
                    .toMatchObject({
                        success: false,
                        msg: 'Product not found'
                    });
            });
        });
    });

    describe('list()', () => {
        it('deve chamar serviço para consultar produtos e devolver a lista de produtos', () => {
            // Setup
            const products = [{
                id: 'we2ee2',
                name: 'Fanta Uva',
                description: 'Refrigerante',
                category: 'A & B',
                price: 3.5,
                imageURL: 'https://trimais.vteximg.com.br/arquivos/ids/1002987-1000-1000/foto_original.jpg'
            }];
            productServiceMock.get.mockResolvedValue(products);
            const req = {
                query: {
                    limit: 10
                }
            };

            // Execute
            return ctrl['list'](req as any, resMock as any).then(() => {
                // Validate
                expect(productServiceMock.get).toBeCalledWith(req.query);
                expect(resMock.json).toBeCalledWith(products);
            });
        });
    });

    describe('add()', () => {
        it('deve chamar serviço que faz a inclusão do produto', () => {
            // Setup
            const message = {
                json: {
                    name: 'Fanta Uva',
                    description: 'Refrigerante',
                    category: 'A & B',
                    price: 3.5,
                    imageURL: 'https://trimais.vteximg.com.br/arquivos/ids/1002987-1000-1000/foto_original.jpg',
                }
            };

            // Execute
            return ctrl.add(message as any).then(() => {
                // Validate
                expect(productServiceMock.insert).toBeCalledWith(message.json);
            });
        });
    });

    describe('update()', () => {
        it('deve fazer chamar serviço que faz a alteração do produto', () => {
            // Setup
            const message = {
                json: {
                    id: '112333',
                    name: 'Fanta Uva',
                    description: 'Refrigerante',
                    category: 'A & B',
                    price: 3.5,
                    imageURL: 'https://trimais.vteximg.com.br/arquivos/ids/1002987-1000-1000/foto_original.jpg',
                    partialUpdate: true
                }
            };

            // Execute
            return ctrl.update(message as any).then(() => {
                // Validate
                expect(productServiceMock.update).toBeCalledTimes(1);
                expect(productServiceMock.update.mock.calls[0][0]).toBe('112333');
                expect(productServiceMock.update.mock.calls[0][1])
                    .toMatchObject({
                        name: 'Fanta Uva',
                        description: 'Refrigerante',
                        category: 'A & B',
                        price: 3.5,
                        imageURL: 'https://trimais.vteximg.com.br/arquivos/ids/1002987-1000-1000/foto_original.jpg',
                    });
                expect(productServiceMock.update.mock.calls[0][2]).toBe(true);
            });
        });
    });

    describe('remove()', () => {
        it('deve chamar serviço que faz a remoção do produto', () => {
            // Setup
            const message = {
                json: {
                    id: 'yuv11',
                }
            };

            // Execute
            return ctrl.remove(message as any).then(() => {
                // Validate
                expect(productServiceMock.remove).toBeCalledWith('yuv11');
            });
        });
    });

    describe('updateIndex()', () => {
        it('deve remover índice se o registro for removido', () => {
            // Setup
            const change = {
                after: {
                    exists: false,
                },
                before: {
                    id: '6tewe2',
                }
            };

            // Execute
            return ctrl.updateIndex(change as any).then(() => {
                // Validate
                expect(searchServiceMock.index).toBeCalledWith('products');
                expect(searchServiceMock.deleteObject).toBeCalledWith('6tewe2');
                expect(searchServiceMock.saveObject).not.toBeCalled();
            });
        });
        it('deve atualizar índice se o registro for alterado ou incluído', () => {
            // Setup
            const change = {
                after: {
                    exists: true,
                    id: 'fej892',
                    data: jest.fn(),
                }
            };
            change.after.data.mockReturnValue({
                name: 'Fanta',
                description: 'Refrigerante',
                category: 'bebidas',
                price: 3.5,
                imageURL: 'https://trimais.vteximg.com.br/arquivos/ids/1002987-1000-1000/foto_original.jpg',
            });

            // Execute
            return ctrl.updateIndex(change as any).then(() => {
                // Validate
                expect(searchServiceMock.index).toBeCalledWith('products');
                expect(searchServiceMock.saveObject).toBeCalledTimes(1);
                expect(searchServiceMock.saveObject.mock.calls[0][0])
                    .toMatchObject({
                        objectID: 'fej892',
                        name: 'Fanta',
                        description: 'Refrigerante',
                        category: 'bebidas',
                        price: 3.5,
                        imageURL: 'https://trimais.vteximg.com.br/arquivos/ids/1002987-1000-1000/foto_original.jpg',
                    });
                expect(searchServiceMock.deleteObject).not.toBeCalled();
            });
        });
    });

});
