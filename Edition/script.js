// ==================================================
// AXIS Present
// Edition - script.js
// ==================================================


// ==================================================
// 1. CONFIGURAÇÃO
// ==================================================

const EDITION_CONFIG = {

    storageKey: 'axis-present-presentation',

    defaultSlideWidth: 1280,

    defaultSlideHeight: 720,

    defaultZoom: 100

};


// ==================================================
// 2. ESTADO DA APLICAÇÃO
// ==================================================

const editionState = {

    presentation: null,

    currentSlideIndex: 0,

    selectedElement: null,

    editingElement: null,

    activeRibbonTab: 'home',

    currentView: 'normal',

    zoom: EDITION_CONFIG.defaultZoom,

    isDirty: false,

    history: [],

    historyIndex: -1,

    clipboard: null

};


// ==================================================
// 3. ELEMENTOS DA INTERFACE
// ==================================================

const elements = {

    application:
        document.querySelector('.application'),

    ribbonTabs:
        document.querySelectorAll('[data-ribbon-tab]'),

    ribbonPanels:
        document.querySelectorAll('[data-ribbon-panel]'),

    slidesContainer:
        document.querySelector('[data-element="slides"]'),

    canvas:
        document.querySelector('[data-element="canvas"]'),

    slideCounter:
        document.querySelector('[data-element="slide-counter"]'),

    statusSlide:
        document.querySelector('[data-element="status-slide"]'),

    statusWordCount:
        document.querySelector('[data-element="status-word-count"]'),

    zoomRange:
        document.querySelector('[data-element="zoom"]'),

    slideNotes:
        document.querySelector('[data-element="slide-notes"]'),

    selectedElementProperties:
        document.querySelector(
            '[data-element="selected-element-properties"]'
        ),

    fileName:
        document.querySelector('.topbar__file-name'),

    fileStatus:
        document.querySelector('.topbar__file-status'),

    fileInput:
        document.querySelector('#presentation-file-input'),

    workspaceCanvas:
        document.querySelector('.workspace__canvas')

};


// ==================================================
// 4. UTILITÁRIOS
// ==================================================

function generateId(prefix = 'axis') {

    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;

}


function cloneData(data) {

    return JSON.parse(
        JSON.stringify(data)
    );

}


function getCurrentSlide() {

    if (!editionState.presentation) {
        return null;
    }

    return editionState.presentation.slides[
        editionState.currentSlideIndex
    ] || null;

}


function getSelectedElement() {

    const slide = getCurrentSlide();

    if (!slide || !editionState.selectedElement) {
        return null;
    }

    return slide.elements.find(
        element =>
            element.id ===
            editionState.selectedElement
    ) || null;

}


function markAsDirty() {

    editionState.isDirty = true;

    updateFileStatus();

}


function markAsSaved() {

    editionState.isDirty = false;

    updateFileStatus();

}


function updateFileStatus() {

    if (!elements.fileStatus) {
        return;
    }

    elements.fileStatus.textContent =
        editionState.isDirty
            ? 'Alterações não salvas'
            : 'Salvo';

}


function updateFileName() {

    if (!elements.fileName) {
        return;
    }

    elements.fileName.textContent =
        editionState.presentation.name;

}


// ==================================================
// 5. APRESENTAÇÃO
// ==================================================

function createSlide() {

    return {

        id: generateId('slide'),

        layout: 'blank',

        background: '#ffffff',

        elements: [],

        notes: '',

        transition: {
            type: 'none',
            duration: 0
        },

        animations: []

    };

}


function createPresentation() {

    const now =
        new Date().toISOString();

    return {

        id: generateId('presentation'),

        name:
            'Apresentação sem título',

        createdAt: now,

        updatedAt: now,

        settings: {

            width:
                EDITION_CONFIG.defaultSlideWidth,

            height:
                EDITION_CONFIG.defaultSlideHeight,

            theme: 'default',

            background: '#ffffff'

        },

        slides: [
            createSlide()
        ]

    };

}


// ==================================================
// 6. HISTÓRICO
// ==================================================

