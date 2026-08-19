// ==================================================
// AXIS Present
// Models - script.js
// ==================================================


// ==================================================
// 1. CONFIGURAÇÃO
// ==================================================

const MODELS_CONFIG = {

    editionPath: '../Edition/index.html',

    storageKey: 'axis-present-selected-model',

    presentationKey: 'axis-present-presentation',

    toastDuration: 2600

};


// ==================================================
// 2. MODELOS DISPONÍVEIS
// ==================================================

const MODELS = {

    'business-modern': {

        id: 'business-modern',

        name: 'Business Modern',

        category: 'business',

        description:
            'Estrutura moderna para apresentações profissionais.',

        theme: 'business',

        background: '#ffffff',

        accent: '#f28c28',

        layout: 'business'

    },


    'minimal-light': {

        id: 'minimal-light',

        name: 'Minimal Light',

        category: 'minimal',

        description:
            'Uma estrutura limpa para conteúdo objetivo.',

        theme: 'minimal',

        background: '#ffffff',

        accent: '#f28c28',

        layout: 'minimal'

    },


    'creative-orange': {

        id: 'creative-orange',

        name: 'Creative Orange',

        category: 'creative',

        description:
            'Visual marcante para apresentações criativas.',

        theme: 'creative',

        background: '#ffffff',

        accent: '#f28c28',

        layout: 'creative'

    },


    'education-focus': {

        id: 'education-focus',

        name: 'Education Focus',

        category: 'education',

        description:
            'Estrutura organizada para conteúdo educacional.',

        theme: 'education',

        background: '#ffffff',

        accent: '#f28c28',

        layout: 'education'

    },


    'portfolio-studio': {

        id: 'portfolio-studio',

        name: 'Portfolio Studio',

        category: 'portfolio',

        description:
            'Apresente projetos, trabalhos e resultados.',

        theme: 'portfolio',

        background: '#ffffff',

        accent: '#f28c28',

        layout: 'portfolio'

    },


    'presentation-core': {

        id: 'presentation-core',

        name: 'Presentation Core',

        category: 'presentation',

        description:
            'Um ponto de partida versátil para apresentações.',

        theme: 'core',

        background: '#ffffff',

        accent: '#f28c28',

        layout: 'presentation'

    }

};


// ==================================================
// 3. ESTADO
// ==================================================

const modelsState = {

    activeCategory: 'all',

    searchTerm: '',

    sort: 'recommended',

    selectedModel: null,

    modalModel: null,

    toastTimer: null

};


// ==================================================
// 4. ELEMENTOS
// ==================================================

const elements = {

    searchInput:
        document.querySelector(
            '[data-element="model-search"]'
        ),

    sortSelect:
        document.querySelector(
            '[data-element="model-sort"]'
        ),

    modelsGrid:
        document.querySelector(
            '[data-element="models-grid"]'
        ),

    emptyState:
        document.querySelector(
            '[data-element="models-empty"]'
        ),

    resultsTitle:
        document.querySelector(
            '[data-element="results-title"]'
        ),

    categoryButtons:
        document.querySelectorAll(
            '[data-category]'
        ),

    categoryCounts:
        document.querySelectorAll(
            '[data-category-count]'
        ),

    modelCards:
        document.querySelectorAll(
            '.model-card'
        ),

    modal:
        document.querySelector(
            '[data-element="model-modal"]'
        ),

    modalTitle:
        document.querySelector(
            '[data-element="modal-title"]'
        ),

    modalPreview:
        document.querySelector(
            '[data-element="modal-preview"]'
        ),

    modalUseButton:
        document.querySelector(
            '[data-action="use-preview-model"]'
        ),

    toast:
        document.querySelector(
            '[data-element="toast"]'
        ),

    toastMessage:
        document.querySelector(
            '[data-element="toast-message"]'
        )

};


// ==================================================
// 5. UTILITÁRIOS
// ==================================================

function getModel(modelId) {

    return MODELS[modelId] || null;

}


function getAllModels() {

    return Object.values(MODELS);

}


function normalizeText(value) {

    return String(value || '')
        .normalize('NFD')
        .replace(
            /[\u0300-\u036f]/g,
            ''
        )
        .toLowerCase()
        .trim();

}


function escapeHTML(value) {

    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

}


// ==================================================
// 6. FILTRAGEM
// ==================================================

