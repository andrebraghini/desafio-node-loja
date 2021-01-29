import 'reflect-metadata';
import { getFirebaseFunctionListToExport } from 'firebase-triggers';
import * as ctrlList from './ctrl';

// Mencionado lista de controles para que a aplicação possa encontrá-los
ctrlList;

// Exportar métodos para o Firebase Functions
const list = getFirebaseFunctionListToExport();
for (const key in list) {
    exports[key] = list[key];
}