function saveHistory() {

    if (!editionState.presentation) {
        return;
    }

    const snapshot =
        cloneData(
            editionState.presentation
        );

    editionState.history =
        editionState.history.slice(
            0,
            editionState.historyIndex + 1
        );

    editionState.history.push(
        snapshot
    );

    editionState.historyIndex =
        editionState.history.length - 1;

    if (editionState.history.length > 50) {

        editionState.history.shift();

        editionState.historyIndex--;

    }

}


function undo() {

    if (
        editionState.historyIndex <= 0
    ) {
        return;
    }

    finishTextEditing();

    editionState.historyIndex--;

    editionState.presentation =
        cloneData(
            editionState.history[
                editionState.historyIndex
            ]
        );

    if (
        editionState.currentSlideIndex >=
        editionState.presentation.slides.length
    ) {

        editionState.currentSlideIndex =
            editionState.presentation.slides.length - 1;

    }

    editionState.selectedElement =
        null;

    markAsDirty();

    renderApplication();

}


function redo() {

    if (
        editionState.historyIndex >=
        editionState.history.length - 1
    ) {
        return;
    }

    finishTextEditing();

    editionState.historyIndex++;

    editionState.presentation =
        cloneData(
            editionState.history[
                editionState.historyIndex
            ]
        );

    editionState.selectedElement =
        null;

    markAsDirty();

    renderApplication();

}


// ==================================================
// 7. RIBBON
// ==================================================

function activateRibbonTab(tabName) {

    editionState.activeRibbonTab =
        tabName;

    elements.ribbonTabs.forEach(
        tab => {

            tab.classList.toggle(
                'ribbon__tab--active',
                tab.dataset.ribbonTab === tabName
            );

        }
    );

    elements.ribbonPanels.forEach(
        panel => {

            panel.classList.toggle(
                'ribbon__panel--active',
                panel.dataset.ribbonPanel === tabName
            );

        }
    );

}


function setupRibbon() {

    elements.ribbonTabs.forEach(
        tab => {

            tab.addEventListener(
                'click',
                () => {

                    finishTextEditing();

                    activateRibbonTab(
                        tab.dataset.ribbonTab
                    );

                }
            );

        }
    );

}


// ==================================================
// 8. SLIDES
// ==================================================

function addSlide() {

    finishTextEditing();

    const slide =
        createSlide();

    editionState.presentation.slides.push(
        slide
    );

    editionState.currentSlideIndex =
        editionState.presentation.slides.length - 1;

    editionState.selectedElement =
        null;

    saveHistory();

    markAsDirty();

    renderApplication();

}


function deleteCurrentSlide() {

    finishTextEditing();

    if (
        editionState.presentation.slides.length <= 1
    ) {
        return;
    }

    editionState.presentation.slides.splice(
        editionState.currentSlideIndex,
        1
    );

    if (
        editionState.currentSlideIndex >=
        editionState.presentation.slides.length
    ) {

        editionState.currentSlideIndex--;

    }

    editionState.selectedElement =
        null;

    saveHistory();

    markAsDirty();

    renderApplication();

}


function duplicateCurrentSlide() {

    finishTextEditing();

    const slide =
        getCurrentSlide();

    if (!slide) {
        return;
    }

    const duplicated =
        cloneData(slide);

    duplicated.id =
        generateId('slide');

    duplicated.elements =
        duplicated.elements.map(
            element => ({
                ...element,
                id: generateId('element')
            })
        );

    editionState.presentation.slides.splice(
        editionState.currentSlideIndex + 1,
        0,
        duplicated
    );

    editionState.currentSlideIndex++;

    editionState.selectedElement =
        null;

    saveHistory();

    markAsDirty();

    renderApplication();

}


function selectSlide(index) {

    finishTextEditing();

    if (
        index < 0 ||
        index >= editionState.presentation.slides.length
    ) {
        return;
    }

    editionState.currentSlideIndex =
        index;

    editionState.selectedElement =
        null;

    renderApplication();

}


function previousSlide() {

    selectSlide(
        editionState.currentSlideIndex - 1
    );

}


function nextSlide() {

    selectSlide(
        editionState.currentSlideIndex + 1
    );

}


// ==================================================
// 9. RENDERIZAÇÃO DOS SLIDES
// ==================================================