function getFilteredModels() {

    let models =
        getAllModels();


    // ----------------------------------------------
    // Categoria
    // ----------------------------------------------

    if (
        modelsState.activeCategory !== 'all'
    ) {

        models =
            models.filter(
                (model) =>
                    model.category ===
                    modelsState.activeCategory
            );

    }


    // ----------------------------------------------
    // Pesquisa
    // ----------------------------------------------

    if (
        modelsState.searchTerm
    ) {

        const search =
            normalizeText(
                modelsState.searchTerm
            );

        models =
            models.filter(
                (model) => {

                    const searchable =
                        normalizeText(
                            `${model.name}
                             ${model.description}
                             ${model.category}`
                        );

                    return searchable.includes(
                        search
                    );

                }
            );

    }


    // ----------------------------------------------
    // Ordenação
    // ----------------------------------------------

    if (
        modelsState.sort === 'name'
    ) {

        models.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name,
                    'pt-BR'
                )
        );

    }

    else if (
        modelsState.sort === 'recent'
    ) {

        /*
         * A biblioteca atual não possui
         * uma propriedade de data.
         *
         * Por isso, mantém a ordem original.
         */

        models = [...models];

    }


    return models;

}


// ==================================================
// 7. ATUALIZAÇÃO DOS CARDS
// ==================================================

function updateModelCards() {

    const visibleModels =
        getFilteredModels();

    const visibleIds =
        new Set(
            visibleModels.map(
                (model) => model.id
            )
        );


    elements.modelCards.forEach(
        (card) => {

            const modelId =
                card.dataset.modelId;

            const visible =
                visibleIds.has(
                    modelId
                );

            card.hidden =
                !visible;

            card.classList.toggle(
                'is-selected',
                modelsState.selectedModel ===
                    modelId
            );

        }
    );


    updateEmptyState(
        visibleModels.length
    );

    updateResultsTitle(
        visibleModels.length
    );

}


// ==================================================
// 8. ESTADO VAZIO
// ==================================================

function updateEmptyState(count) {

    if (!elements.emptyState) {
        return;
    }

    elements.emptyState.hidden =
        count !== 0;

}


// ==================================================
// 9. TÍTULO DOS RESULTADOS
// ==================================================

function updateResultsTitle(count) {

    if (!elements.resultsTitle) {
        return;
    }


    if (
        modelsState.searchTerm
    ) {

        elements.resultsTitle.textContent =
            `${count} resultado${count === 1 ? '' : 's'}`;

        return;

    }


    const categoryNames = {

        all: 'Todos os modelos',

        business: 'Negócios',

        education: 'Educação',

        portfolio: 'Portfólio',

        minimal: 'Minimalista',

        creative: 'Criativo',

        presentation: 'Apresentações'

    };


    elements.resultsTitle.textContent =
        categoryNames[
            modelsState.activeCategory
        ] || 'Modelos';

}


// ==================================================
// 10. CONTADORES DAS CATEGORIAS
// ==================================================

function updateCategoryCounts() {

    const models =
        getAllModels();


    elements.categoryCounts.forEach(
        (counter) => {

            const category =
                counter.dataset.categoryCount;


            if (
                category === 'all'
            ) {

                counter.textContent =
                    models.length;

                return;

            }


            const count =
                models.filter(
                    (model) =>
                        model.category ===
                        category
                ).length;


            counter.textContent =
                count;

        }
    );

}


// ==================================================
// 11. CATEGORIAS
// ==================================================

function setCategory(category) {

    modelsState.activeCategory =
        category;


    document
        .querySelectorAll(
            '.models-category'
        )
        .forEach(
            (button) => {

                button.classList.toggle(
                    'models-category--active',
                    button.dataset.category ===
                        category
                );

            }
        );


    updateModelCards();

}


// ==================================================
// 12. PESQUISA
// ==================================================

function searchModels(value) {

    modelsState.searchTerm =
        value.trim();


    updateModelCards();

}


function clearSearch() {

    modelsState.searchTerm =
        '';


    if (elements.searchInput) {

        elements.searchInput.value =
            '';

    }


    updateModelCards();


    if (
        elements.searchInput
    ) {

        elements.searchInput.focus();

    }

}


// ==================================================
// 13. ORDENAÇÃO
// ==================================================

function changeSort(value) {

    modelsState.sort =
        value;


    updateModelCards();

}


// ==================================================
// 14. SELEÇÃO DE MODELO
// ==================================================

function selectModel(modelId) {

    const model =
        getModel(modelId);

    if (!model) {
        return;
    }


    modelsState.selectedModel =
        model.id;


    updateModelCards();

}


