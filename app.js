document.getElementById('MedicamentosForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Obtener los valores del formulario para MedicationRequest
    const name = document.getElementById('name').value;
    const familyName = document.getElementById('familyName').value;
    const identifierSystem = document.getElementById('identifierSystem').value;
    const identifierValue = document.getElementById('identifierValue').value;
    const medicationCode = document.getElementById('medicationCode').value;
    const medicationDisplay = document.getElementById('medicationDisplay').value;
    const dosage = document.getElementById('dosage').value;
    const frequency = document.getElementById('frequency').value;
    const duration = document.getElementById('duration').value;
    const confirmMedicationAdmin = document.getElementById('confirmMedicationAdmin').checked;

    // Crear el objeto MedicationRequest (la receta)
    const medicationRequest = {
        resourceType: "MedicationRequest",
        status: "active",
        intent: "order",
        medicationCodeableConcept: {
            coding: [{
                system: "http://www.nlm.nih.gov/research/umls/rxnorm", // Sistema de codificación para medicamentos
                code: medicationCode,
                display: medicationDisplay
            }],
            text: medicationDisplay // Texto legible del medicamento
        },
        subject: {
            // Se usa un identificador para referenciar al paciente.
            // Para FHIR, lo ideal es una referencia directa a un ID de Patient,
            // pero si el backend lo maneja así, está bien.
            identifier: {
                system: identifierSystem,
                value: identifierValue
            },
            display: `${name} ${familyName}` // Nombre legible para el display
        },
        // Información del que prescribe (ej. Practitioner) se puede añadir aquí si es necesario
        // requester: {
        //   reference: "Practitioner/example",
        //   display: "Dr. Juan Pérez"
        // },
        dosageInstruction: [{
            text: `Tomar ${dosage} cada ${frequency} horas durante ${duration} días`
        }],
        // Extensiones u otros elementos FHIR si se necesitan
    };

    // 1. Enviar la MedicationRequest al backend
    fetch('https://meds-backend-fjhd.onrender.com/medication-request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(medicationRequest)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.issue ? errorData.issue[0].diagnostics : 'Error desconocido al crear la receta.');
            });
        }
        return response.json();
    })
    .then(medRequestData => {
        console.log('MedicationRequest Success:', medRequestData);
        alert('Receta creada exitosamente!');

        // 2. Si el checkbox de confirmación está marcado, proceder con MedicationAdministration
        if (confirmMedicationAdmin) {
            const medicationAdministration = {
                resourceType: "MedicationAdministration",
                status: "completed", // Estado: Completado (ya se administró)
                medicationCodeableConcept: {
                    coding: [{
                        system: "http://www.nlm.nih.gov/research/umls/rxnorm",
                        code: medicationCode, // Usar el mismo código de medicamento de la receta
                        display: medicationDisplay // Usar el mismo display del medicamento
                    }],
                    text: medicationDisplay
                },
                subject: {
                    // Referencia al paciente usando su identificador.
                    // Idealmente, aquí se usaría el ID del paciente si tu backend lo devuelve al crear/buscar un Patient.
                    // Si la MedRequest te devuelve el Patient ID, úsalo: reference: `Patient/${medRequestData.subject.reference.split('/')[1]}`
                    identifier: {
                        system: identifierSystem,
                        value: identifierValue
                    }
                },
                // Referencia a la orden (MedicationRequest) original
                request: {
                    reference: `MedicationRequest/${medRequestData.id}`, // Asume que el ID de la MedRequest está en medRequestData.id
                    display: `Orden para ${medicationDisplay}`
                },
                effectiveDateTime: new Date().toISOString(), // Fecha y hora actual de la administración
                dosage: {
                    text: dosage // La dosis administrada, directamente del formulario
                }
            };

            // Enviar la MedicationAdministration al backend
            // ¡ATENCIÓN!: Reemplaza 'https://meds-backend-fjhd.onrender.com/medication-administration'
            // con el endpoint correcto de tu backend para MedicationAdministration
            return fetch('https://meds-backend-fjhd.onrender.com/medication-administration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(medicationAdministration)
            });
        }
        // Si no se confirma la administración, no hace nada más y resuelve la promesa.
        return Promise.resolve(null);
    })
    .then(medAdminResponse => {
        // Solo procesa si se envió una MedicationAdministration
        if (medAdminResponse) {
            if (!medAdminResponse.ok) {
                return medAdminResponse.json().then(errorData => {
                    throw new Error(errorData.issue ? errorData.issue[0].diagnostics : 'Error desconocido al confirmar la entrega del medicamento.');
                });
            }
            return medAdminResponse.json();
        }
        return null;
    })
    .then(medAdminData => {
        if (medAdminData) {
            console.log('MedicationAdministration Success:', medAdminData);
            alert('Confirmación de entrega de medicamento registrada exitosamente!');
        }
        // Limpiar el formulario
        document.getElementById('MedicamentosForm').reset();
    })
    .catch(error => {
        console.error('Error general:', error);
        alert('Hubo un error en el proceso: ' + error.message);
    });
});