function renderSlides() {

    if (!elements.slidesContainer) {
        return;
    }

    elements.slidesContainer.innerHTML = '';

    editionState.presentation.slides.forEach(
        (slide, index) => {

            const thumbnail =
                document.createElement('div');

            thumbnail.className =
                'slide-thumbnail';

            thumbnail.classList.toggle(
                'is-active',
                index ===
                editionState.currentSlideIndex
            );

            thumbnail.dataset.slideIndex =
                index;


            const number =
                document.createElement('span');

            number.className =
                'slide-thumbnail__number';

            number.textContent =
                index + 1;


            const content =
                document.createElement('div');

            content.className =
                'slide-thumbnail__content';

            content.style.background =
                slide.background;


            slide.elements.forEach(
                element => {

                    const node =
                        createElementNode(
                            element,
                            true
                        );

                    content.appendChild(
                        node
                    );

                }
            );


            thumbnail.appendChild(
                number
            );

            thumbnail.appendChild(
                content
            );


            thumbnail.addEventListener(
                'click',
                () => selectSlide(index)
            );


            elements.slidesContainer.appendChild(
                thumbnail
            );

        }
    );

}


function renderCanvas() {

    if (!elements.canvas) {
        return;
    }

    elements.canvas.innerHTML = '';

    const slide =
        getCurrentSlide();

    if (!slide) {
        return;
    }


    const slideNode =
        document.createElement('article');

    slideNode.className =
        'slide';

    slideNode.dataset.slideId =
        slide.id;

    slideNode.style.background =
        slide.background;


    const content =
        document.createElement('div');

    content.className =
        'slide__content';

    content.dataset.element =
        'slide-content';


    slide.elements.forEach(
        element => {

            content.appendChild(
                createElementNode(
                    element,
                    false
                )
            );

        }
    );


    slideNode.appendChild(
        content
    );

    elements.canvas.appendChild(
        slideNode
    );

}


// ==================================================
// 10. ELEMENTOS
// ==================================================

function createElementNode(
    element,
    isThumbnail = false
) {

    const node =
        document.createElement('div');

    node.className =
        'slide-element';

    node.dataset.elementId =
        element.id;

    node.dataset.elementType =
        element.type;


    node.style.position =
        'absolute';

    node.style.left =
        `${element.x}%`;

    node.style.top =
        `${element.y}%`;

    node.style.width =
        `${element.width}%`;

    node.style.height =
        `${element.height}%`;

    node.style.fontFamily =
        element.fontFamily || 'Segoe UI';

    node.style.fontSize =
        `${element.fontSize || 24}px`;

    node.style.fontWeight =
        element.bold
            ? '700'
            : '400';

    node.style.fontStyle =
        element.italic
            ? 'italic'
            : 'normal';

    node.style.textDecoration =
        element.underline
            ? 'underline'
            : 'none';

    node.style.color =
        element.color || '#1f1f1f';

    node.style.textAlign =
        element.align || 'left';

    node.style.whiteSpace =
        'pre-wrap';

    node.style.overflow =
        'hidden';


    if (isThumbnail) {

        node.textContent =
            element.content || '';

        node.style.fontSize =
            '8px';

        node.style.pointerEvents =
            'none';

        return node;

    }


    /*
     * Quando estiver editando,
     * o conteúdo será controlado
     * diretamente pelo navegador.
     */

    if (
        editionState.editingElement ===
        element.id
    ) {

        node.contentEditable =
            'true';

        node.classList.add(
            'is-editing'
        );

        node.innerText =
            element.content || '';

    } else {

        node.textContent =
            element.content || '';

    }


    node.addEventListener(
        'mousedown',
        event => {

            event.stopPropagation();

            selectElement(
                element.id
            );

        }
    );


    node.addEventListener(
        'dblclick',
        event => {

            event.stopPropagation();

            startTextEditing(
                element.id
            );

        }
    );


    if (
        editionState.editingElement ===
        element.id
    ) {

        node.addEventListener(
            'input',
            () => {

                element.content =
                    node.innerText;

                markAsDirty();

                updateCounters();

            }
        );


        node.addEventListener(
            'keydown',
            event => {

                /*
                 * Ctrl + Enter encerra
                 * a edição.
                 */

                if (
                    event.key === 'Enter' &&
                    (event.ctrlKey ||
                     event.metaKey)
                ) {

                    event.preventDefault();

                    finishTextEditing();

                    return;

                }

                /*
                 * Enter normal continua
                 * funcionando como quebra
                 * de linha.
                 */

            }
        );


        setTimeout(
            () => {

                node.focus();

                placeCaretAtEnd(
                    node
                );

            },
            0
        );

    }


    return node;

}


