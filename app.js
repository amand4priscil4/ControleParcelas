let db;
let dbReady = false;

// Inicializar SQL.js e banco de dados
async function initDB() {
    try {
        console.log('🔄 Inicializando SQL.js...');
        const SQL = await initSqlJs({
            locateFile: file => `https://sql.js.org/dist/${file}`
        });
        console.log('✅ SQL.js carregado');

        // Tentar carregar banco existente do localStorage
        const savedDB = localStorage.getItem('parcelasDB');
        if (savedDB) {
            console.log('📂 Carregando banco existente...');
            const uInt8Array = new Uint8Array(JSON.parse(savedDB));
            db = new SQL.Database(uInt8Array);
        } else {
            console.log('🆕 Criando novo banco...');
            db = new SQL.Database();
            criarTabelas();
        }
        
        dbReady = true;
        console.log('✅ Banco de dados pronto!');
        
        // Inicializar interface após o banco estar pronto
        inicializarInterface();
    } catch (error) {
        console.error('❌ Erro ao inicializar banco:', error);
        alert('Erro ao inicializar o sistema. Recarregue a página.');
    }
}

// Criar estrutura do banco
function criarTabelas() {
    try {
        db.run(`
            CREATE TABLE IF NOT EXISTS pessoas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS cartoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                bandeira TEXT
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS compras (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pessoa_id INTEGER NOT NULL,
                cartao_id INTEGER NOT NULL,
                descricao TEXT NOT NULL,
                valor_total REAL NOT NULL,
                num_parcelas INTEGER NOT NULL,
                data_compra DATE NOT NULL,
                FOREIGN KEY (pessoa_id) REFERENCES pessoas(id),
                FOREIGN KEY (cartao_id) REFERENCES cartoes(id)
            )
        `);

        console.log('✅ Tabelas criadas');
        salvarDB();
    } catch (error) {
        console.error('❌ Erro ao criar tabelas:', error);
    }
}

// Salvar banco no localStorage
function salvarDB() {
    try {
        const data = db.export();
        const buffer = JSON.stringify(Array.from(data));
        localStorage.setItem('parcelasDB', buffer);
    } catch (error) {
        console.error('❌ Erro ao salvar banco:', error);
    }
}

