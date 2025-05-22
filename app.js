document.getElementById('MedicamentosForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Obtener los valores del formulario
    const name = document.getElementById('name').value.trim();
    const familyName = document.getElementById('familyName').value.trim();
    const identifierSystem = document.getElementById('identifierSystem').value.trim();
    const identifierValue = document.getElementById('identifierValue').value.trim();
    const medicationCode = document.getElementById('medicationCode').value.trim();
    const medicationDisplay = document.getElementById('medicationDisplay').value.trim();
    const dosage = document.getElementById('dosage').value.trim();
    const frequency = document.getElementById('frequency').value.trim();
    const duration = document.getElementById('duration').value.trim();
    const confirmMedicationAdmin = document.getElementById('confirmMedicationAdmin').checked;

    // ✅ Validaciones básicas
    if (!name || !familyName || !identifierSystem || !identifierValue || 
        !medicationCode || !medicationDisplay || !dosage || !frequency || !duration) {
        alert('Por favor, completa todos los campos del formulario.');
        return;
    }

    // Validaciones numéricas
    if (isNaN(frequency) || isNaN(duration)) {
        alert('Frecuencia y duración deben ser números válidos.');
        return;
    }

    // Construir el objeto MedicationRequest
    const medicationRequest = {
        resourceType: "MedicationRequest",
        status: "active",
        intent: "order",
        medicationCodeableConcept: {
            coding: [{
                system: "http://www.nlm.nih.gov/research/umls/rxnorm",
                code: medicationCode,
                display: medicationDisplay
            }],
            text: medicationDisplay
        },
        subject: {
            identifier: {
                system: identifierSystem,
                value: identifierValue
            },
            display: `${name} ${familyName}`
        },
        dosageInstruction: [{
            text: `Tomar ${dosage} cada ${frequency} horas durante ${duration} días`
        }]
    };

    // Enviar MedicationRequest
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
                throw new Error(errorData.issue?.[0]?.diagnostics || 'Error al crear la receta.');
            });
        }
        return response.json();
    })
    .then(medRequestData => {
        console.log('MedicationRequest Success:', medRequestData);
        alert('¡Receta creada exitosamente!');

        // Validar si se confirmó la administración del medicamento
        if (confirmMedicationAdmin) {
            const medicationAdministration = {
                resourceType: "MedicationAdministration",
                status: "completed",
                medicationCodeableConcept: {
                    coding: [{
                        system: "http://www.nlm.nih.gov/research/umls/rxnorm",
                        code: medicationCode,
                        display: medicationDisplay
                    }],
                    text: medicationDisplay
                },
                subject: {
                    identifier: {
                        system: identifierSystem,
                        value: identifierValue
                    }
                },
                request: {
                    reference: `MedicationRequest/${medRequestData.id}`,
                    display: `Orden para ${medicationDisplay}`
                },
                effectiveDateTime: new Date().toISOString(),
                dosage: {
                    text: dosage
                }
            };

            return fetch('https://meds-backend-fjhd.onrender.com/medication-administration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(medicationAdministration)
            });
        }
        return null;
    })
    .then(medAdminResponse => {
        if (medAdminResponse && !medAdminResponse.ok) {
            return medAdminResponse.json().then(errorData => {
                throw new Error(errorData.issue?.[0]?.diagnostics || 'Error al confirmar entrega del medicamento.');
            });
        }
        return medAdminResponse ? medAdminResponse.json() : null;
    })
    .then(medAdminData => {
        if (medAdminData) {
            console.log('MedicationAdministration Success:', medAdminData);
            alert('¡Entrega del medicamento registrada exitosamente!');
        }
        // Limpiar formulario
        document.getElementById('MedicamentosForm').reset();
    })
    .catch(error => {
        console.error('Error general:', error);
        alert('Error: ' + error.message);
    });
});