// ==================================================
// 11. SELEÇÃO
// ==================================================

function selectElement(elementId) {

    editionState.selectedElement =
        elementId;

    renderCanvas();

    updatePropertiesPanel();

}


function placeCaretAtEnd(element) {

    const range =
        document.createRange();

    const selection =
        window.getSelection();

    range.selectNodeContents(
        element
    );

    range.collapse(
        false
    );

    selection.removeAllRanges();

    selection.addRange(
        range
    );

}


// ==================================================
// 12. TEXTO
// ==================================================

function addTextElement() {

    finishTextEditing();

    const slide =
        getCurrentSlide();

    if (!slide) {
        return;
    }


    const element = {

        id:
            generateId('element'),

        type:
            'text',

        content:
            '',

        x:
            10,

        y:
            10,

        width:
            40,

        height:
            12,

        fontFamily:
            'Segoe UI',

        fontSize:
            28,

        color:
            '#1f1f1f',

        bold:
            false,

        italic:
            false,

        underline:
            false,

        align:
            'left'

    };


    slide.elements.push(
        element
    );

    editionState.selectedElement =
        element.id;

    editionState.editingElement =
        element.id;

    saveHistory();

    markAsDirty();

    renderApplication();


    /*
     * Depois que o elemento estiver
     * renderizado, o cursor é colocado
     * dentro da caixa.
     */

    requestAnimationFrame(
        () => {

            const node =
                document.querySelector(
                    `[data-element-id="${element.id}"]`
                );

            if (!node) {
                return;
            }

            node.focus();

            placeCaretAtEnd(
                node
            );

        }
    );

}


function startTextEditing(elementId) {

    const element =
        getCurrentSlide()
            ?.elements
            .find(
                item =>
                    item.id === elementId
            );

    if (!element) {
        return;
    }


    editionState.selectedElement =
        elementId;

    editionState.editingElement =
        elementId;


    renderCanvas();

    updatePropertiesPanel();


    requestAnimationFrame(
        () => {

            const node =
                document.querySelector(
                    `[data-element-id="${elementId}"]`
                );

            if (!node) {
                return;
            }

            node.focus();

            placeCaretAtEnd(
                node
            );

        }
    );

}


function finishTextEditing() {

    if (!editionState.editingElement) {
        return;
    }


    const node =
        document.querySelector(
            `[data-element-id="${editionState.editingElement}"]`
        );


    if (node) {

        const element =
            getSelectedElement();

        if (element) {

            element.content =
                node.innerText;

        }

    }


    editionState.editingElement =
        null;

    renderCanvas();

    updatePropertiesPanel();

}


// ==================================================
// 13. FORMATAÇÃO
// ==================================================

function applyToSelectedElement(
    callback
) {

    finishTextEditing();

    const element =
        getSelectedElement();

    if (!element) {
        return;
    }

    callback(element);

    saveHistory();

    markAsDirty();

    renderApplication();

}


function toggleBold() {

    applyToSelectedElement(
        element => {

            element.bold =
                !element.bold;

        }
    );

}


function toggleItalic() {

    applyToSelectedElement(
        element => {

            element.italic =
                !element.italic;

        }
    );

}


function toggleUnderline() {

    applyToSelectedElement(
        element => {

            element.underline =
                !element.underline;

        }
    );

}


function setTextAlign(align) {

    applyToSelectedElement(
        element => {

            element.align =
                align;

        }
    );

}


function increaseFontSize() {

    applyToSelectedElement(
        element => {

            element.fontSize =
                Math.min(
                    200,
                    (element.fontSize || 24) + 2
                );

        }
    );

}


function decreaseFontSize() {

    applyToSelectedElement(
        element => {

            element.fontSize =
                Math.max(
                    6,
                    (element.fontSize || 24) - 2
                );

        }
    );

}


