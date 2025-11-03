// ========================================
// CONFIGURACIÓN Y CONSTANTES
// ========================================

const CONFIG = {
    UUID_PATTERN: /^[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}$/i,
    ALLOWED_XML_EXTENSIONS: ['.xml'],
    ALLOWED_PDF_EXTENSIONS: ['.pdf'],
    MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB
};

// ========================================
// ELEMENTOS DEL DOM
// ========================================

const elements = {
    // Botones de método
    xmlMethodBtn: document.getElementById('xmlMethodBtn'),
    uuidMethodBtn: document.getElementById('uuidMethodBtn'),
    pdfMethodBtn: document.getElementById('pdfMethodBtn'),
    
    // Contenidos de método
    xmlContent: document.getElementById('xmlContent'),
    uuidContent: document.getElementById('uuidContent'),
    pdfContent: document.getElementById('pdfContent'),
    
    // Toggle de opciones alternativas
    toggleOptionsBtn: document.getElementById('toggleOptionsBtn'),
    alternativeOptions: document.getElementById('alternativeOptions'),
    
    // Toggle XML (archivo/pegar)
    xmlFileToggle: document.getElementById('xmlFileToggle'),
    xmlPasteToggle: document.getElementById('xmlPasteToggle'),
    xmlFileGroup: document.getElementById('xmlFileGroup'),
    xmlPasteGroup: document.getElementById('xmlPasteGroup'),
    
    // Inputs
    xmlFileInput: document.getElementById('xmlFileInput'),
    xmlUploadZone: document.getElementById('xmlUploadZone'),
    xmlFileText: document.getElementById('xmlFileText'),
    xmlTextarea: document.getElementById('xmlTextarea'),
    uuidInput: document.getElementById('uuidInput'),
    pdfFileInput: document.getElementById('pdfFileInput'),
    pdfUploadZone: document.getElementById('pdfUploadZone'),
    pdfFileText: document.getElementById('pdfFileText'),
    ordenCompraInput: document.getElementById('ordenCompraInput'),
    entradaMercanciaInput: document.getElementById('entradaMercanciaInput'),
    
    // Mensajes de error
    xmlFileError: document.getElementById('xmlFileError'),
    xmlContentError: document.getElementById('xmlContentError'),
    uuidError: document.getElementById('uuidError'),
    pdfFileError: document.getElementById('pdfFileError'),
    ordenCompraError: document.getElementById('ordenCompraError'),
    entradaMercanciaError: document.getElementById('entradaMercanciaError'),
    
    // Formulario
    form: document.getElementById('facturaForm'),
    cancelBtn: document.getElementById('cancelBtn'),
    submitBtn: document.getElementById('submitBtn')
};

// ========================================
// ESTADO DE LA APLICACIÓN
// ========================================

let appState = {
    selectedMethod: 'xml',
    xmlInputType: 'file',
    uploadedFiles: {
        xml: null,
        pdf: null
    }
};

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

