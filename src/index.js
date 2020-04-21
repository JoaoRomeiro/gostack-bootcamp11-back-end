const express = require('express');
const cors = require('cors');
const { uuid, isUuid } = require('uuidv4');

const app = express();

/**
 * Essa configuração do cors permite que qualquer front-end acesse o back-end,
 * isso para o ambiente de desenvolvimento é mais do que suficiente, porem para
 * produção é muito arriscado e no decorrer do curso veremos como deixar essa conexao
 * segura  
 */ 
app.use(cors()); 
app.use(express.json());

const projects = [];

function loggedRequests(request, response, next) {
    const { method, url } = request;

    const logLabel = `[${method.toUpperCase()}] ${url}`;

    console.time(logLabel);

    next();

    console.timeEnd(logLabel);
}

function validateProjectId(request, response, next) {
    const { id } = request.params;

    if (!isUuid(id)) {
        return response.status(400).json({"message": "Invalid Project id"});
    }

    return next();
}

app.use(loggedRequests);
app.use('/projects/:id', validateProjectId);

app.get('/projects', (request, response) => {
    const { title } = request.query;

    const results = title ? projects.filter(project => project.title.includes(title)) : projects;

    return response.json(results);
});

app.post('/projects', (request, response) => {
    const { title, owner } = request.body;
    const project = { id: uuid(), title, owner };

    projects.push(project);

    return response.json(project);
});

app.put('/projects/:id', (request, response) => {
    const { id } = request.params;
    const { title, owner } = request.body;

    // Pesquisa o projeto no array de projetos
    const projectIndex = projects.findIndex(project => project.id === id);

    // Verifica se o projeto foi encontrado
    if (projectIndex < 0) {
        return response.status(400).json({ "menssage": "Project not found" });
    }

    const project = {
        id,
        title,
        owner,
    }

    projects[projectIndex] = project;

    return response.json(project);
});

app.patch('/projects/:id', (request, response) => {
    return response.json({ "message": `Nome do projeto ${request.params.id} editado com sucesso!` });
});

app.delete('/projects/:id', (request, response) => {
    const { id } = request.params;

    const projectIndex = projects.findIndex(project => project.id == id);

    if (projectIndex < 0) {
        return response.status(400).json({ "message": "Project not found" });
    }

    projects.splice(projectIndex, 1);

    return response.status(204).json({ "message": "" });
});

app.listen(3333, () => {
    console.log("🚀 Back-end started!");
});