function clearFormatting() {

    applyToSelectedElement(
        element => {

            element.fontFamily =
                'Segoe UI';

            element.fontSize =
                24;

            element.color =
                '#1f1f1f';

            element.bold =
                false;

            element.italic =
                false;

            element.underline =
                false;

            element.align =
                'left';

        }
    );

}


// ==================================================
// 14. CLIPBOARD
// ==================================================

function copySelectedElement() {

    finishTextEditing();

    const element =
        getSelectedElement();

    if (!element) {
        return;
    }

    editionState.clipboard =
        cloneData(element);

}


function cutSelectedElement() {

    const element =
        getSelectedElement();

    if (!element) {
        return;
    }

    copySelectedElement();

    deleteSelectedElement();

}


function pasteElement() {

    const slide =
        getCurrentSlide();

    if (
        !slide ||
        !editionState.clipboard
    ) {
        return;
    }

    const element =
        cloneData(
            editionState.clipboard
        );

    element.id =
        generateId('element');

    element.x =
        Math.min(
            90,
            element.x + 3
        );

    element.y =
        Math.min(
            90,
            element.y + 3
        );

    slide.elements.push(
        element
    );

    editionState.selectedElement =
        element.id;

    saveHistory();

    markAsDirty();

    renderApplication();

}


function deleteSelectedElement() {

    finishTextEditing();

    const slide =
        getCurrentSlide();

    if (!slide) {
        return;
    }

    const index =
        slide.elements.findIndex(
            element =>
                element.id ===
                editionState.selectedElement
        );

    if (index === -1) {
        return;
    }

    slide.elements.splice(
        index,
        1
    );

    editionState.selectedElement =
        null;

    saveHistory();

    markAsDirty();

    renderApplication();

}


// ==================================================
// 15. NOTAS
// ==================================================

function updateNotes() {

    const slide =
        getCurrentSlide();

    if (
        !slide ||
        !elements.slideNotes
    ) {
        return;
    }

    slide.notes =
        elements.slideNotes.value;

    markAsDirty();

}


function renderNotes() {

    if (!elements.slideNotes) {
        return;
    }

    const slide =
        getCurrentSlide();

    elements.slideNotes.value =
        slide?.notes || '';

}


// ==================================================
// 16. CONTADORES
// ==================================================

function countWords() {

    let text = '';

    editionState.presentation.slides.forEach(
        slide => {

            slide.elements.forEach(
                element => {

                    if (
                        element.type === 'text'
                    ) {

                        text +=
                            ` ${element.content || ''}`;

                    }

                }
            );

        }
    );


    const clean =
        text.trim();

    if (!clean) {
        return 0;
    }

    return clean
        .split(/\s+/)
        .filter(Boolean)
        .length;

}


function updateCounters() {

    const total =
        editionState.presentation.slides.length;

    const current =
        editionState.currentSlideIndex + 1;


    if (elements.slideCounter) {

        elements.slideCounter.textContent =
            `Slide ${current} de ${total}`;

    }


    if (elements.statusSlide) {

        elements.statusSlide.textContent =
            `Slide ${current} de ${total}`;

    }


    if (elements.statusWordCount) {

        elements.statusWordCount.textContent =
            `${countWords()} palavras`;

    }

}


// ==================================================
// 17. PROPRIEDADES
// ==================================================

function updatePropertiesPanel() {

    if (
        !elements.selectedElementProperties
    ) {
        return;
    }

    const element =
        getSelectedElement();


    if (!element) {

        elements.selectedElementProperties.innerHTML = `
            <p class="properties-group__empty">
                Selecione um elemento para visualizar
                suas propriedades.
            </p>
        `;

        return;
    }


    elements.selectedElementProperties.innerHTML = `

        <p class="properties-group__empty">
            Tipo: ${element.type}
        </p>

        <p class="properties-group__empty">
            Posição:
            ${Math.round(element.x)}%,
            ${Math.round(element.y)}%
        </p>

        <p class="properties-group__empty">
            Tamanho:
            ${Math.round(element.width)}% ×
            ${Math.round(element.height)}%
        </p>

    `;

}


// ==================================================
// 18. ZOOM
// ==================================================

