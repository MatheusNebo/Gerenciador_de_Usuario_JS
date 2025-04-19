// form_register.js

// -------------------- CARREGAMENTO INICIAL E VARIÁVEIS GLOBAIS --------------------

let users = JSON.parse(localStorage.getItem("users")) || [];
const userForm = document.getElementById("userForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const dataTableBody = document.querySelector("#data_table tbody");
const editForm = document.getElementById("editForm");
const editNomeInput = document.getElementById("editNome");
const editEmailInput = document.getElementById("editEmail");
const editIndexInput = document.getElementById("editIndex");

let editingIndex = null;

// -------------------- FUNÇÃO PARA RENDERIZAR A TABELA DE USUÁRIOS --------------------

function renderUserTable() {
    if (!dataTableBody) {
        console.error("Elemento tbody da tabela não encontrado!");
        return;
    }
    dataTableBody.innerHTML = "";

    users.forEach((user, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>Nome:</strong> ${user.name}</td>
            <td><strong>Email:</strong> ${user.email}</td>
            <td>
                <button onclick="editarUser(${index})">Editar</button>
                <button onclick="excluirUser(${index})">Excluir</button>
            </td>
        `;
        dataTableBody.appendChild(row);
    });
}

// -------------------- FUNÇÃO PARA EXCLUIR UM USUÁRIO --------------------

function excluirUser(index) {
    if (confirm("Deseja realmente excluir este usuário?")) {
        users.splice(index, 1);
        localStorage.setItem("users", JSON.stringify(users));
        renderUserTable();
    }
}

// -------------------- FUNÇÃO PARA PREENCHER O FORMULÁRIO DE EDIÇÃO --------------------

function editarUser(index) {
    const user = users[index];
    editNomeInput.value = user.name;
    editEmailInput.value = user.email;
    editIndexInput.value = index;
    editForm.style.display = "flex";
}

// -------------------- EVENTO DE ENVIO DO FORMULÁRIO DE EDIÇÃO --------------------

editForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const nome = editNomeInput.value;
    const email = editEmailInput.value;
    const index = parseInt(editIndexInput.value);

    if (index >= 0 && index < users.length) {
        users[index] = { name: nome, email: email };
        localStorage.setItem("users", JSON.stringify(users));
        renderUserTable();
    }
    this.style.display = "none";
    editingIndex = null;
});

// -------------------- EVENTO DE ENVIO DO FORMULÁRIO DE CADASTRO --------------------

userForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const nome = nameInput.value;
    const email = emailInput.value;
    const newUser = { name: nome, email: email };

    const msg = document.getElementById("mensagem");
    msg.textContent = "Cadastro realizado com sucesso!";
    msg.classList.remove("fadeOut");
    msg.style.display = "block";
    msg.style.animation = "fadeIn 0.5s ease-out forwards";

    setTimeout(() => {
        msg.style.animation = "fadeOut 0.5s ease-in forwards";
    }, 3000);

    setTimeout(() => {
        msg.style.display = "none";
    }, 3500);

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    this.reset();
    renderUserTable();
    editForm.style.display = "none";
    editingIndex = null;
});

// -------------------- INICIALIZAÇÃO AO CARREGAR A PÁGINA --------------------

document.addEventListener('DOMContentLoaded', renderUserTable);