// ==================================================
// 15. PREVIEW
// ==================================================

function previewModel(modelId) {

    const model =
        getModel(modelId);

    if (!model) {
        return;
    }


    modelsState.modalModel =
        model.id;


    selectModel(
        model.id
    );


    if (
        elements.modalTitle
    ) {

        elements.modalTitle.textContent =
            model.name;

    }


    if (
        elements.modalPreview
    ) {

        elements.modalPreview.innerHTML =
            createPreviewHTML(
                model
            );

    }


    if (
        elements.modalUseButton
    ) {

        elements.modalUseButton.dataset.modelId =
            model.id;

    }


    if (
        elements.modal
    ) {

        elements.modal.hidden =
            false;

        document.body.classList.add(
            'modal-open'
        );

    }

}


function createPreviewHTML(model) {

    return `

        <div
            class="
                model-preview
                model-preview--${escapeHTML(model.theme)}
            "
            style="
                --model-accent:
                ${escapeHTML(model.accent)};
            "
        >

            <div class="model-preview__content">

                <span class="model-preview__small">
                    AXIS PRESENT
                </span>

                <strong>
                    ${escapeHTML(model.name)}
                </strong>

                <span class="model-preview__line"></span>

                <span class="model-preview__caption">
                    ${escapeHTML(model.description)}
                </span>

            </div>

        </div>

    `;

}


// ==================================================
// 16. FECHAR PREVIEW
// ==================================================

function closePreview() {

    if (
        !elements.modal
    ) {
        return;
    }


    elements.modal.hidden =
        true;


    document.body.classList.remove(
        'modal-open'
    );


    modelsState.modalModel =
        null;

}


// ==================================================
// 17. USAR MODELO
// ==================================================

function useModel(modelId) {

    const model =
        getModel(modelId);

    if (!model) {
        return;
    }


    modelsState.selectedModel =
        model.id;


    saveSelectedModel(
        model
    );


    showToast(
        `Modelo "${model.name}" selecionado.`
    );


    /*
     * Pequeno intervalo para o usuário
     * perceber a confirmação antes
     * da navegação.
     */

    setTimeout(
        () => {

            openEdition(
                model
            );

        },
        250
    );

}


// ==================================================
// 18. USAR MODELO DO MODAL
// ==================================================

function usePreviewModel() {

    const modelId =
        elements.modalUseButton
            ?.dataset
            .modelId;


    if (!modelId) {
        return;
    }


    closePreview();

    useModel(
        modelId
    );

}


// ==================================================
// 19. SALVAR MODELO
// ==================================================

function saveSelectedModel(model) {

    const payload = {

        modelId: model.id,

        model: model,

        selectedAt:
            new Date().toISOString()

    };


    sessionStorage.setItem(

        MODELS_CONFIG.storageKey,

        JSON.stringify(
            payload
        )

    );

}


// ==================================================
// 20. ABRIR EDITION
// ==================================================

function openEdition(model) {

    const url =
        MODELS_CONFIG.editionPath;


    window.location.href =
        url;

}


// ==================================================
// 21. NOVA APRESENTAÇÃO
// ==================================================

function createPresentation() {

    sessionStorage.removeItem(
        MODELS_CONFIG.storageKey
    );


    const presentation = {

        id:
            `presentation-${Date.now()}`,

        name:
            'Apresentação sem título',

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString(),

        settings: {

            width: 1280,

            height: 720,

            theme: 'default',

            background: '#ffffff'

        },

        slides: []

    };


    sessionStorage.setItem(

        MODELS_CONFIG.presentationKey,

        JSON.stringify(
            presentation
        )

    );


    window.location.href =
        MODELS_CONFIG.editionPath;

}


// ==================================================
// 22. ABRIR APRESENTAÇÃO
// ==================================================

function openPresentation() {

    /*
     * A arquitetura de arquivos/importação
     * ainda não está definida no HTML atual.
     *
     * Por enquanto, direciona para Edition.
     */

    window.location.href =
        MODELS_CONFIG.editionPath;

}


// ==================================================
// 23. TOAST
// ==================================================

function showToast(message) {

    if (
        !elements.toast ||
        !elements.toastMessage
    ) {
        return;
    }


    clearTimeout(
        modelsState.toastTimer
    );


    elements.toastMessage.textContent =
        message;


    elements.toast.hidden =
        false;


    requestAnimationFrame(
        () => {

            elements.toast.classList.add(
                'is-visible'
            );

        }
    );


    modelsState.toastTimer =
        setTimeout(
            () => {

                elements.toast.classList.remove(
                    'is-visible'
                );


                setTimeout(
                    () => {

                        elements.toast.hidden =
                            true;

                    },
                    200
                );

            },
            MODELS_CONFIG.toastDuration
        );

}