function setZoom(value) {

    const zoom =
        Math.max(
            10,
            Math.min(
                400,
                Number(value)
            )
        );

    editionState.zoom =
        zoom;


    if (elements.zoomRange) {

        elements.zoomRange.value =
            zoom;

    }


    if (elements.workspaceCanvas) {

        elements.workspaceCanvas.style.transform =
            `scale(${zoom / 100})`;

        elements.workspaceCanvas.style.transformOrigin =
            'top center';

    }


    updateZoomValue();

}


function updateZoomValue() {

    const button =
        document.querySelector(
            '.statusbar__zoom-value'
        );

    if (button) {

        button.textContent =
            `${editionState.zoom}%`;

    }

}


function zoomIn() {

    setZoom(
        editionState.zoom + 10
    );

}


function zoomOut() {

    setZoom(
        editionState.zoom - 10
    );

}


function resetZoom() {

    setZoom(
        EDITION_CONFIG.defaultZoom
    );

}


// ==================================================
// 19. PLANO DE FUNDO
// ==================================================

function setSlideBackground() {

    finishTextEditing();

    const slide =
        getCurrentSlide();

    if (!slide) {
        return;
    }


    const color =
        window.prompt(
            'Cor do plano de fundo:',
            slide.background
        );


    if (!color) {
        return;
    }


    slide.background =
        color;

    saveHistory();

    markAsDirty();

    renderApplication();

}


// ==================================================
// 20. VISUALIZAÇÃO
// ==================================================

function setView(view) {

    finishTextEditing();

    editionState.currentView =
        view;


    if (elements.application) {

        elements.application.dataset.view =
            view;

    }


    document
        .querySelectorAll(
            '[data-action="normal-view"],' +
            '[data-action="slide-sorter"],' +
            '[data-action="slide-show"]'
        )
        .forEach(
            button =>
                button.classList.remove(
                    'is-active'
                )
        );


    if (view === 'normal') {

        document
            .querySelectorAll(
                '[data-action="normal-view"]'
            )
            .forEach(
                button =>
                    button.classList.add(
                        'is-active'
                    )
            );

        return;
    }


    if (view === 'sorter') {

        document
            .querySelectorAll(
                '[data-action="slide-sorter"]'
            )
            .forEach(
                button =>
                    button.classList.add(
                        'is-active'
                    )
            );

        return;
    }


    if (view === 'presentation') {

        document
            .querySelectorAll(
                '[data-action="slide-show"]'
            )
            .forEach(
                button =>
                    button.classList.add(
                        'is-active'
                    )
            );

        startPresentation();

    }

}


function startPresentation() {

    const slide =
        getCurrentSlide();

    if (!slide) {
        return;
    }


    const presentationWindow =
        window.open(
            '',
            '_blank'
        );


    if (!presentationWindow) {
        return;
    }


    presentationWindow.document.write(`
        <!DOCTYPE html>

        <html lang="pt-BR">

        <head>

            <meta charset="UTF-8">

            <title>
                ${escapeHTML(
                    editionState.presentation.name
                )}
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                html,
                body {
                    width: 100%;
                    height: 100%;
                    margin: 0;
                }

                body {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #111;
                    overflow: hidden;
                }

                .slide {
                    position: relative;
                    width: 90vw;
                    max-width: 1280px;
                    aspect-ratio: 16 / 9;
                    background: #fff;
                    overflow: hidden;
                }

                .element {
                    position: absolute;
                    white-space: pre-wrap;
                    overflow: hidden;
                }

            </style>

        </head>

        <body>

            <div
                class="slide"
                style="
                    background:
                    ${escapeHTML(
                        slide.background
                    )};
                "
            >

                ${slide.elements
                    .map(
                        element => `

                            <div
                                class="element"
                                style="
                                    left:
                                        ${element.x}%;

                                    top:
                                        ${element.y}%;

                                    width:
                                        ${element.width}%;

                                    height:
                                        ${element.height}%;

                                    font-family:
                                        ${escapeHTML(
                                            element.fontFamily
                                        )};

                                    font-size:
                                        ${element.fontSize}px;

                                    font-weight:
                                        ${element.bold
                                            ? 700
                                            : 400};

                                    font-style:
                                        ${element.italic
                                            ? 'italic'
                                            : 'normal'};

                                    text-decoration:
                                        ${element.underline
                                            ? 'underline'
                                            : 'none'};

                                    color:
                                        ${escapeHTML(
                                            element.color
                                        )};

                                    text-align:
                                        ${element.align};
                                "
                            >
                                ${escapeHTML(
                                    element.content || ''
                                )}
                            </div>

                        `
                    )
                    .join('')}

            </div>

        </body>

        </html>
    `);


    presentationWindow.document.close();

}


