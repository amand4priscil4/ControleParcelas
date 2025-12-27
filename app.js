let db;
let dbReady = false;

// Inicializar IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        console.log('🔄 Inicializando IndexedDB...');
        const request = indexedDB.open('ParcelasDB', 1);

        request.onerror = () => {
            console.error('❌ Erro ao abrir banco');
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            dbReady = true;
            console.log('✅ Banco de dados pronto!');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            console.log('🆕 Criando estrutura do banco...');
            const db = event.target.result;

            // Store de Pessoas
            if (!db.objectStoreNames.contains('pessoas')) {
                const pessoasStore = db.createObjectStore('pessoas', { keyPath: 'id', autoIncrement: true });
                pessoasStore.createIndex('nome', 'nome', { unique: false });
            }

            // Store de Cartões
            if (!db.objectStoreNames.contains('cartoes')) {
                const cartoesStore = db.createObjectStore('cartoes', { keyPath: 'id', autoIncrement: true });
                cartoesStore.createIndex('nome', 'nome', { unique: false });
            }

            // Store de Compras
            if (!db.objectStoreNames.contains('compras')) {
                const comprasStore = db.createObjectStore('compras', { keyPath: 'id', autoIncrement: true });
                comprasStore.createIndex('pessoa_id', 'pessoa_id', { unique: false });
                comprasStore.createIndex('cartao_id', 'cartao_id', { unique: false });
                comprasStore.createIndex('data_compra', 'data_compra', { unique: false });
            }

            console.log('✅ Estrutura criada!');
        };
    });
}

// Funções auxiliares do IndexedDB
function addItem(storeName, item) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(item);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getAll(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getById(storeName, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function deleteItem(storeName, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

function countByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.count(value);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Inicializar interface
async function inicializarInterface() {
    // Sistema de abas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });

    // CADASTRO DE PESSOAS
    document.getElementById('form-pessoa').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!dbReady) {
            alert('⏳ Aguarde o sistema inicializar...');
            return;
        }
        
        const nome = document.getElementById('nome-pessoa').value.trim();
        
        if (nome) {
            try {
                await addItem('pessoas', { nome });
                document.getElementById('nome-pessoa').value = '';
                await listarPessoas();
                await carregarSelectPessoas();
                alert('✅ Pessoa cadastrada com sucesso!');
            } catch (error) {
                console.error('❌ Erro:', error);
                alert('❌ Erro ao cadastrar pessoa');
            }
        }
    });

    // CADASTRO DE CARTÕES
    document.getElementById('form-cartao').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!dbReady) {
            alert('⏳ Aguarde o sistema inicializar...');
            return;
        }
        
        const nome = document.getElementById('nome-cartao').value.trim();
        const bandeira = document.getElementById('bandeira-cartao').value;
        
        if (nome) {
            try {
                await addItem('cartoes', { nome, bandeira });
                document.getElementById('form-cartao').reset();
                await listarCartoes();
                await carregarSelectCartoes();
                alert('✅ Cartão cadastrado com sucesso!');
            } catch (error) {
                console.error('❌ Erro:', error);
                alert('❌ Erro ao cadastrar cartão');
            }
        }
    });

    // CADASTRO DE COMPRAS
    document.getElementById('form-compra').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!dbReady) {
            alert('⏳ Aguarde o sistema inicializar...');
            return;
        }
        
        const pessoa_id = parseInt(document.getElementById('pessoa-select').value);
        const cartao_id = parseInt(document.getElementById('cartao-select').value);
        const descricao = document.getElementById('descricao').value.trim();
        const valor_total = parseFloat(document.getElementById('valor').value);
        const num_parcelas = parseInt(document.getElementById('parcelas').value);
        const data_compra = document.getElementById('data-compra').value;
        
        if (pessoa_id && cartao_id && descricao && valor_total && num_parcelas && data_compra) {
            try {
                await addItem('compras', {
                    pessoa_id,
                    cartao_id,
                    descricao,
                    valor_total,
                    num_parcelas,
                    data_compra
                });
                
                document.getElementById('form-compra').reset();
                document.getElementById('data-compra').valueAsDate = new Date();
                await listarCompras();
                alert('✅ Compra cadastrada com sucesso!');
            } catch (error) {
                console.error('❌ Erro:', error);
                alert('❌ Erro ao cadastrar compra');
            }
        }
    });

    // Filtro de mês
    document.getElementById('filtro-mes').addEventListener('change', async (e) => {
        await listarCompras(e.target.value);
    });

    document.getElementById('btn-limpar-filtro').addEventListener('click', async () => {
        document.getElementById('filtro-mes').value = '';
        await listarCompras();
    });

    // RELATÓRIO
    document.getElementById('relatorio-mes').addEventListener('change', async (e) => {
        await gerarRelatorio(e.target.value);
    });

    // Setar data de hoje
    document.getElementById('data-compra').valueAsDate = new Date();

    // Setar mês atual no relatório
    const hoje = new Date();
    const mesAtual = hoje.toISOString().slice(0, 7);
    document.getElementById('relatorio-mes').value = mesAtual;

    // Carregar dados iniciais
    await listarPessoas();
    await listarCartoes();
    await carregarSelectPessoas();
    await carregarSelectCartoes();
    await listarCompras();
    await gerarRelatorio(mesAtual);
}

