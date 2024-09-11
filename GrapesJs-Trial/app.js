// Initialize the GrapesJS editor
const editor = grapesjs.init({
    container: '#editor',
    fromElement: true,
    height: '100vh',
    width: 'auto',
    storageManager: {
        autoload: false,
    },
    // Panels and blocks for drag & drop
    blockManager: {
        appendTo: '#blocks',
        blocks: [
            {
                id: 'section',
                label: '<b>Section</b>',
                attributes: { class: 'gjs-block-section' },
                content: `<section style="padding: 20px">Section</section>`,
            },
            {
                id: 'text',
                label: 'Text',
                content: '<div>Insert your text here</div>',
            },
            {
                id: 'image',
                label: 'Image',
                content: { type: 'image' },
            },
        ],
    },
    // Style manager configuration
    styleManager: {
        sectors: [
            {
                name: 'General',
                open: false,
                buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
            },
            {
                name: 'Dimension',
                open: false,
                buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
            },
            {
                name: 'Typography',
                open: true,
                buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color'],
            },
            {
                name: 'Decorations',
                open: false,
                buildProps: ['border-radius', 'box-shadow', 'background-color'],
            },
        ],
    },
});

// Add custom commands
editor.Commands.add('show-layers', {
    getRowEl(editor) { return editor.getContainer().closest('.editor-row'); },
    run(editor, sender) {
        const lmEl = this.getRowEl(editor).querySelector('.layers-container');
        lmEl.style.display = '';
    },
    stop(editor, sender) {
        const lmEl = this.getRowEl(editor).querySelector('.layers-container');
        lmEl.style.display = 'none';
    },
});

// Button to save the design
editor.Panels.addButton('options', [{
    id: 'save',
    className: 'fa fa-floppy-o',
    command(editor) {
        editor.store();
    },
    attributes: { title: 'Save Design' },
}]);