// ==================================================
// 21. ESCAPE HTML
// ==================================================

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            '&',
            '&amp;'
        )

        .replaceAll(
            '<',
            '&lt;'
        )

        .replaceAll(
            '>',
            '&gt;'
        )

        .replaceAll(
            '"',
            '&quot;'
        )

        .replaceAll(
            "'",
            '&#039;'
        );

}


// ==================================================
// 22. SALVAMENTO
// ==================================================

function savePresentation() {

    finishTextEditing();

    editionState.presentation.updatedAt =
        new Date().toISOString();


    localStorage.setItem(
        EDITION_CONFIG.storageKey,
        JSON.stringify(
            editionState.presentation
        )
    );


    markAsSaved();

}


function loadSavedPresentation() {

    const saved =
        localStorage.getItem(
            EDITION_CONFIG.storageKey
        );


    if (!saved) {
        return false;
    }


    try {

        const presentation =
            JSON.parse(saved);


        if (
            !presentation ||
            !Array.isArray(
                presentation.slides
            )
        ) {
            return false;
        }


        editionState.presentation =
            presentation;


        return true;

    } catch (error) {

        console.error(
            'Erro ao carregar apresentação:',
            error
        );

        return false;

    }

}


// ==================================================
// 23. AÇÕES
// ==================================================

function handleAction(action) {

    switch (action) {

        case 'undo':
            undo();
            break;

        case 'redo':
            redo();
            break;

        case 'save':
            savePresentation();
            break;

        case 'new-slide':
            addSlide();
            break;

        case 'duplicate-slide':
            duplicateCurrentSlide();
            break;

        case 'delete-slide':
            deleteCurrentSlide();
            break;

        case 'previous-slide':
            previousSlide();
            break;

        case 'next-slide':
            nextSlide();
            break;

        case 'copy':
            copySelectedElement();
            break;

        case 'cut':
            cutSelectedElement();
            break;

        case 'paste':
            pasteElement();
            break;

        case 'bold':
            toggleBold();
            break;

        case 'italic':
            toggleItalic();
            break;

        case 'underline':
            toggleUnderline();
            break;

        case 'align-left':
            setTextAlign('left');
            break;

        case 'align-center':
            setTextAlign('center');
            break;

        case 'align-right':
            setTextAlign('right');
            break;

        case 'justify':
            setTextAlign('justify');
            break;

        case 'increase-font':
            increaseFontSize();
            break;

        case 'decrease-font':
            decreaseFontSize();
            break;

        case 'clear-formatting':
            clearFormatting();
            break;

        case 'insert-textbox':
            addTextElement();
            break;

        case 'delete-comment':
            deleteSelectedElement();
            break;

        case 'slide-background':
        case 'format-background':
            setSlideBackground();
            break;

        case 'zoom-in':
            zoomIn();
            break;

        case 'zoom-out':
            zoomOut();
            break;

        case 'zoom-options':
            resetZoom();
            break;

        case 'normal-view':
            setView('normal');
            break;

        case 'slide-sorter':
            setView('sorter');
            break;

        case 'slide-show':
        case 'present':
        case 'start-from-current':
            setView('presentation');
            break;

        case 'start-from-beginning':

            editionState.currentSlideIndex =
                0;

            renderApplication();

            setView(
                'presentation'
            );

            break;

        default:

            console.info(
                `Ação disponível para implementação: ${action}`
            );

            break;

    }

}


// ==================================================
// 24. EVENTOS
// ==================================================

function setupActionEvents() {

    document.addEventListener(
        'click',
        event => {

            const actionElement =
                event.target.closest(
                    '[data-action]'
                );


            if (!actionElement) {
                return;
            }


            handleAction(
                actionElement.dataset.action
            );

        }
    );

}


