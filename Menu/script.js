// ==================================================
// AXIS Present
// Menu - script.js
// ==================================================


// ==================================================
// 1. ESTADO DA APLICAÇÃO
// ==================================================

const menuState = {
    presentations: []
};


// ==================================================
// 2. ELEMENTOS DA INTERFACE
// ==================================================

const elements = {
    newPresentationButtons: document.querySelectorAll(
        '[data-action="new-presentation"]'
    ),

    importPresentationButton: document.querySelector(
        '[data-action="import-presentation"]'
    )
};


// ==================================================
// 3. NAVEGAÇÃO
// ==================================================

function navigateToEdition() {
    window.location.href = '../Edition/index.html';
}


// ==================================================
// 4. NOVA APRESENTAÇÃO
// ==================================================

function createPresentation() {
    navigateToEdition();
}


// ==================================================
// 5. IMPORTAR APRESENTAÇÃO
// ==================================================

function importPresentation() {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = '.pptx,.ppt,.odp';

    fileInput.addEventListener('change', handleImportedFile);

    fileInput.click();
}


// ==================================================
// 6. PROCESSAMENTO DO ARQUIVO IMPORTADO
// ==================================================

function handleImportedFile(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    /*
     * O processamento do arquivo será definido
     * posteriormente.
     *
     * Neste momento, o sistema apenas permite
     * selecionar uma apresentação para importação.
     */
}


// ==================================================
// 7. EVENTOS
// ==================================================

function setupEvents() {

    elements.newPresentationButtons.forEach((button) => {
        button.addEventListener(
            'click',
            createPresentation
        );
    });


    if (elements.importPresentationButton) {
        elements.importPresentationButton.addEventListener(
            'click',
            importPresentation
        );
    }
}


// ==================================================
// 8. INICIALIZAÇÃO
// ==================================================

function initializeMenu() {
    setupEvents();
}


// ==================================================
// 9. INICIALIZAÇÃO DA APLICAÇÃO
// ==================================================

document.addEventListener(
    'DOMContentLoaded',
    initializeMenu
);
