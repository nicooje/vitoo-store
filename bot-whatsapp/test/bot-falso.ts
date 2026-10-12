// Bot de mentira para probar el agente sin conectarse a WhatsApp
import fs from 'fs';
const i = process.argv.indexOf('--informe-json');
const sim = process.argv.includes('--simular');
const esperar = (ms: number) => new Promise(r => setTimeout(r, ms));
console.log('@@ESTADO Conectando a WhatsApp...'); await esperar(1500);
console.log('@@CODIGO ABCD-EFGH'); await esperar(3000);
console.log('@@CODIGO '); console.log('@@ESTADO Recibiendo mensajes...'); await esperar(1500);
console.log('@@ESTADO Subiendo fotos de "Conjunto de prueba" (2)...'); await esperar(1500);
fs.writeFileSync(process.argv[i + 1], JSON.stringify({ fecha: new Date().toISOString(), simular: sim, mensajes: 7,
  nuevos: [{ nombre: 'Conjunto de prueba', precio: 7000, fotos: 2, categoria: 'Conjuntos' }],
  actualizados: [{ fila: 12, nombre: 'Colaless de morley', precio: 3000 }], revisar: [], sinFoto: [] }));