function showError(errorElement, message) {
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function hideError(errorElement) {
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
}

function validateUUID(uuid) {
    return CONFIG.UUID_PATTERN.test(uuid);
}

function validateFileExtension(filename, allowedExtensions) {
    const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    return allowedExtensions.includes(extension);
}

function validateFileSize(file) {
    return file.size <= CONFIG.MAX_FILE_SIZE;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ========================================
// FUNCIONES DE CAMBIO DE MÉTODO
// ========================================

function changeMethod(method) {
    appState.selectedMethod = method;
    
    // Actualizar botones
    const allMethodBtns = [elements.xmlMethodBtn, elements.uuidMethodBtn, elements.pdfMethodBtn];
    allMethodBtns.forEach(btn => {
        if (btn && btn.dataset.method === method) {
            btn.classList.add('active');
        } else if (btn) {
            btn.classList.remove('active');
        }
    });
    
    // Ocultar todos los contenidos
    elements.xmlContent.classList.remove('active');
    elements.uuidContent.classList.remove('active');
    elements.pdfContent.classList.remove('active');
    
    // Mostrar el contenido correspondiente
    if (method === 'xml') {
        elements.xmlContent.classList.add('active');
    } else if (method === 'uuid') {
        elements.uuidContent.classList.add('active');
    } else if (method === 'pdf') {
        elements.pdfContent.classList.add('active');
    }
    
    clearAllErrors();
}

function clearAllErrors() {
    hideError(elements.xmlFileError);
    hideError(elements.xmlContentError);
    hideError(elements.uuidError);
    hideError(elements.pdfFileError);
    hideError(elements.ordenCompraError);
    hideError(elements.entradaMercanciaError);
    
    // Remover clases de error
    if (elements.xmlFileInput) elements.xmlFileInput.classList.remove('error');
    if (elements.xmlTextarea) elements.xmlTextarea.classList.remove('error');
    if (elements.uuidInput) elements.uuidInput.classList.remove('error');
    if (elements.pdfFileInput) elements.pdfFileInput.classList.remove('error');
    if (elements.ordenCompraInput) elements.ordenCompraInput.classList.remove('error');
    if (elements.entradaMercanciaInput) elements.entradaMercanciaInput.classList.remove('error');
}

// ========================================
// FUNCIONES DE TOGGLE XML
// ========================================

function toggleXMLInput(type) {
    appState.xmlInputType = type;
    
    if (type === 'file') {
        elements.xmlFileToggle.classList.add('active');
        elements.xmlPasteToggle.classList.remove('active');
        elements.xmlFileGroup.classList.add('active');
        elements.xmlPasteGroup.classList.remove('active');
    } else {
        elements.xmlFileToggle.classList.remove('active');
        elements.xmlPasteToggle.classList.add('active');
        elements.xmlFileGroup.classList.remove('active');
        elements.xmlPasteGroup.classList.add('active');
    }
    
    hideError(elements.xmlFileError);
    hideError(elements.xmlContentError);
}

// ========================================
// FUNCIONES DE MANEJO DE ARCHIVOS
// ========================================

function handleXMLFileUpload(file) {
    hideError(elements.xmlFileError);
    
    if (!file) return;
    
    if (!validateFileExtension(file.name, CONFIG.ALLOWED_XML_EXTENSIONS)) {
        showError(elements.xmlFileError, 'Por favor, selecciona un archivo XML válido.');
        elements.xmlFileInput.value = '';
        return;
    }
    
    if (!validateFileSize(file)) {
        showError(elements.xmlFileError, `El archivo es demasiado grande. Tamaño máximo: ${formatFileSize(CONFIG.MAX_FILE_SIZE)}`);
        elements.xmlFileInput.value = '';
        return;
    }
    
    appState.uploadedFiles.xml = file;
    elements.xmlFileText.textContent = `✓ ${file.name}`;
    elements.xmlUploadZone.style.borderColor = 'var(--color-success)';
    elements.xmlUploadZone.style.background = '#f1f8f4';
}

function handlePDFFileUpload(file) {
    hideError(elements.pdfFileError);
    
    if (!file) return;
    
    if (!validateFileExtension(file.name, CONFIG.ALLOWED_PDF_EXTENSIONS)) {
        showError(elements.pdfFileError, 'Por favor, selecciona un archivo PDF válido.');
        elements.pdfFileInput.value = '';
        return;
    }
    
    if (!validateFileSize(file)) {
        showError(elements.pdfFileError, `El archivo es demasiado grande. Tamaño máximo: ${formatFileSize(CONFIG.MAX_FILE_SIZE)}`);
        elements.pdfFileInput.value = '';
        return;
    }
    
    appState.uploadedFiles.pdf = file;
    elements.pdfFileText.textContent = `✓ ${file.name}`;
    elements.pdfUploadZone.style.borderColor = 'var(--color-success)';
    elements.pdfUploadZone.style.background = '#f1f8f4';
}

// ========================================
// FUNCIONES DE VALIDACIÓN
// ========================================

function validateUUIDInput() {
    const uuid = elements.uuidInput.value.trim();
    
    if (uuid === '') {
        hideError(elements.uuidError);
        elements.uuidInput.classList.remove('error');
        return;
    }
    
    if (!validateUUID(uuid)) {
        showError(elements.uuidError, 'Formato UUID inválido. Ejemplo: 12345678-1234-1234-1234-123456789ABC');
        elements.uuidInput.classList.add('error');
    } else {
        hideError(elements.uuidError);
        elements.uuidInput.classList.remove('error');
    }
}

function validateForm() {
    let isValid = true;
    
    // Validar método seleccionado
    if (appState.selectedMethod === 'xml') {
        if (appState.xmlInputType === 'file') {
            if (!appState.uploadedFiles.xml) {
                showError(elements.xmlFileError, 'Por favor, carga un archivo XML.');
                isValid = false;
            }
        } else {
            const xmlContent = elements.xmlTextarea.value.trim();
            if (xmlContent === '') {
                showError(elements.xmlContentError, 'Por favor, pega el contenido XML.');
                elements.xmlTextarea.classList.add('error');
                isValid = false;
            }
        }
    } else if (appState.selectedMethod === 'uuid') {
        const uuid = elements.uuidInput.value.trim();
        if (uuid === '') {
            showError(elements.uuidError, 'Por favor, ingresa el UUID de la factura.');
            elements.uuidInput.classList.add('error');
            isValid = false;
        } else if (!validateUUID(uuid)) {
            showError(elements.uuidError, 'Formato UUID inválido.');
            elements.uuidInput.classList.add('error');
            isValid = false;
        }
    } else if (appState.selectedMethod === 'pdf') {
        if (!appState.uploadedFiles.pdf) {
            showError(elements.pdfFileError, 'Por favor, carga un archivo PDF.');
            isValid = false;
        }
    }
    
    // Validar campos adicionales
    if (elements.ordenCompraInput.value.trim() === '') {
        showError(elements.ordenCompraError, 'Por favor, ingresa el número de orden de compra.');
        elements.ordenCompraInput.classList.add('error');
        isValid = false;
    }
    
    if (elements.entradaMercanciaInput.value.trim() === '') {
        showError(elements.entradaMercanciaError, 'Por favor, ingresa el número de entrada de mercancía.');
        elements.entradaMercanciaInput.classList.add('error');
        isValid = false;
    }
    
    return isValid;
}

// ========================================
// FUNCIONES DE ENVÍO Y RESET
// ========================================

function handleSubmit(e) {
    e.preventDefault();
    
    clearAllErrors();
    
    if (!validateForm()) {
        return;
    }
    
    const formData = {
        method: appState.selectedMethod,
        ordenCompra: elements.ordenCompraInput.value.trim(),
        entradaMercancia: elements.entradaMercanciaInput.value.trim()
    };
    
    if (appState.selectedMethod === 'xml') {
        if (appState.xmlInputType === 'file') {
            formData.xmlFile = appState.uploadedFiles.xml;
        } else {
            formData.xmlContent = elements.xmlTextarea.value.trim();
        }
    } else if (appState.selectedMethod === 'uuid') {
        formData.uuid = elements.uuidInput.value.trim();
    } else if (appState.selectedMethod === 'pdf') {
        formData.pdfFile = appState.uploadedFiles.pdf;
    }
    
    console.log('Datos del formulario:', formData);
    alert('Formulario enviado correctamente. Revisa la consola para ver los datos.');
}

function handleReset() {
    appState.selectedMethod = 'xml';
    appState.xmlInputType = 'file';
    appState.uploadedFiles = { xml: null, pdf: null };
    
    changeMethod('xml');
    toggleXMLInput('file');
    
    elements.xmlFileInput.value = '';
    elements.xmlTextarea.value = '';
    elements.uuidInput.value = '';
    elements.pdfFileInput.value = '';
    elements.ordenCompraInput.value = '';
    elements.entradaMercanciaInput.value = '';
    
    elements.xmlFileText.textContent = 'Seleccione o arrastre el archivo XML';
    elements.xmlUploadZone.style.borderColor = '';
    elements.xmlUploadZone.style.background = '';
    
    elements.pdfFileText.textContent = 'Seleccione o arrastre el archivo PDF';
    elements.pdfUploadZone.style.borderColor = '';
    elements.pdfUploadZone.style.background = '';
    
    elements.alternativeOptions.classList.remove('show');
    elements.toggleOptionsBtn.classList.remove('active');
    
    clearAllErrors();
}

// ========================================
// EVENT LISTENERS
// ========================================

function initEventListeners() {
    // Botones de método
    elements.xmlMethodBtn.addEventListener('click', () => changeMethod('xml'));
    elements.uuidMethodBtn.addEventListener('click', () => changeMethod('uuid'));
    elements.pdfMethodBtn.addEventListener('click', () => changeMethod('pdf'));
    
    // Toggle de opciones alternativas
    elements.toggleOptionsBtn.addEventListener('click', () => {
        elements.alternativeOptions.classList.toggle('show');
        elements.toggleOptionsBtn.classList.toggle('active');
    });
    
    // Toggle XML
    elements.xmlFileToggle.addEventListener('click', () => toggleXMLInput('file'));
    elements.xmlPasteToggle.addEventListener('click', () => toggleXMLInput('paste'));
    
    // Zona de carga XML
    elements.xmlUploadZone.addEventListener('click', () => elements.xmlFileInput.click());
    elements.xmlFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleXMLFileUpload(e.target.files[0]);
        }
    });
    
    // Drag and drop XML
    elements.xmlUploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.xmlUploadZone.classList.add('dragover');
    });
    elements.xmlUploadZone.addEventListener('dragleave', () => {
        elements.xmlUploadZone.classList.remove('dragover');
    });
    elements.xmlUploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.xmlUploadZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleXMLFileUpload(e.dataTransfer.files[0]);
        }
    });
    
    // Zona de carga PDF
    elements.pdfUploadZone.addEventListener('click', () => elements.pdfFileInput.click());
    elements.pdfFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handlePDFFileUpload(e.target.files[0]);
        }
    });
    
    // Drag and drop PDF
    elements.pdfUploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.pdfUploadZone.classList.add('dragover');
    });
    elements.pdfUploadZone.addEventListener('dragleave', () => {
        elements.pdfUploadZone.classList.remove('dragover');
    });
    elements.pdfUploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.pdfUploadZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handlePDFFileUpload(e.dataTransfer.files[0]);
        }
    });
    
    // Validación UUID
    elements.uuidInput.addEventListener('input', validateUUIDInput);
    elements.uuidInput.addEventListener('blur', validateUUIDInput);
    
    // Formulario
    elements.form.addEventListener('submit', handleSubmit);
    elements.cancelBtn.addEventListener('click', handleReset);
}

// ========================================
// INICIALIZACIÓN
// ========================================

function init() {
    console.log('Inicializando Portal de Proveedores...');
    initEventListeners();
    changeMethod('xml');
    toggleXMLInput('file');
    console.log('Portal de Proveedores inicializado correctamente.');
}

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
