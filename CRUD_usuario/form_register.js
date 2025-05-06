// -------------------- DECLARAÇÃO DE VARIÁVEIS GLOBAIS --------------------
let users = []; // Array para armazenar os usuários
let userForm, nameInput, emailInput, dataTableBody, editForm, editNomeInput, editEmailInput, editIdInput, limparTodosBtn;

// -------------------- FUNÇÕES PRINCIPAIS --------------------

/**
 * Carrega os usuários do localStorage com verificação de estrutura
 */
function carregarUsuarios() {
    try {
        const storedUsers = localStorage.getItem("users");
        if (storedUsers) {
            users = JSON.parse(storedUsers);
            
            // Verifica se é um array válido
            if (!Array.isArray(users)) {
                console.error("Dados inválidos: users não é um array");
                users = [];
                return;
            }
            
            // Verifica a estrutura dos itens
            if (users.length > 0 && !users[0].id) {
                console.error("Dados inválidos: usuários sem ID detectados");
                users = [];
            }
        }
    } catch (e) {
        console.error("Erro ao carregar usuários:", e);
        users = [];
    }
}

/**
 * Renderiza a tabela de usuários
 */
/**
 * Renderiza a tabela de usuários
 */
function renderUserTable() {
    if (!dataTableBody) {
        console.error("Erro: Elemento tbody não encontrado");
        return;
    }
    
    dataTableBody.innerHTML = "";
    
    users.forEach(user => {
        if (!user?.id) {
            console.warn("Usuário inválido ignorado:", user);
            return;
        }
        
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><code>${user.id.substring(0, 8)}...</code></td>
            <td>${DOMPurify.sanitize(user.name || '')}</td>
            <td>${DOMPurify.sanitize(user.email || '')}</td>
            <td>
                <button onclick="editarUser('${user.id}')">Editar</button>
                <button onclick="excluirUser('${user.id}')">Excluir</button>
            </td>
        `;
        dataTableBody.appendChild(row);
    });
    
    // Verifica se o usuário em edição ainda existe
    if (editIdInput.value && !users.some(user => user.id === editIdInput.value)) {
        editForm.style.display = "none";
        editForm.reset();
        exibirMensagem("O usuário em edição foi removido", "erro");
    }
}

/**
 * Valida se um email tem formato válido
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Verifica se email já está cadastrado (opcionalmente ignorando um ID)
 */
function emailJaCadastrado(email, ignorarId = null) {
    return users.some(user => 
        user.email === email && 
        (ignorarId ? user.id !== ignorarId : true)
    );
}

/**
 * Exibe mensagens de feedback para o usuário
 */
function exibirMensagem(mensagem, tipo = 'sucesso') {
    const msg = document.getElementById("mensagem");
    msg.textContent = mensagem;
    msg.className = `mensagem ${tipo}`;
    msg.style.display = "block";

    setTimeout(() => {
        msg.style.opacity = "0";
        setTimeout(() => msg.style.display = "none", 500);
    }, 3000);
}

/**
 * Limpa todos os dados do sistema
 */
function limparTodosDados() {
    if (!confirm("ATENÇÃO: Isso apagará TODOS os usuários. Continuar?")) return;
    
    users = [];
    localStorage.removeItem("users");
    renderUserTable();
    exibirMensagem("Todos os dados foram removidos!", "sucesso");
}

// -------------------- FUNÇÕES DE CRUD --------------------

/**
 * Prepara o formulário de edição
 */
function editarUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) {
        exibirMensagem("Usuário não encontrado", "erro");
        return;
    }

    editNomeInput.value = user.name;
    editEmailInput.value = user.email;
    editIdInput.value = user.id;
    editForm.style.display = "flex";
}

/**
 * Remove um usuário específico
 */
function excluirUser(id) {
    if (!confirm("Deseja realmente excluir este usuário?")) return;
    
    // Verifica se o usuário sendo excluído está em edição
    if (editIdInput.value === id) {
        editForm.style.display = "none"; // Fecha o formulário de edição
        editForm.reset(); // Limpa os campos
    }
    
    users = users.filter(user => user.id !== id);
    localStorage.setItem("users", JSON.stringify(users));
    renderUserTable();
    exibirMensagem("Usuário excluído com sucesso!");
}

// -------------------- INICIALIZAÇÃO --------------------

document.addEventListener("DOMContentLoaded", function() {
    // Inicializa elementos do DOM
    userForm = document.getElementById("userForm");
    nameInput = document.getElementById("name");
    emailInput = document.getElementById("email");
    dataTableBody = document.querySelector("#data_table tbody");
    editForm = document.getElementById("editForm");
    editNomeInput = document.getElementById("editNome");
    editEmailInput = document.getElementById("editEmail");
    editIdInput = document.getElementById("editId");
    limparTodosBtn = document.getElementById("limparTodos");

    // Carrega e exibe os usuários
    carregarUsuarios();
    renderUserTable();

    // Evento de cadastro
    userForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const nome = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!nome || !email) {
            exibirMensagem("Preencha todos os campos", "erro");
            return;
        }

        if (!isValidEmail(email)) {
            exibirMensagem("Formato de email inválido", "erro");
            return;
        }

        if (emailJaCadastrado(email)) {
            exibirMensagem("Email já cadastrado", "erro");
            return;
        }

        const newUser = {
            id: uuidv4(),
            name: nome,
            email: email
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        this.reset();
        renderUserTable();
        exibirMensagem("Usuário cadastrado com sucesso!");
    });

    // Evento de edição
    editForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const id = editIdInput.value;
        const nome = editNomeInput.value.trim();
        const email = editEmailInput.value.trim();

        if (!nome || !email) {
            exibirMensagem("Preencha todos os campos", "erro");
            return;
        }

        if (!isValidEmail(email)) {
            exibirMensagem("Formato de email inválido", "erro");
            return;
        }

        if (emailJaCadastrado(email, id)) {
            exibirMensagem("Email já cadastrado", "erro");
            return;
        }

        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            exibirMensagem("Usuário não encontrado", "erro");
            return;
        }

        users[userIndex] = {
            id: id,
            name: DOMPurify.sanitize(nome),
            email: DOMPurify.sanitize(email)
        };

        localStorage.setItem("users", JSON.stringify(users));
        renderUserTable();
        this.reset();
        this.style.display = "none";
        exibirMensagem("Usuário atualizado com sucesso!");
    });

    // Evento do botão limpar
    if (limparTodosBtn) {
        limparTodosBtn.addEventListener("click", limparTodosDados);
    }
});