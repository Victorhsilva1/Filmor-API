const CHAVE_API_OMDB = '460719d3';
const URL_API_OMDB = `https://www.omdbapi.com/?apikey=${CHAVE_API_OMDB}&`;

const inputBusca = document.getElementById('busca-filme');
const btnBuscar = document.getElementById('btn-buscar');
const gridFilmes = document.getElementById('grid-filmes');
const detalhesFilme = document.getElementById('detalhes-filme');
const mensagemErro = document.getElementById('mensagem-erro');
const logo = document.querySelector('.logo');

let filmesSelecionado = null;
let cardAtivoAtual = null;

function buscaValida(busca) {
    return busca.trim().length > 0;
}

function limparMensagemErro() {
    mensagemErro.textContent = '';
    mensagemErro.classList.remove('ativo');
}

function exibirErro(mensagem) {
    mensagemErro.textContent = mensagem;
    mensagemErro.classList.add('ativo');
}

function limparGridFilmes() {
    gridFilmes.innerHTML = '';
}

function limparDetalhesFilme() {
    detalhesFilme.innerHTML = '';
    detalhesFilme.classList.add('vazio');
    filmesSelecionado = null;
}

async function buscarFilmesAPI(nomeFilme) {
    const url = `${URL_API_OMDB}s=${encodeURIComponent(nomeFilme)}&type=movie`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        return data;
    } catch (erro) {
        console.error('Erro ao buscar filmes:', erro);
        throw new Error('Erro ao conectar com a API. Tente novamente.');
    }
}

async function buscarDetalhesFilme(imdbID) {
    const url = `${URL_API_OMDB}i=${imdbID}&plot=full`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        return data;
    } catch (erro) {
        console.error('Erro ao buscar detalhes:', erro);
    }
}

function criarCardFilme(filme) {
    const card = document.createElement('div');
    card.className = 'filme-card';
    card.dataset.imdbid = filme.imdbID;
    
    const poster = document.createElement('img');
    poster.className = 'filme-poster';
    poster.src = filme.Poster !== 'N/A' ? filme.Poster : 'https://via.placeholder.com/150x220?text=Sem+Poster';
    poster.alt = filme.Title;
    poster.onerror = function() {
        this.src = 'https://via.placeholder.com/150x220?text=Sem+Poster';
    };
    
    card.appendChild(poster);
    
    card.addEventListener('click', function() {
        selecionarFilme(filme.imdbID, card);
    });
    
    return card;
}

function renderizarGridFilmes(filmes) {
    limparGridFilmes();
    
    if (!filmes || filmes.length === 0) {
        gridFilmes.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #B0B0B0;">Nenhum filme encontrado.</p>';
        return;
    }
    
    filmes.forEach(function(filme) {
        const card = criarCardFilme(filme);
        gridFilmes.appendChild(card);
    });
}

function renderizarDetalhesFilme(filme) {
    detalhesFilme.classList.remove('vazio');

    const posterSrc = filme.Poster !== 'N/A' ? filme.Poster : 'https://via.placeholder.com/120x180?text=Sem+Poster';

    const htmlPartes = [
        `<div class="detalhes-header">
            <img src="${posterSrc}" alt="${filme.Title}" class="detalhes-poster" onerror="this.src='${posterSrc}'">
            <div class="detalhes-info-basica">
                <h2 class="detalhes-titulo">${filme.Title}</h2>
                <p class="detalhes-ano">${filme.Year}</p>
                <p class="detalhes-genero">${filme.Genre !== 'N/A' ? filme.Genre : 'Gênero não informado'}</p>
            </div>
        </div>`,

        `<div class="detalhes-secao">
            <h3 class="detalhes-secao-titulo">Sinopse</h3>
            <p class="detalhes-sinopse">${filme.Plot !== 'N/A' ? filme.Plot : 'Sinopse não disponível.'}</p>
        </div>`,

        `<div class="detalhes-metadata">
            <div class="metadata-item">
                <div class="metadata-label">Duração</div>
                <div class="metadata-valor">${filme.Runtime !== 'N/A' ? filme.Runtime : 'N/A'}</div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Lançamento</div>
                <div class="metadata-valor">${filme.Released !== 'N/A' ? filme.Released : 'N/A'}</div>
            </div>
        </div>`
    ];

    detalhesFilme.innerHTML = htmlPartes.join('');
}

async function selecionarFilme(imdbID, cardElement) {
    try {
        if (cardAtivoAtual) {
            cardAtivoAtual.classList.remove('ativo');
        }
        
        cardElement.classList.add('ativo');
        cardAtivoAtual = cardElement;
        
        limparMensagemErro();
        
        const detalhes = await buscarDetalhesFilme(imdbID);
        
        if (detalhes.Response === 'False') {
            exibirErro('Não foi possível carregar os detalhes do filme.');
            return;
        }
        
        filmesSelecionado = detalhes;
        renderizarDetalhesFilme(detalhes);

        detalhesFilme.scrollIntoView({
            behavior: 'smooth'
        });
        
    } catch (erro) {
        exibirErro(erro.message);
        console.error('Erro ao selecionar filme:', erro);
    }
}

async function realizarBusca(evento) {
    if (evento) {
        evento.preventDefault();
    }
    
    const busca = inputBusca.value.trim();
    
    if (!buscaValida(busca)) {
        exibirErro('Por favor, digite o nome de um filme.');
        return;
    }
    
    try {
        limparMensagemErro();
        limparDetalhesFilme();
        
        const resultados = await buscarFilmesAPI(busca);
        
        if (resultados.Response === 'False') {
            exibirErro('Nenhum filme encontrado. Tente outra busca.');
            limparGridFilmes();
            return;
        }
        
        renderizarGridFilmes(resultados.Search);
        
    } catch (erro) {
        exibirErro(erro.message);
        console.error('Erro na busca:', erro);
    }
}
 
btnBuscar.addEventListener('click', function(evento) {
    realizarBusca(evento);
});

inputBusca.addEventListener('keypress', function(evento) {
    if (evento.key === 'Enter') {
        realizarBusca();
    }
});

inputBusca.addEventListener('input', function() {
    limparMensagemErro();
});

logo.addEventListener('click', function() {
    window.location.reload();
});