// Inicializar interface apenas quando o banco estiver pronto
function inicializarInterface() {
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
    const formPessoa = document.getElementById('form-pessoa');
    if (formPessoa) {
        formPessoa.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!dbReady) {
                alert('⏳ Aguarde o sistema inicializar...');
                return;
            }
            
            const nome = document.getElementById('nome-pessoa').value.trim();
            
            if (nome) {
                try {
                    db.run('INSERT INTO pessoas (nome) VALUES (?)', [nome]);
                    salvarDB();
                    
                    document.getElementById('nome-pessoa').value = '';
                    listarPessoas();
                    carregarSelectPessoas();
                    
                    alert('✅ Pessoa cadastrada com sucesso!');
                } catch (error) {
                    console.error('❌ Erro:', error);
                    alert('❌ Erro ao cadastrar pessoa');
                }
            }
        });
    }

    // CADASTRO DE CARTÕES
    const formCartao = document.getElementById('form-cartao');
    if (formCartao) {
        formCartao.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!dbReady) {
                alert('⏳ Aguarde o sistema inicializar...');
                return;
            }
            
            const nome = document.getElementById('nome-cartao').value.trim();
            const bandeira = document.getElementById('bandeira-cartao').value;
            
            if (nome) {
                try {
                    db.run('INSERT INTO cartoes (nome, bandeira) VALUES (?, ?)', [nome, bandeira]);
                    salvarDB();
                    
                    document.getElementById('form-cartao').reset();
                    listarCartoes();
                    carregarSelectCartoes();
                    
                    alert('✅ Cartão cadastrado com sucesso!');
                } catch (error) {
                    console.error('❌ Erro:', error);
                    alert('❌ Erro ao cadastrar cartão');
                }
            }
        });
    }

    // CADASTRO DE COMPRAS
    const formCompra = document.getElementById('form-compra');
    if (formCompra) {
        formCompra.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!dbReady) {
                alert('⏳ Aguarde o sistema inicializar...');
                return;
            }
            
            const pessoaId = document.getElementById('pessoa-select').value;
            const cartaoId = document.getElementById('cartao-select').value;
            const descricao = document.getElementById('descricao').value.trim();
            const valor = parseFloat(document.getElementById('valor').value);
            const parcelas = parseInt(document.getElementById('parcelas').value);
            const dataCompra = document.getElementById('data-compra').value;
            
            if (pessoaId && cartaoId && descricao && valor && parcelas && dataCompra) {
                try {
                    db.run(
                        'INSERT INTO compras (pessoa_id, cartao_id, descricao, valor_total, num_parcelas, data_compra) VALUES (?, ?, ?, ?, ?, ?)',
                        [pessoaId, cartaoId, descricao, valor, parcelas, dataCompra]
                    );
                    salvarDB();
                    
                    document.getElementById('form-compra').reset();
                    document.getElementById('data-compra').valueAsDate = new Date();
                    listarCompras();
                    
                    alert('✅ Compra cadastrada com sucesso!');
                } catch (error) {
                    console.error('❌ Erro:', error);
                    alert('❌ Erro ao cadastrar compra');
                }
            }
        });
    }

    // Filtro de mês
    const filtroMes = document.getElementById('filtro-mes');
    if (filtroMes) {
        filtroMes.addEventListener('change', (e) => {
            const mes = e.target.value;
            listarCompras(mes);
        });
    }

    const btnLimparFiltro = document.getElementById('btn-limpar-filtro');
    if (btnLimparFiltro) {
        btnLimparFiltro.addEventListener('click', () => {
            document.getElementById('filtro-mes').value = '';
            listarCompras();
        });
    }

    // RELATÓRIO
    const relatorioMes = document.getElementById('relatorio-mes');
    if (relatorioMes) {
        relatorioMes.addEventListener('change', (e) => {
            gerarRelatorio(e.target.value);
        });
    }

    // Setar data de hoje no campo de data
    const dataCompra = document.getElementById('data-compra');
    if (dataCompra) {
        dataCompra.valueAsDate = new Date();
    }

    // Setar mês atual no relatório
    const hoje = new Date();
    const mesAtual = hoje.toISOString().slice(0, 7);
    if (relatorioMes) {
        relatorioMes.value = mesAtual;
    }

    // Carregar dados iniciais
    listarPessoas();
    listarCartoes();
    carregarSelectPessoas();
    carregarSelectCartoes();
    listarCompras();
    gerarRelatorio(mesAtual);
}

// Listar pessoas
function listarPessoas() {
    if (!dbReady) return;
    
    const lista = document.getElementById('lista-pessoas');
    if (!lista) return;
    
    try {
        const result = db.exec('SELECT * FROM pessoas ORDER BY nome');
        
        if (result.length === 0 || result[0].values.length === 0) {
            lista.innerHTML = '<div class="empty-state">👥 Nenhuma pessoa cadastrada ainda<p>Comece adicionando as pessoas que fazem compras!</p></div>';
            return;
        }
        
        lista.innerHTML = '';
        result[0].values.forEach(([id, nome]) => {
            const div = document.createElement('div');
            div.className = 'pessoa-item';
            div.innerHTML = `
                <span class="pessoa-nome">👤 ${nome}</span>
                <button class="btn btn-danger" onclick="excluirPessoa(${id})">Excluir</button>
            `;
            lista.appendChild(div);
        });
    } catch (error) {
        console.error('❌ Erro ao listar pessoas:', error);
    }
}

// Excluir pessoa
function excluirPessoa(id) {
    if (!dbReady) return;
    
    if (confirm('Tem certeza que deseja excluir esta pessoa?')) {
        try {
            // Verificar se tem compras
            const compras = db.exec('SELECT COUNT(*) FROM compras WHERE pessoa_id = ?', [id]);
            if (compras[0].values[0][0] > 0) {
                alert('⚠️ Não é possível excluir. Esta pessoa possui compras cadastradas.');
                return;
            }
            
            db.run('DELETE FROM pessoas WHERE id = ?', [id]);
            salvarDB();
            listarPessoas();
            carregarSelectPessoas();
        } catch (error) {
            console.error('❌ Erro:', error);
            alert('❌ Erro ao excluir pessoa');
        }
    }
}

