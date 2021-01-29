/**
 * Dados do produto
 */
export interface Product {

    /** Código de identificação do produto */
    id?: string;

    /** Nome do produto */
    name?: string;

    /** Preço do produto */
    price?: number

    /** URL da imagem do produto se existir */
    imageURL?: string;

}
