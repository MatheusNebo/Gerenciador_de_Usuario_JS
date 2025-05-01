// form_register.js - atualizado com validação de email duplicado

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
            <td><strong>Nome:</strong> ${escapeHtml(user.name)}</td> //(escapeHTML) converte caracteres especiais em suas entidades HTML, impedindo que sejam interpretados como código
            <td><strong>Email:</strong> ${escapeHtml(user.email)}</td> //(escapeHTML) converte caracteres especiais em suas entidades HTML, impedindo que sejam interpretados como código
            <td>
                <button onclick="editarUser(${index})">Editar</button>
                <button onclick="excluirUser(${index})">Excluir</button>
            </td>
        `; // Adiciona o conteúdo HTML da linha com nome, email e botões
        dataTableBody.appendChild(row); // Adiciona a linha na tabela
    });
}

// Função para escapar caracteres HTML (adicionar no início do arquivo)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// -------------------- FUNÇÃO PARA EXCLUIR UM USUÁRIO --------------------

function excluirUser(index) {
    if (confirm("Deseja realmente excluir este usuário?")) { // Pede confirmação antes de excluir
        users.splice(index, 1); // Remove o usuário da lista
        localStorage.setItem("users", JSON.stringify(users)); // Atualiza o localStorage com a nova lista
        renderUserTable(); // Re-renderiza a tabela
        exibirMensagem("Usuário excluído com sucesso!"); // Usando a função de mensagem
    }
}

// -------------------- FUNÇÃO PARA PREENCHER O FORMULÁRIO DE EDIÇÃO --------------------

function editarUser(index) {
    const user = users[index]; // Obtém os dados do usuário pelo índice
    editNomeInput.value = user.name; // Preenche o campo de nome com os dados atuais
    editEmailInput.value = user.email; // Preenche o campo de email com os dados atuais
    editIndexInput.value = index; // Armazena o índice do usuário no campo oculto
    editForm.style.display = "flex"; // Exibe o formulário de edição
}

// -------------------- EVENTO DE ENVIO DO FORMULÁRIO DE EDIÇÃO --------------------

editForm.addEventListener("submit", function(e) {
    e.preventDefault(); // Impede o comportamento padrão do formulário

    const nome = editNomeInput.value.trim(); // Pega o novo nome digitado e remove espaços em branco
    const email = editEmailInput.value.trim(); // Pega o novo email digitado e remove espaços em branco
    const index = parseInt(editIndexInput.value); // Converte o índice para número

    // Utiliza a função de validação para verificar os campos
    if (validarFormulario(nome, email, "edicao", index)) {
        if (index >= 0 && index < users.length) { // Verifica se o índice é válido
            users[index] = { name: nome, email: email }; // Atualiza os dados do usuário
            localStorage.setItem("users", JSON.stringify(users)); // Salva as alterações no localStorage
            renderUserTable(); // Re-renderiza a tabela
            exibirMensagem("Atualização realizada com sucesso!"); // Usando a função de mensagem
        } else {
            exibirMensagem("Erro ao atualizar usuário.", "erro"); // Mensagem de erro, se o índice for inválido
        }
        this.style.display = "none"; // Oculta o formulário de edição
        editingIndex = null; // Limpa o índice de edição
    }
});

// -------------------- EVENTO DE ENVIO DO FORMULÁRIO DE CADASTRO --------------------

userForm.addEventListener("submit", function(e) {
    e.preventDefault(); // Impede o envio padrão do formulário

    const nome = nameInput.value.trim(); // Pega o nome digitado no formulário e remove espaços em branco
    const email = emailInput.value.trim(); // Pega o email digitado no formulário e remove espaços em branco

    // Utiliza a função de validação para verificar os campos
    if (validarFormulario(nome, email, "cadastro")) {
        const newUser = { name: nome, email: email }; // Cria um objeto com os dados do novo usuário
        users.push(newUser); // Adiciona o novo usuário na lista
        localStorage.setItem("users", JSON.stringify(users)); // Salva a nova lista no localStorage
        this.reset(); // Limpa os campos do formulário
        renderUserTable(); // Atualiza a tabela com o novo usuário
        editForm.style.display = "none"; // Garante que o formulário de edição esteja oculto
        editingIndex = null; // Reseta o índice de edição
        exibirMensagem("Cadastro realizado com sucesso!"); // Usando a função de mensagem
    }
});

// -------------------- INICIALIZAÇÃO AO CARREGAR A PÁGINA --------------------

document.addEventListener('DOMContentLoaded', renderUserTable); // Quando o DOM estiver carregado, renderiza a tabela de usuários