// Carregar select de pessoas
function carregarSelectPessoas() {
    if (!dbReady) return;
    
    const select = document.getElementById('pessoa-select');
    if (!select) return;
    
    try {
        const result = db.exec('SELECT * FROM pessoas ORDER BY nome');
        
        select.innerHTML = '<option value="">Selecione...</option>';
        
        if (result.length > 0) {
            result[0].values.forEach(([id, nome]) => {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = nome;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('❌ Erro ao carregar select de pessoas:', error);
    }
}

// Listar cartões
function listarCartoes() {
    if (!dbReady) return;
    
    const lista = document.getElementById('lista-cartoes');
    if (!lista) return;
    
    try {
        const result = db.exec('SELECT * FROM cartoes ORDER BY nome');
        
        if (result.length === 0 || result[0].values.length === 0) {
            lista.innerHTML = '<div class="empty-state">💳 Nenhum cartão cadastrado ainda<p>Adicione os cartões que são usados nas compras!</p></div>';
            return;
        }
        
        lista.innerHTML = '';
        result[0].values.forEach(([id, nome, bandeira]) => {
            const div = document.createElement('div');
            div.className = 'pessoa-item';
            div.innerHTML = `
                <span class="pessoa-nome">💳 ${nome} ${bandeira ? `<span class="badge badge-primary">${bandeira.toUpperCase()}</span>` : ''}</span>
                <button class="btn btn-danger" onclick="excluirCartao(${id})">Excluir</button>
            `;
            lista.appendChild(div);
        });
    } catch (error) {
        console.error('❌ Erro ao listar cartões:', error);
    }
}

// Excluir cartão
function excluirCartao(id) {
    if (!dbReady) return;
    
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
        try {
            // Verificar se tem compras
            const compras = db.exec('SELECT COUNT(*) FROM compras WHERE cartao_id = ?', [id]);
            if (compras[0].values[0][0] > 0) {
                alert('⚠️ Não é possível excluir. Este cartão possui compras cadastradas.');
                return;
            }
            
            db.run('DELETE FROM cartoes WHERE id = ?', [id]);
            salvarDB();
            listarCartoes();
            carregarSelectCartoes();
        } catch (error) {
            console.error('❌ Erro:', error);
            alert('❌ Erro ao excluir cartão');
        }
    }
}

// Carregar select de cartões
function carregarSelectCartoes() {
    if (!dbReady) return;
    
    const select = document.getElementById('cartao-select');
    if (!select) return;
    
    try {
        const result = db.exec('SELECT * FROM cartoes ORDER BY nome');
        
        select.innerHTML = '<option value="">Selecione...</option>';
        
        if (result.length > 0) {
            result[0].values.forEach(([id, nome, bandeira]) => {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = `${nome}${bandeira ? ' (' + bandeira + ')' : ''}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('❌ Erro ao carregar select de cartões:', error);
    }
}

// Listar compras
function listarCompras(filtroMes = null) {
    if (!dbReady) return;
    
    const lista = document.getElementById('lista-compras');
    if (!lista) return;
    
    try {
        let query = `
            SELECT c.id, c.descricao, c.valor_total, c.num_parcelas, c.data_compra, p.nome, ca.nome, ca.bandeira
            FROM compras c
            JOIN pessoas p ON c.pessoa_id = p.id
            JOIN cartoes ca ON c.cartao_id = ca.id
        `;
        
        const params = [];
        if (filtroMes) {
            query += ` WHERE strftime('%Y-%m', c.data_compra) = ?`;
            params.push(filtroMes);
        }
        
        query += ' ORDER BY c.data_compra DESC';
        
        const result = db.exec(query, params);
        
        if (result.length === 0 || result[0].values.length === 0) {
            if (filtroMes) {
                lista.innerHTML = '<div class="empty-state">🔍 Nenhuma compra encontrada neste mês<p>Tente selecionar outro período ou ver todas as compras.</p></div>';
            } else {
                lista.innerHTML = '<div class="empty-state">🛒 Nenhuma compra cadastrada ainda<p>Comece cadastrando pessoas e cartões, depois adicione as compras!</p></div>';
            }
            return;
        }
        
        lista.innerHTML = '';
        result[0].values.forEach(([id, descricao, valorTotal, numParcelas, dataCompra, nomePessoa, nomeCartao, bandeiraCartao]) => {
            const valorParcela = valorTotal / numParcelas;
            const dataFormatada = new Date(dataCompra + 'T00:00:00').toLocaleDateString('pt-BR');
            
            const div = document.createElement('div');
            div.className = 'compra-item';
            div.innerHTML = `
                <div class="compra-header">
                    <span class="compra-titulo">🛍️ ${descricao}</span>
                    <button class="btn btn-danger" onclick="excluirCompra(${id})">Excluir</button>
                </div>
                <div class="compra-info"><strong>👤 Pessoa:</strong> ${nomePessoa}</div>
                <div class="compra-info"><strong>💳 Cartão:</strong> ${nomeCartao}${bandeiraCartao ? ' <span class="badge badge-primary">' + bandeiraCartao.toUpperCase() + '</span>' : ''}</div>
                <div class="compra-info"><strong>📅 Data:</strong> ${dataFormatada}</div>
                <div class="parcelas-info">
                    <div><strong>💰 Valor Total:</strong> R$ ${valorTotal.toFixed(2)}</div>
                    <div><strong>📊 Parcelas:</strong> ${numParcelas}x de R$ ${valorParcela.toFixed(2)}</div>
                </div>
            `;
            lista.appendChild(div);
        });
    } catch (error) {
        console.error('❌ Erro ao listar compras:', error);
    }
}

// Excluir compra
function excluirCompra(id) {
    if (!dbReady) return;
    
    if (confirm('Tem certeza que deseja excluir esta compra?')) {
        try {
            db.run('DELETE FROM compras WHERE id = ?', [id]);
            salvarDB();
            listarCompras();
        } catch (error) {
            console.error('❌ Erro:', error);
            alert('❌ Erro ao excluir compra');
        }
    }
}

// Gerar relatório
function gerarRelatorio(mes) {
    if (!dbReady) return;
    
    const conteudo = document.getElementById('relatorio-conteudo');
    if (!conteudo) return;
    
    if (!mes) {
        conteudo.innerHTML = '<div class="empty-state">📅 Selecione um mês para ver o relatório<p>Escolha o mês acima para visualizar as parcelas a pagar.</p></div>';
        return;
    }
    
    try {
        const query = `
            SELECT p.nome, c.descricao, c.valor_total, c.num_parcelas, c.data_compra, ca.nome, ca.bandeira
            FROM compras c
            JOIN pessoas p ON c.pessoa_id = p.id
            JOIN cartoes ca ON c.cartao_id = ca.id
            WHERE strftime('%Y-%m', c.data_compra) <= ?
            ORDER BY p.nome, c.data_compra
        `;
        
        const result = db.exec(query, [mes]);
        
        if (result.length === 0 || result[0].values.length === 0) {
            conteudo.innerHTML = '<div class="empty-state">📊 Nenhuma parcela ativa neste mês<p>Não há compras com parcelas a pagar neste período.</p></div>';
            return;
        }
        
        // Organizar por pessoa
        const porPessoa = {};
        const [anoMes, mesSelecionado] = mes.split('-');
        
        result[0].values.forEach(([nome, descricao, valorTotal, numParcelas, dataCompra, nomeCartao, bandeiraCartao]) => {
            if (!porPessoa[nome]) {
                porPessoa[nome] = [];
            }
            
            const dataInicio = new Date(dataCompra + 'T00:00:00');
            const mesCompra = dataInicio.getMonth();
            const anoCompra = dataInicio.getFullYear();
            
            const mesRelatorio = parseInt(mesSelecionado) - 1;
            const anoRelatorio = parseInt(anoMes);
            
            const mesesPassados = (anoRelatorio - anoCompra) * 12 + (mesRelatorio - mesCompra);
            
            if (mesesPassados >= 0 && mesesPassados < numParcelas) {
                const parcelaAtual = mesesPassados + 1;
                const valorParcela = valorTotal / numParcelas;
                
                porPessoa[nome].push({
                    descricao,
                    valorParcela,
                    parcelaAtual,
                    numParcelas,
                    nomeCartao,
                    bandeiraCartao
                });
            }
        });
        
        // Verificar se há parcelas ativas no mês
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
        console.error('❌ Erro ao gerar relatório:', error);
    }
}

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('✅ Service Worker registrado'))
        .catch(err => console.log('❌ Erro ao registrar Service Worker:', err));
}

// Inicializar aplicação quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando aplicação...');
    initDB();
});