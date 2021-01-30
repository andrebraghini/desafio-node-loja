import { injectable, singleton } from 'tsyringe';
import { Product } from '../entity/product';
import { FirebaseService } from './firebase.service';

/**
 * Condições de filtro para consulta de produtos
 */
export interface ProductConditions {

    /** Código de identificação do produto */
    id?: string;

    /** Nome do produto */
    name?: string;

    /** Nome do campo para ordenação */
    order?: string;

    /** Limite de registros no retorno */
    limit?: string;

    /**
     * Código de identificação do documento última documento da página
     * anterior para saltar.
     */
    startAfter?: string;
}

@singleton()
@injectable()
export class ProductService {

    constructor(
        private firebase: FirebaseService
    ) {}

    /**
     * Criar consulta no Firestore considerando condições de filtro, paginação e etc.
     * 
     * @param conditions Condições de filtro para consulta de produtos
     */
    private async createGetQuery(conditions?: ProductConditions) {
        const limit = parseInt(conditions?.limit || '') || 0;
        const col = this.firebase.firestore().collection('products');

        let query = col.limit(limit);

        // Ordenação da consulta
        if (conditions?.order) {
            const direction = conditions.order[0] === '-' ? 'desc' : 'asc';
            const orderField = (direction === 'desc' ? conditions.order.substr(1) : conditions.order).trim().toLocaleLowerCase();
            
            if (['name', 'description', 'category', 'price'].indexOf(orderField) >= 0) {
                query = query.orderBy(orderField, direction);
            }
        }

        // Saltar registros anteriores para paginação
        if (conditions?.startAfter) {
            const snapshot = await this.firebase
                .firestore()
                .doc(`products/${conditions?.startAfter}`)
                .get();
            query = query.startAfter(snapshot);
        }

        return query.get();
    }

    /**
     * Retornar lista de produtos que atendam as condições informadas.
     * Retorna todos os registros se as condições não forem informadas.
     * 
     * @param condition Condições de filtro para consulta de produtos
     */
    async get(conditions?: ProductConditions): Promise<Product[]> {
        const result: Product[] = [];

        const data = await this.createGetQuery(conditions);
        data.forEach(product => {
            const id = product.id;
            const data = product.data();
            result.push({ ...data, id });
        });

        return result;
    }

    /**
     * Inserir novo produto na base de dados
     * 
     * @param data Dados do produto
     * @returns Código de identificação do produto inserido
     */
    async insert(data: Product): Promise<string> {
        const doc = this.firebase
            .firestore()
            .collection('products')
            .doc();

        await doc.set(data);

        return doc.id;
    }

    /**
     * Atualizar dados do produto na base
     * 
     * @param id Código de identificação do produto
     * @param data Dados do produto
     * @param partialUpdate Indicar se o produto receberá alteração parcial
     */
    async update(id: string, data: Product, partialUpdate: boolean = true): Promise<void> {
        const doc = this.firebase
            .firestore()
            .doc(`products/${id}`);

        if (partialUpdate) {
            await doc.update(data);
        } else {
            await doc.set(data);
        }
    }

    /**
     * Remover produto da base de dados
     * 
     * @param id Código de identificação do produto
     */
    async remove(id: string): Promise<void> {
        await this.firebase
            .firestore()
            .doc(`products/${id}`)
            .delete();
    }

}
