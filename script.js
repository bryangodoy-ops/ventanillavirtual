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

  // Selección de OC (hidden + mensaje)
  ocHidden: document.getElementById('ordenCompraSeleccionada'),
  emHidden: document.getElementById('entradaMercanciaSeleccionada'),
  ocMensaje: document.getElementById('ocSeleccionadaMensaje'),

  // Mensajes de error
  xmlFileError: document.getElementById('xmlFileError'),
  xmlContentError: document.getElementById('xmlContentError'),
  uuidError: document.getElementById('uuidError'),
  pdfFileError: document.getElementById('pdfFileError'),

  // Formulario
  form: document.getElementById('facturaForm'),
  cancelBtn: document.getElementById('cancelBtn'),
  submitBtn: document.getElementById('submitBtn'),

  // Pantalla de resultado
  resultadoStep: document.getElementById('resultado-step'),
  descargarPdfBtn: document.getElementById('descargarPdfBtn'),
  nuevaFacturaBtn: document.getElementById('nuevaFacturaBtn')
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
  },
  extractedUUID: null
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
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ========================================
// FUNCIÓN PARA EXTRAER UUID DEL XML
// ========================================

function extractUUIDFromXML(xmlContent) {
  try {
    const regex = /<dte:NumeroAutorizacion[^>]*>([A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12})<\/dte:NumeroAutorizacion>/i;
    const match = xmlContent.match(regex);

    if (match && match[1]) {
      return match[1].toUpperCase();
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    const numeroAutorizacion =
      xmlDoc.getElementsByTagName('dte:NumeroAutorizacion')[0] ||
      xmlDoc.getElementsByTagName('NumeroAutorizacion')[0];

    if (numeroAutorizacion && numeroAutorizacion.textContent) {
      const uuid = numeroAutorizacion.textContent.trim();
      if (validateUUID(uuid)) {
        return uuid.toUpperCase();
      }
    }

    return null;
  } catch (error) {
    console.error('Error al extraer UUID del XML:', error);
    return null;
  }
}

// ========================================
// FUNCIONES DE CAMBIO DE MÉTODO
// ========================================

function changeMethod(method) {
  appState.selectedMethod = method;

  const allMethodBtns = [elements.xmlMethodBtn, elements.uuidMethodBtn, elements.pdfMethodBtn];
  allMethodBtns.forEach((btn) => {
    if (!btn) return;
    if (btn.dataset.method === method) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  elements.xmlContent.classList.remove('active');
  elements.uuidContent.classList.remove('active');
  elements.pdfContent.classList.remove('active');

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

  if (elements.xmlFileInput) elements.xmlFileInput.classList.remove('error');
  if (elements.xmlTextarea) elements.xmlTextarea.classList.remove('error');
  if (elements.uuidInput) elements.uuidInput.classList.remove('error');
  if (elements.pdfFileInput) elements.pdfFileInput.classList.remove('error');
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
    showError(
      elements.xmlFileError,
      `El archivo es demasiado grande. Tamaño máximo: ${formatFileSize(CONFIG.MAX_FILE_SIZE)}`
    );
    elements.xmlFileInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const xmlContent = e.target.result;
    const uuid = extractUUIDFromXML(xmlContent);

    if (uuid) {
      appState.extractedUUID = uuid;
      elements.xmlFileText.innerHTML = `✓ ${file.name}<br><small style="color: var(--color-success); font-weight: 600;">UUID extraído: ${uuid}</small>`;
      elements.xmlUploadZone.style.borderColor = 'var(--color-success)';
      elements.xmlUploadZone.style.background = '#f1f8f4';
      console.log('UUID extraído del XML:', uuid);
    } else {
      appState.extractedUUID = null;
      elements.xmlFileText.innerHTML = `✓ ${file.name}<br><small style="color: var(--color-warning); font-weight: 600;">⚠ No se pudo extraer el UUID automáticamente</small>`;
      elements.xmlUploadZone.style.borderColor = 'var(--color-warning)';
      elements.xmlUploadZone.style.background = '#fff9e6';
      console.warn('No se pudo extraer el UUID del XML');
    }
  };

  reader.onerror = function () {
    showError(elements.xmlFileError, 'Error al leer el archivo XML.');
    elements.xmlFileInput.value = '';
  };

  reader.readAsText(file);
  appState.uploadedFiles.xml = file;
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
    showError(
      elements.pdfFileError,
      `El archivo es demasiado grande. Tamaño máximo: ${formatFileSize(CONFIG.MAX_FILE_SIZE)}`
    );
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
    showError(
      elements.uuidError,
      'Formato UUID inválido. Ejemplo: 12345678-1234-1234-1234-123456789ABC'
    );
    elements.uuidInput.classList.add('error');
  } else {
    hideError(elements.uuidError);
    elements.uuidInput.classList.remove('error');
  }
}

function validateForm() {
  let isValid = true;

  // Validar que haya OC seleccionada (usando los hidden)
  if (!elements.ocHidden.value || !elements.emHidden.value) {
    alert('Por favor selecciona una orden de compra antes de enviar la factura.');
    isValid = false;
  }

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
      } else {
        const uuid = extractUUIDFromXML(xmlContent);
        if (uuid) {
          appState.extractedUUID = uuid;
          console.log('UUID extraído del contenido XML:', uuid);
        }
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

  return isValid;
}

// ========================================
// FUNCIONES DE ENVÍO Y RESET
// ========================================

function handleSubmit(e) {
  e.preventDefault();

  clearAllErrors();
  if (!validateForm()) return;

  const formData = {
    method: appState.selectedMethod,
    ordenCompra: elements.ocHidden.value,
    entradaMercancia: elements.emHidden.value
  };

  if (appState.selectedMethod === 'xml') {
    if (appState.xmlInputType === 'file') {
      formData.xmlFile = appState.uploadedFiles.xml;
      formData.extractedUUID = appState.extractedUUID;
    } else {
      formData.xmlContent = elements.xmlTextarea.value.trim();
      formData.extractedUUID = appState.extractedUUID;
    }
  } else if (appState.selectedMethod === 'uuid') {
    formData.uuid = elements.uuidInput.value.trim();
  } else if (appState.selectedMethod === 'pdf') {
    formData.pdfFile = appState.uploadedFiles.pdf;
  }

  console.log('Datos del formulario listos para enviar al bot:', formData);

  // 🔹 Aquí en la POC asumimos éxito del bot y mostramos la pantalla de resultado
  if (elements.form && elements.resultadoStep) {
    elements.form.style.display = 'none';
    elements.resultadoStep.style.display = 'flex';
  }
}

function handleReset() {
  appState.selectedMethod = 'xml';
  appState.xmlInputType = 'file';
  appState.uploadedFiles = { xml: null, pdf: null };
  appState.extractedUUID = null;

  changeMethod('xml');
  toggleXMLInput('file');

  if (elements.xmlFileInput) elements.xmlFileInput.value = '';
  if (elements.xmlTextarea) elements.xmlTextarea.value = '';
  if (elements.uuidInput) elements.uuidInput.value = '';
  if (elements.pdfFileInput) elements.pdfFileInput.value = '';

  if (elements.xmlFileText) elements.xmlFileText.textContent = 'Seleccione o arrastre el archivo XML';
  if (elements.xmlUploadZone) {
    elements.xmlUploadZone.style.borderColor = '';
    elements.xmlUploadZone.style.background = '';
  }

  if (elements.pdfFileText) elements.pdfFileText.textContent = 'Seleccione o arrastre el archivo PDF';
  if (elements.pdfUploadZone) {
    elements.pdfUploadZone.style.borderColor = '';
    elements.pdfUploadZone.style.background = '';
  }

  clearAllErrors();

  // Volver a mostrar el formulario y ocultar resultado
  if (elements.form) elements.form.style.display = 'block';
  if (elements.resultadoStep) elements.resultadoStep.style.display = 'none';
}

// ========================================
// EVENT LISTENERS
// ========================================

function initEventListeners() {
  if (elements.xmlMethodBtn) {
    elements.xmlMethodBtn.addEventListener('click', () => changeMethod('xml'));
  }
  if (elements.uuidMethodBtn) {
    elements.uuidMethodBtn.addEventListener('click', () => changeMethod('uuid'));
  }
  if (elements.pdfMethodBtn) {
    elements.pdfMethodBtn.addEventListener('click', () => changeMethod('pdf'));
  }

  if (elements.toggleOptionsBtn && elements.alternativeOptions) {
    elements.toggleOptionsBtn.addEventListener('click', () => {
      elements.alternativeOptions.classList.toggle('show');
      elements.toggleOptionsBtn.classList.toggle('active');
    });
  }

  if (elements.xmlFileToggle && elements.xmlPasteToggle) {
    elements.xmlFileToggle.addEventListener('click', () => toggleXMLInput('file'));
    elements.xmlPasteToggle.addEventListener('click', () => toggleXMLInput('paste'));
  }

  if (elements.xmlUploadZone && elements.xmlFileInput) {
    elements.xmlUploadZone.addEventListener('click', () => elements.xmlFileInput.click());
    elements.xmlFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleXMLFileUpload(e.target.files[0]);
      }
    });

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
  }

  if (elements.pdfUploadZone && elements.pdfFileInput) {
    elements.pdfUploadZone.addEventListener('click', () => elements.pdfFileInput.click());
    elements.pdfFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handlePDFFileUpload(e.target.files[0]);
      }
    });

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
  }

  if (elements.uuidInput) {
    elements.uuidInput.addEventListener('input', validateUUIDInput);
    elements.uuidInput.addEventListener('blur', validateUUIDInput);
  }

  if (elements.form) {
    elements.form.addEventListener('submit', handleSubmit);
  }

  if (elements.cancelBtn) {
    elements.cancelBtn.addEventListener('click', handleReset);
  }

  // Botones de la pantalla de resultado
  if (elements.descargarPdfBtn) {
    elements.descargarPdfBtn.addEventListener('click', () => {
      const link = document.createElement('a');
      link.href = 'ContraseñaDePago.pdf'; // Asegúrate de tener este archivo en el repo
      link.download = 'contraseña_pago.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  if (elements.nuevaFacturaBtn) {
    elements.nuevaFacturaBtn.addEventListener('click', () => {
      if (elements.resultadoStep) elements.resultadoStep.style.display = 'none';
      if (elements.form) {
        elements.form.style.display = 'block';
        elements.form.reset();
      }
      handleReset();
    });
  }
}

// ========================================
// INICIALIZACIÓN
// ========================================

function init() {
  console.log('Inicializando Portal de Proveedores...');
  initEventListeners();
  changeMethod('xml');
  toggleXMLInput('file');

  // Asegurar que la pantalla de resultado arranque oculta
  if (elements.resultadoStep) {
    elements.resultadoStep.style.display = 'none';
  }

  console.log('Portal de Proveedores inicializado correctamente.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
