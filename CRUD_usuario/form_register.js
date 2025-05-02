// -------------------- CARREGAMENTO INICIAL E VARIÁVEIS GLOBAIS --------------------

let users = JSON.parse(localStorage.getItem("users")) || []; // Recupera a lista de usuários do localStorage ou inicializa como array vazio
const userForm = document.getElementById("userForm"); // Seleciona o formulário de cadastro
const nameInput = document.getElementById("name"); // Seleciona o campo de entrada do nome
const emailInput = document.getElementById("email"); // Seleciona o campo de entrada do email
const dataTableBody = document.querySelector("#data_table tbody"); // Seleciona o corpo da tabela onde os usuários serão exibidos
const editForm = document.getElementById("editForm"); // Seleciona o formulário de edição
const editNomeInput = document.getElementById("editNome"); // Seleciona o campo de entrada de nome no formulário de edição
const editEmailInput = document.getElementById("editEmail"); // Seleciona o campo de entrada de email no formulário de edição
const editIndexInput = document.getElementById("editIndex"); // Seleciona o campo oculto que guarda o índice do usuário a ser editado

let editingIndex = null; // Índice do usuário sendo editado (usado para controle interno)
console.log("DOMPurify está carregado?", typeof DOMPurify.sanitize === 'function'); // Verifica se o DOMPurify está disponível

// -------------------- FUNÇÃO PARA EXIBIR MENSAGENS DE FEEDBACK --------------------

function exibirMensagem(mensagem, tipo = 'sucesso') {
    const msg = document.getElementById("mensagem");
    msg.textContent = mensagem;
    msg.classList.remove("sucesso", "erro"); // Remove classes de tipo anteriores
    msg.classList.add(tipo); // Adiciona a classe do tipo atual
    msg.classList.remove("fadeOut"); // Remove classe de desaparecimento (caso exista)
    msg.style.display = "block"; // Exibe a mensagem
    msg.style.animation = "fadeIn 0.5s ease-out forwards"; // Aplica animação de entrada

    setTimeout(() => {
        msg.style.animation = "fadeOut 0.5s ease-in forwards"; // Aplica animação de saída após 3s
    }, 3000);

    setTimeout(() => {
        msg.style.display = "none"; // Oculta a mensagem após 3.5s
    }, 3500);
}

// -------------------- FUNÇÃO PARA VALIDAR O FORMATO DO EMAIL --------------------

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expressão regular básica para validar o formato do email
    return emailRegex.test(email); // Retorna true se o email corresponde ao padrão, false caso contrário
}

// -------------------- FUNÇÃO PARA VERIFICAR EMAIL JÁ CADASTRADO --------------------

function emailJaCadastrado(email, ignorarIndex = null) {
    return users.some((user, index) => user.email === email && index !== ignorarIndex); // Verifica se o email já existe (ignorando o índice atual, se for edição)
}

// -------------------- FUNÇÃO PARA VALIDAR OS CAMPOS DO FORMULÁRIO --------------------

function validarFormulario(nome, email, modo = "cadastro", ignorarIndex = null) {
    const validacoes = [
        { condicao: !nome, mensagem: "Por favor, preencha o nome." }, // Verifica se o nome está vazio
        { condicao: !email, mensagem: "Por favor, preencha o email." }, // Verifica se o email está vazio
        { condicao: !isValidEmail(email), mensagem: "Por favor, insira um email válido." }, // Verifica se o formato do email é válido
    ];

    if (modo === "cadastro" && emailJaCadastrado(email)) {
        validacoes.push({ condicao: true, mensagem: "Este email já está cadastrado." }); // Impede emails duplicados no cadastro
    }

    if (modo === "edicao" && emailJaCadastrado(email, ignorarIndex)) {
        validacoes.push({ condicao: true, mensagem: "Este email já está sendo usado por outro usuário." }); // Impede conflito de emails ao editar
    }

    for (const validacao of validacoes) {
        if (validacao.condicao) {
            exibirMensagem(validacao.mensagem, "erro"); // Exibe a mensagem de erro
            return false; // Retorna false, indicando que a validação falhou
        }
    }

    return true; // Retorna true se todas as validações passaram
}

// -------------------- FUNÇÃO PARA RENDERIZAR A TABELA DE USUÁRIOS --------------------