function setupNotesEvents() {

    if (!elements.slideNotes) {
        return;
    }

    elements.slideNotes.addEventListener(
        'input',
        updateNotes
    );

}


function setupZoomEvents() {

    if (!elements.zoomRange) {
        return;
    }

    elements.zoomRange.addEventListener(
        'input',
        event => {

            setZoom(
                event.target.value
            );

        }
    );

}


function setupCanvasEvents() {

    if (!elements.canvas) {
        return;
    }


    elements.canvas.addEventListener(
        'click',
        event => {

            /*
             * Se clicou diretamente no canvas,
             * remove a seleção.
             */

            if (
                event.target ===
                elements.canvas
            ) {

                finishTextEditing();

                editionState.selectedElement =
                    null;

                renderCanvas();

                updatePropertiesPanel();

            }

        }
    );

}


function setupKeyboardEvents() {

    document.addEventListener(
        'keydown',
        event => {

            const modifier =
                event.ctrlKey ||
                event.metaKey;


            /*
             * Não interferir na digitação
             * quando uma caixa está sendo editada.
             */

            if (
                editionState.editingElement
            ) {

                if (
                    modifier &&
                    event.key.toLowerCase() === 's'
                ) {

                    event.preventDefault();

                    finishTextEditing();

                    savePresentation();

                }

                return;

            }


            if (
                modifier &&
                event.key.toLowerCase() === 'z'
            ) {

                event.preventDefault();

                if (event.shiftKey) {

                    redo();

                } else {

                    undo();

                }

                return;

            }


            if (
                modifier &&
                event.key.toLowerCase() === 'y'
            ) {

                event.preventDefault();

                redo();

                return;

            }


            if (
                modifier &&
                event.key.toLowerCase() === 's'
            ) {

                event.preventDefault();

                savePresentation();

                return;

            }


            if (
                modifier &&
                event.key.toLowerCase() === 'c'
            ) {

                if (
                    editionState.selectedElement
                ) {

                    copySelectedElement();

                }

                return;

            }


            if (
                modifier &&
                event.key.toLowerCase() === 'x'
            ) {

                if (
                    editionState.selectedElement
                ) {

                    cutSelectedElement();

                }

                return;

            }


            if (
                modifier &&
                event.key.toLowerCase() === 'v'
            ) {

                if (
                    editionState.clipboard
                ) {

                    pasteElement();

                }

                return;

            }


            if (
                event.key === 'Delete' &&
                editionState.selectedElement
            ) {

                deleteSelectedElement();

                return;

            }


            if (
                event.key === 'ArrowLeft' &&
                !editionState.selectedElement
            ) {

                previousSlide();

                return;

            }


            if (
                event.key === 'ArrowRight' &&
                !editionState.selectedElement
            ) {

                nextSlide();

            }

        }
    );

}


// ==================================================
// 25. RENDERIZAÇÃO GERAL
// ==================================================

function renderApplication() {

    renderSlides();

    renderCanvas();

    renderNotes();

    updateCounters();

    updatePropertiesPanel();

    updateFileName();

    updateFileStatus();

    updateZoomValue();

}


// ==================================================
// 26. INICIALIZAÇÃO
// ==================================================

function initializePresentation() {

    const loaded =
        loadSavedPresentation();


    if (!loaded) {

        editionState.presentation =
            createPresentation();

    }


    editionState.currentSlideIndex =
        0;

    editionState.selectedElement =
        null;

    editionState.editingElement =
        null;

    editionState.history =
        [];

    editionState.historyIndex =
        -1;


    saveHistory();

    renderApplication();

    activateRibbonTab(
        'home'
    );

    setZoom(
        EDITION_CONFIG.defaultZoom
    );

}


// ==================================================
// 27. INICIALIZAÇÃO DA EDIÇÃO
// ==================================================

function initializeEdition() {

    setupRibbon();

    setupActionEvents();

    setupNotesEvents();

    setupZoomEvents();

    setupKeyboardEvents();

    setupCanvasEvents();

    initializePresentation();

}


// ==================================================
// 28. START
// ==================================================

document.addEventListener(
    'DOMContentLoaded',
    initializeEdition
);