// Listar pessoas
async function listarPessoas() {
    if (!dbReady) return;
    
    const lista = document.getElementById('lista-pessoas');
    try {
        const pessoas = await getAll('pessoas');
        pessoas.sort((a, b) => a.nome.localeCompare(b.nome));
        
        if (pessoas.length === 0) {
            lista.innerHTML = '<div class="empty-state">👥 Nenhuma pessoa cadastrada ainda<p>Comece adicionando as pessoas que fazem compras!</p></div>';
            return;
        }
        
        lista.innerHTML = '';
        pessoas.forEach(pessoa => {
            const div = document.createElement('div');
            div.className = 'pessoa-item';
            div.innerHTML = `
                <span class="pessoa-nome">👤 ${pessoa.nome}</span>
                <button class="btn btn-danger" onclick="excluirPessoa(${pessoa.id})">Excluir</button>
            `;
            lista.appendChild(div);
        });
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// Excluir pessoa
async function excluirPessoa(id) {
    if (!dbReady) return;
    
    if (confirm('Tem certeza que deseja excluir esta pessoa?')) {
        try {
            const count = await countByIndex('compras', 'pessoa_id', id);
            if (count > 0) {
                alert('⚠️ Não é possível excluir. Esta pessoa possui compras cadastradas.');
                return;
            }
            
            await deleteItem('pessoas', id);
            await listarPessoas();
            await carregarSelectPessoas();
        } catch (error) {
            console.error('❌ Erro:', error);
            alert('❌ Erro ao excluir pessoa');
        }
    }
}

// Carregar select de pessoas
async function carregarSelectPessoas() {
    if (!dbReady) return;
    
    const select = document.getElementById('pessoa-select');
    try {
        const pessoas = await getAll('pessoas');
        pessoas.sort((a, b) => a.nome.localeCompare(b.nome));
        
        select.innerHTML = '<option value="">Selecione...</option>';
        pessoas.forEach(pessoa => {
            const option = document.createElement('option');
            option.value = pessoa.id;
            option.textContent = pessoa.nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// Listar cartões
async function listarCartoes() {
    if (!dbReady) return;
    
    const lista = document.getElementById('lista-cartoes');
    try {
        const cartoes = await getAll('cartoes');
        cartoes.sort((a, b) => a.nome.localeCompare(b.nome));
        
        if (cartoes.length === 0) {
            lista.innerHTML = '<div class="empty-state">💳 Nenhum cartão cadastrado ainda<p>Adicione os cartões que são usados nas compras!</p></div>';
            return;
        }
        
        lista.innerHTML = '';
        cartoes.forEach(cartao => {
            const div = document.createElement('div');
            div.className = 'pessoa-item';
            div.innerHTML = `
                <span class="pessoa-nome">💳 ${cartao.nome} ${cartao.bandeira ? `<span class="badge badge-primary">${cartao.bandeira.toUpperCase()}</span>` : ''}</span>
                <button class="btn btn-danger" onclick="excluirCartao(${cartao.id})">Excluir</button>
            `;
            lista.appendChild(div);
        });
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// Excluir cartão
async function excluirCartao(id) {
    if (!dbReady) return;
    
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
        try {
            const count = await countByIndex('compras', 'cartao_id', id);
            if (count > 0) {
                alert('⚠️ Não é possível excluir. Este cartão possui compras cadastradas.');
                return;
            }
            
            await deleteItem('cartoes', id);
            await listarCartoes();
            await carregarSelectCartoes();
        } catch (error) {
            console.error('❌ Erro:', error);
            alert('❌ Erro ao excluir cartão');
        }
    }
}

// Carregar select de cartões
async function carregarSelectCartoes() {
    if (!dbReady) return;
    
    const select = document.getElementById('cartao-select');
    try {
        const cartoes = await getAll('cartoes');
        cartoes.sort((a, b) => a.nome.localeCompare(b.nome));
        
        select.innerHTML = '<option value="">Selecione...</option>';
        cartoes.forEach(cartao => {
            const option = document.createElement('option');
            option.value = cartao.id;
            option.textContent = `${cartao.nome}${cartao.bandeira ? ' (' + cartao.bandeira + ')' : ''}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// Listar compras
async function listarCompras(filtroMes = null) {
    if (!dbReady) return;
    
    const lista = document.getElementById('lista-compras');
    try {
        let compras = await getAll('compras');
        
        // Filtrar por mês se necessário
        if (filtroMes) {
            compras = compras.filter(c => c.data_compra.startsWith(filtroMes));
        }
        
        // Ordenar por data (mais recente primeiro)
        compras.sort((a, b) => new Date(b.data_compra) - new Date(a.data_compra));
        
        if (compras.length === 0) {
            if (filtroMes) {
                lista.innerHTML = '<div class="empty-state">🔍 Nenhuma compra encontrada neste mês<p>Tente selecionar outro período ou ver todas as compras.</p></div>';
            } else {
                lista.innerHTML = '<div class="empty-state">🛒 Nenhuma compra cadastrada ainda<p>Comece cadastrando pessoas e cartões, depois adicione as compras!</p></div>';
            }
            return;
        }
        
        lista.innerHTML = '';
        
        for (const compra of compras) {
            const pessoa = await getById('pessoas', compra.pessoa_id);
            const cartao = await getById('cartoes', compra.cartao_id);
            
            const valorParcela = compra.valor_total / compra.num_parcelas;
            const dataFormatada = new Date(compra.data_compra + 'T00:00:00').toLocaleDateString('pt-BR');
            
            const div = document.createElement('div');
            div.className = 'compra-item';
            div.innerHTML = `
                <div class="compra-header">
                    <span class="compra-titulo">🛍️ ${compra.descricao}</span>
                    <button class="btn btn-danger" onclick="excluirCompra(${compra.id})">Excluir</button>
                </div>
                <div class="compra-info"><strong>👤 Pessoa:</strong> ${pessoa?.nome || 'N/A'}</div>
                <div class="compra-info"><strong>💳 Cartão:</strong> ${cartao?.nome || 'N/A'}${cartao?.bandeira ? ' <span class="badge badge-primary">' + cartao.bandeira.toUpperCase() + '</span>' : ''}</div>
                <div class="compra-info"><strong>📅 Data:</strong> ${dataFormatada}</div>
                <div class="parcelas-info">
                    <div><strong>💰 Valor Total:</strong> R$ ${compra.valor_total.toFixed(2)}</div>
                    <div><strong>📊 Parcelas:</strong> ${compra.num_parcelas}x de R$ ${valorParcela.toFixed(2)}</div>
                </div>
            `;
            lista.appendChild(div);
        }
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// Excluir compra
async function excluirCompra(id) {
    if (!dbReady) return;
    
    if (confirm('Tem certeza que deseja excluir esta compra?')) {
        try {
            await deleteItem('compras', id);
            await listarCompras();
        } catch (error) {
            console.error('❌ Erro:', error);
            alert('❌ Erro ao excluir compra');
        }
    }
}

// Gerar relatório
async function gerarRelatorio(mes) {
    if (!dbReady) return;
    
    const conteudo = document.getElementById('relatorio-conteudo');
    
    if (!mes) {
        conteudo.innerHTML = '<div class="empty-state">📅 Selecione um mês para ver o relatório<p>Escolha o mês acima para visualizar as parcelas a pagar.</p></div>';
        return;
    }
    
    try {
        const compras = await getAll('compras');
        const [anoMes, mesSelecionado] = mes.split('-');
        const mesRelatorio = parseInt(mesSelecionado) - 1;
        const anoRelatorio = parseInt(anoMes);
        
        const porPessoa = {};
        
        for (const compra of compras) {
            const dataInicio = new Date(compra.data_compra + 'T00:00:00');
            const mesCompra = dataInicio.getMonth();
            const anoCompra = dataInicio.getFullYear();
            
            const mesesPassados = (anoRelatorio - anoCompra) * 12 + (mesRelatorio - mesCompra);
            
            if (mesesPassados >= 0 && mesesPassados < compra.num_parcelas) {
                const pessoa = await getById('pessoas', compra.pessoa_id);
                const cartao = await getById('cartoes', compra.cartao_id);
                
                if (!pessoa) continue;
                
                if (!porPessoa[pessoa.nome]) {
                    porPessoa[pessoa.nome] = [];
                }
                
                const parcelaAtual = mesesPassados + 1;
                const valorParcela = compra.valor_total / compra.num_parcelas;
                
                porPessoa[pessoa.nome].push({
                    descricao: compra.descricao,
                    valorParcela,
                    parcelaAtual,
                    numParcelas: compra.num_parcelas,
                    nomeCartao: cartao?.nome || 'N/A',
                    bandeiraCartao: cartao?.bandeira
                });
            }
        }
        
        if (Object.keys(porPessoa).length === 0) {
            conteudo.innerHTML = '<div class="empty-state">📊 Nenhuma parcela ativa neste mês<p>Não há compras com parcelas a pagar neste período.</p></div>';
            return;
        }
        
        let html = '';
        let totalGeral = 0;
        
        Object.keys(porPessoa).sort().forEach(nome => {
            const compras = porPessoa[nome];
            let totalPessoa = 0;
            
            html += `<div class="relatorio-pessoa">`;
            html += `<h3>👤 ${nome}</h3>`;
            
            compras.forEach(({ descricao, valorParcela, parcelaAtual, numParcelas, nomeCartao, bandeiraCartao }) => {
                totalPessoa += valorParcela;
                html += `
                    <div class="relatorio-item">
                        <strong>🛍️ ${descricao}</strong><br>
                        💳 ${nomeCartao}${bandeiraCartao ? ' <span class="badge badge-primary">' + bandeiraCartao.toUpperCase() + '</span>' : ''}<br>
                        📊 Parcela ${parcelaAtual}/${numParcelas}: <strong>R$ ${valorParcela.toFixed(2)}</strong>
                    </div>
                `;
            });
            
            html += `<div style="margin-top: 14px; padding: 12px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px; font-weight: bold; color: var(--success); border-left: 4px solid var(--success);">
                💰 Total ${nome}: R$ ${totalPessoa.toFixed(2)}
            </div>`;
            html += `</div>`;
            
            totalGeral += totalPessoa;
        });
        
        html += `<div class="total-mes">💵 Total do Mês: R$ ${totalGeral.toFixed(2)}</div>`;
        
        conteudo.innerHTML = html;
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('✅ Service Worker registrado'))
        .catch(err => console.log('❌ Erro ao registrar Service Worker:', err));
}

// Inicializar aplicação
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando aplicação...');
    try {
        await initDB();
        await inicializarInterface();
        console.log('✅ Aplicação pronta!');
    } catch (error) {
        console.error('❌ Erro fatal:', error);
        alert('Erro ao inicializar o sistema. Por favor, recarregue a página.');
    }
});