// ==================================================
// 24. AÇÕES
// ==================================================

function handleAction(action, element) {

    switch (action) {


        // --------------------------------------------
        // Pesquisa
        // --------------------------------------------

        case 'clear-search':

            clearSearch();

            break;


        // --------------------------------------------
        // Preview
        // --------------------------------------------

        case 'preview-model':

            previewModel(
                element.dataset.modelId
            );

            break;


        case 'close-preview':

            closePreview();

            break;


        case 'use-preview-model':

            usePreviewModel();

            break;


        // --------------------------------------------
        // Modelo
        // --------------------------------------------

        case 'use-model':

            useModel(
                element.dataset.modelId
            );

            break;


        // --------------------------------------------
        // Apresentação
        // --------------------------------------------

        case 'create-presentation':

            createPresentation();

            break;


        case 'open-presentation':

            openPresentation();

            break;


        default:

            console.info(
                `Ação não implementada: ${action}`
            );

            break;

    }

}


// ==================================================
// 25. EVENTOS DE AÇÃO
// ==================================================

function setupActionEvents() {

    document.addEventListener(
        'click',
        (event) => {

            const actionElement =
                event.target.closest(
                    '[data-action]'
                );


            if (!actionElement) {
                return;
            }


            handleAction(

                actionElement.dataset.action,

                actionElement

            );

        }
    );

}


// ==================================================
// 26. EVENTOS DE CATEGORIA
// ==================================================

function setupCategoryEvents() {

    document
        .querySelectorAll(
            '.models-category'
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    'click',
                    () => {

                        setCategory(
                            button.dataset.category
                        );

                    }
                );

            }
        );

}


// ==================================================
// 27. EVENTOS DE PESQUISA
// ==================================================

function setupSearchEvents() {

    if (
        !elements.searchInput
    ) {
        return;
    }


    elements.searchInput.addEventListener(
        'input',
        (event) => {

            searchModels(
                event.target.value
            );

        }
    );


    elements.searchInput.addEventListener(
        'keydown',
        (event) => {

            if (
                event.key === 'Escape'
            ) {

                clearSearch();

            }

        }
    );

}


// ==================================================
// 28. EVENTOS DE ORDENAÇÃO
// ==================================================

function setupSortEvents() {

    if (
        !elements.sortSelect
    ) {
        return;
    }


    elements.sortSelect.addEventListener(
        'change',
        (event) => {

            changeSort(
                event.target.value
            );

        }
    );

}


// ==================================================
// 29. SELEÇÃO PELO CARD
// ==================================================

function setupCardEvents() {

    elements.modelCards.forEach(
        (card) => {

            card.addEventListener(
                'click',
                (event) => {

                    /*
                     * Não seleciona novamente
                     * quando o clique já foi em
                     * um botão de ação.
                     */

                    if (
                        event.target.closest(
                            '[data-action]'
                        )
                    ) {
                        return;
                    }


                    selectModel(
                        card.dataset.modelId
                    );

                }
            );

        }
    );

}


// ==================================================
// 30. TECLADO
// ==================================================

function setupKeyboardEvents() {

    document.addEventListener(
        'keydown',
        (event) => {

            if (
                event.key === 'Escape'
            ) {

                if (
                    elements.modal &&
                    !elements.modal.hidden
                ) {

                    closePreview();

                }

            }

        }
    );

}


// ==================================================
// 31. FECHAR MODAL CLICANDO FORA
// ==================================================

function setupModalEvents() {

    if (
        !elements.modal
    ) {
        return;
    }


    elements.modal.addEventListener(
        'click',
        (event) => {

            if (
                event.target ===
                elements.modal
            ) {

                closePreview();

            }

        }
    );

}


// ==================================================
// 32. RENDERIZAÇÃO INICIAL
// ==================================================

function initializeModels() {

    updateCategoryCounts();

    updateModelCards();

    setupActionEvents();

    setupCategoryEvents();

    setupSearchEvents();

    setupSortEvents();

    setupCardEvents();

    setupKeyboardEvents();

    setupModalEvents();

}


// ==================================================
// 33. START
// ==================================================

document.addEventListener(
    'DOMContentLoaded',
    initializeModels
);
