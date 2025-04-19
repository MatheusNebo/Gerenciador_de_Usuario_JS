// form_register.js

// -------------------- CARREGAMENTO INICIAL E VARIÁVEIS GLOBAIS --------------------

// Tenta recuperar os dados da lista de usuários armazenados localmente no navegador (localStorage).
// Se não houver dados salvos (getItem retorna null), inicializa 'users' com um array vazio.
let users = JSON.parse(localStorage.getItem("users")) || [];

// Pega referências aos elementos HTML que serão manipulados pelo script.
const userForm = document.getElementById("userForm");       // Formulário principal de cadastro.
const nameInput = document.getElementById("name");         // Campo de entrada para o nome.
const emailInput = document.getElementById("email");       // Campo de entrada para o email.
const dataTableBody = document.querySelector("#data_table tbody"); // Corpo da tabela onde os usuários serão exibidos.
const editForm = document.getElementById("editForm");       // Formulário de edição (inicialmente escondido).
const editNomeInput = document.getElementById("editNome");   // Campo de entrada para editar o nome.
const editEmailInput = document.getElementById("editEmail"); // Campo de entrada para editar o email.
const editIndexInput = document.getElementById("editIndex"); // Campo oculto para armazenar o índice do usuário sendo editado.

let editingIndex = null; // Variável para rastrear o índice do usuário que está sendo editado.
                         // Se for null, significa que nenhum usuário está em modo de edição.

// -------------------- FUNÇÃO PARA RENDERIZAR A TABELA DE USUÁRIOS --------------------

function renderUserTable() {
    // Verifica se o corpo da tabela foi encontrado no HTML. Se não, exibe um erro no console e interrompe a função.
    if (!dataTableBody) {
        console.error("Elemento tbody da tabela não encontrado!");
        return;
    }
    dataTableBody.innerHTML = ""; // Limpa o conteúdo atual da tabela antes de renderizar novamente.

    // Itera sobre cada objeto 'user' no array 'users' e também obtém o seu índice.
    users.forEach((user, index) => {
        const row = document.createElement("tr"); // Cria uma nova linha 'tr' para cada usuário.
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <button onclick="editarUser(${index})">Editar</button>
                <button onclick="excluirUser(${index})">Excluir</button>
            </td>
        `; // Define o conteúdo HTML da linha, incluindo as células de nome, email e os botões de editar e excluir.
           // A função 'onclick' dos botões chama as funções 'editarUser' e 'excluirUser' passando o índice do usuário.
        dataTableBody.appendChild(row); // Adiciona a linha criada ao corpo da tabela.
    });
}

// -------------------- FUNÇÃO PARA EXCLUIR UM USUÁRIO --------------------

function excluirUser(index) {
    // Exibe uma caixa de confirmação para garantir que o usuário realmente deseja excluir.
    if (confirm("Deseja realmente excluir este usuário?")) {
        users.splice(index, 1); // Remove 1 elemento do array 'users' a partir do índice fornecido.
        localStorage.setItem("users", JSON.stringify(users)); // Atualiza os dados no localStorage após a exclusão.
        renderUserTable(); // Renderiza a tabela novamente para refletir a exclusão.
    }
}

// -------------------- FUNÇÃO PARA PREENCHER O FORMULÁRIO DE EDIÇÃO --------------------

function editarUser(index) {
    const user = users[index]; // Obtém o objeto 'user' do array 'users' com o índice fornecido.
    editNomeInput.value = user.name;   // Preenche o campo de nome do formulário de edição.
    editEmailInput.value = user.email;  // Preenche o campo de email do formulário de edição.
    editIndexInput.value = index;      // Define o valor do campo oculto 'editIndex' com o índice do usuário sendo editado.
    editForm.style.display = "flex";   // Exibe o formulário de edição tornando sua propriedade 'display' flex.
}

// -------------------- EVENTO DE ENVIO DO FORMULÁRIO DE EDIÇÃO --------------------

editForm.addEventListener("submit", function(e) {
    e.preventDefault(); // Impede o comportamento padrão de envio do formulário (recarregar a página).

    const nome = editNomeInput.value;   // Obtém o valor do campo de nome do formulário de edição.
    const email = editEmailInput.value;  // Obtém o valor do campo de email do formulário de edição.
    const index = parseInt(editIndexInput.value); // Obtém o índice do usuário a ser editado do campo oculto e converte para número inteiro.

    // Verifica se o índice é válido dentro dos limites do array 'users'.
    if (index >= 0 && index < users.length) {
        users[index] = { name: nome, email: email }; // Atualiza o objeto 'user' no array 'users' com os novos valores.
        localStorage.setItem("users", JSON.stringify(users)); // Atualiza os dados no localStorage após a edição.
        renderUserTable(); // Renderiza a tabela novamente para refletir a edição.
    }
    this.style.display = "none"; // Esconde o formulário de edição novamente.
    editingIndex = null;         // Reseta a variável 'editingIndex' indicando que nenhum usuário está mais em edição.
});

// -------------------- EVENTO DE ENVIO DO FORMULÁRIO DE CADASTRO --------------------

userForm.addEventListener("submit", function(e) {
    e.preventDefault(); // Impede o comportamento padrão de envio do formulário (recarregar a página).

    const nome = nameInput.value;   // Obtém o valor do campo de nome do formulário de cadastro.
    const email = emailInput.value;  // Obtém o valor do campo de email do formulário de cadastro.
    const newUser = { name: nome, email: email }; // Cria um novo objeto 'user' com os valores do formulário.

    // Exibe uma mensagem de sucesso ao cadastrar.
    const msg = document.getElementById("mensagem");
    msg.textContent = "Cadastro realizado com sucesso!";
    msg.classList.remove("fadeOut");
    msg.style.display = "block";
    msg.style.animation = "fadeIn 0.5s ease-out forwards";

    // Inicia um temporizador para aplicar o efeito de fade-out na mensagem após 3 segundos.
    setTimeout(() => {
        msg.style.animation = "fadeOut 0.5s ease-in forwards";
    }, 3000);

    // Inicia outro temporizador para ocultar completamente a mensagem após 3.5 segundos.
    setTimeout(() => {
        msg.style.display = "none";
    }, 3500);

    users.push(newUser); // Adiciona o novo objeto 'user' ao final do array 'users'.
    localStorage.setItem("users", JSON.stringify(users)); // Atualiza os dados no localStorage após o cadastro.
    this.reset(); // Limpa os campos do formulário de cadastro.
    renderUserTable(); // Renderiza a tabela novamente para exibir o novo usuário.
    editForm.style.display = "none"; // Garante que o formulário de edição esteja escondido após um novo cadastro.
    editingIndex = null;         // Reseta a variável 'editingIndex' após um novo cadastro.
});

// -------------------- INICIALIZAÇÃO AO CARREGAR A PÁGINA --------------------

// Adiciona um listener para o evento 'DOMContentLoaded', que é disparado quando o documento HTML é completamente carregado e analisado.
document.addEventListener('DOMContentLoaded', renderUserTable);
// Chama a função 'renderUserTable' para exibir os usuários que já estavam salvos no localStorage assim que a página carrega.