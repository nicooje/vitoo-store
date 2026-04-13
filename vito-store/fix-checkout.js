const fs = require('fs');
let content = fs.readFileSync('src/app/checkout/page.tsx', 'utf8');

// 1. Modificar el texto de WhatsApp para que mencione el medio de pago
content = content.replace(
    'mediante *Transferencia / Billetera Virtual*',
    'mediante *${metodoPago === \\'efectivo\\' ? \\'Pago en Efectivo\\' : \\'Transferencia / Billetera Virtual\\'}*'
);

// 2. Insertar los datos bancarios cuando la opción de transferencia está seleccionada
const transferButtonCode = `                                        {metodoPago === 'transferencia' ? <div className="w-5 h-5 rounded-full bg-pink-500 border-4 border-white shadow-sm ring-1 ring-pink-500"></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>}
                                    </button>
`;
const additionEfectivoAndBankInfo = `                                        {metodoPago === 'transferencia' ? <div className="w-5 h-5 rounded-full bg-pink-500 border-4 border-white shadow-sm ring-1 ring-pink-500"></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>}
                                    </button>
                                    {metodoPago === 'transferencia' && (
                                        <div className="p-4 bg-pink-50/50 border border-pink-100/50 rounded-xl text-sm text-slate-700">
                                            <p className="font-bold mb-2 text-pink-800">DATOS PARA TRANSFERIR:</p>
                                            <p>Alias: <b>vito.store</b></p>
                                            <p>Banco: <b>Naranja X</b></p>
                                            <p>A nombre de: <b>Bianca Irina Toledo</b></p>
                                        </div>
                                    )}
                                    <button 
                                        type="button"
                                        onClick={() => setMetodoPago('efectivo')}
                                        className={\`p-4 border-2 rounded-xl flex items-center justify-between transition-all \${metodoPago === 'efectivo' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-slate-200 hover:border-green-300'}\`}
                                    >
                                        <div className="flex flex-col text-left">
                                            <span className="font-bold text-slate-900 text-green-800">Pago en Efectivo 💵</span>
                                            <span className="text-sm text-slate-500 mt-0.5">Abonás al recibir o retirar</span>
                                        </div>
                                        {metodoPago === 'efectivo' ? <div className="w-5 h-5 rounded-full bg-green-500 border-4 border-white shadow-sm ring-1 ring-green-500"></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>}
                                    </button>
`;

content = content.replace(transferButtonCode, additionEfectivoAndBankInfo);

fs.writeFileSync('src/app/checkout/page.tsx', content);