function renderUserTable() {
    if (!dataTableBody) { // Verifica se o corpo da tabela existe
        console.error("Elemento tbody da tabela não encontrado!"); // Mostra erro no console se não existir
        return;
    }
    dataTableBody.innerHTML = ""; // Limpa a tabela antes de renderizar novamente

    users.forEach((user, index) => { // Itera sobre a lista de usuários
        const row = document.createElement("tr"); // Cria uma nova linha na tabela
        row.innerHTML = `
            <td><strong>Nome:</strong> ${DOMPurify.sanitize(user.name || "")}</td> <!-- Sanitiza o nome ao renderizar -->
            <td><strong>Email:</strong> ${DOMPurify.sanitize(user.email || "")}</td> <!-- Sanitiza o email ao renderizar -->
            <td>
                <button onclick="editarUser(${index})">Editar</button>
                <button onclick="excluirUser(${index})">Excluir</button>
            </td>
        `;
        dataTableBody.appendChild(row); // Adiciona a linha na tabela
    });
}

// -------------------- FUNÇÃO PARA EXCLUIR UM USUÁRIO --------------------

function excluirUser(index) {
    if (confirm("Deseja realmente excluir este usuário?")) { // Pede confirmação antes de excluir
        users.splice(index, 1); // Remove o usuário da lista
        localStorage.setItem("users", JSON.stringify(users)); // Atualiza o localStorage com a nova lista
        renderUserTable(); // Re-renderiza a tabela
        exibirMensagem("Usuário excluído com sucesso!"); // Feedback visual
    }
}

// -------------------- FUNÇÃO PARA PREENCHER O FORMULÁRIO DE EDIÇÃO --------------------

function editarUser(index) {
    // Verifica se o índice é válido (dentro do intervalo do array 'users')
    if (index < 0 || index >= users.length) {
        console.error("Índice de usuário inválido:", index); // Log de erro no console
        exibirMensagem("Erro ao carregar usuário para edição", "erro"); // Feedback visual
        return; // Interrompe a execução se o índice for inválido
    }

    const user = users[index]; // Obtém o objeto do usuário correspondente ao índice
    
    // Preenche os campos com os dados atuais (sanitizados para exibição)
    editNomeInput.value = DOMPurify.sanitize(user.name || ""); // Fallback para string vazia
    editEmailInput.value = DOMPurify.sanitize(user.email || "");
    
    // Armazena o índice do usuário no campo oculto
    editIndexInput.value = index;
    
    // Exibe o formulário de edição
    editForm.style.display = "flex";
    editForm.style.animation = "fadeIn 0.3s ease-out"; // Animação de entrada
    
    // Foco no campo de nome após pequeno delay
    setTimeout(() => editNomeInput.focus(), 100);
}

// -------------------- EVENTO DE ENVIO DO FORMULÁRIO DE EDIÇÃO --------------------

editForm.addEventListener("submit", function(e) {
    e.preventDefault(); // Impede o comportamento padrão de recarregar a página

    const nome = editNomeInput.value.trim(); // Remove espaços em branco
    const email = editEmailInput.value.trim();
    const index = parseInt(editIndexInput.value); // Converte para número

    // Validações básicas
    if (isNaN(index) || index < 0 || index >= users.length) {
        exibirMensagem("Índice inválido para edição", "erro");
        return;
    }

    if (validarFormulario(nome, email, "edicao", index)) {
        // Atualiza os dados (sanitiza apenas ao armazenar)
        users[index] = { 
            name: DOMPurify.sanitize(nome, { ALLOWED_TAGS: [] }), // Remove todas tags HTML
            email: DOMPurify.sanitize(email, { ALLOWED_ATTR: [] }) // Remove atributos
        };
        
        localStorage.setItem("users", JSON.stringify(users)); // Persiste os dados
        renderUserTable(); // Atualiza a tabela
        exibirMensagem("Usuário atualizado com sucesso!", "sucesso");
        this.reset(); // Limpa o formulário
        this.style.display = "none"; // Oculta o formulário
    }
});

// -------------------- EVENTO DE ENVIO DO FORMULÁRIO DE CADASTRO --------------------

userForm.addEventListener("submit", function(e) {
    e.preventDefault(); // Impede o envio padrão do formulário

    const nome = nameInput.value.trim(); // Remove espaços em branco
    const email = emailInput.value.trim();

    if (validarFormulario(nome, email, "cadastro")) {
        // Armazena os dados crus (sanitização será feita apenas na renderização)
        users.push({ name: nome, email: email });
        localStorage.setItem("users", JSON.stringify(users)); // Persiste os dados
        this.reset(); // Limpa o formulário
        renderUserTable(); // Atualiza a tabela
        exibirMensagem("Cadastro realizado com sucesso!", "sucesso");
    }
});

// -------------------- INICIALIZAÇÃO AO CARREGAR A PÁGINA --------------------

document.addEventListener('DOMContentLoaded', renderUserTable); // Renderiza a tabela quando o DOM estiver pronto