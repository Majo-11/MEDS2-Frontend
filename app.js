document.getElementById('medicationConfirmationForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Obtener los valores del formulario
    const identifierSystem = document.getElementById('identifierSystem').value;
    const identifierValue = document.getElementById('identifierValue').value;
    const medicationName = document.getElementById('medicationName').value;
    const medicationDosage = document.getElementById('medicationDosage').value;
    const medicationReceived = document.getElementById('medicationReceived').checked;

    // Solo procede si el medicamento fue recibido
    if (!medicationReceived) {
        alert('Por favor, marca la casilla "Medicamento Recibido" para confirmar la administración.');
        return;
    }

    // Objeto MedicationAdministration en formato FHIR
    const medicationAdministration = {
        resourceType: "MedicationAdministration",
        status: "completed", // El medicamento ya fue administrado
        medicationCodeableConcept: {
            coding: [{
                // Puedes ajustar el sistema de codificación si tienes uno específico (ej. RxNorm)
                system: "http://example.org/fhir/ValueSet/medication-codes", // O un sistema real como "http://www.nlm.nih.gov/research/umls/rxnorm"
                code: "XYZ123", // Reemplaza con un código real del medicamento si tienes uno
                display: medicationName // Nombre legible del medicamento
            }],
            text: medicationName // Nombre legible del medicamento
        },
        subject: {
            // Referencia al paciente usando su identificador
            reference: `Patient?identifier=${identifierSystem}|${identifierValue}`
        },
        effectiveDateTime: new Date().toISOString(), // Fecha y hora actual de la administración
        dosage: {
            text: medicationDosage // Dosis del medicamento
        }
    };

    // Enviar los datos usando Fetch API al endpoint de MedicationAdministration
    fetch('https://hl7-fhir-ehr-majo-backend.onrender.com/MedicationAdministration', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(medicationAdministration)
    })
    .then(response => {
        if (!response.ok) {
            // Si la respuesta no es 2xx (ej. 400, 500), lanzar un error
            return response.json().then(errorData => {
                throw new Error(errorData.issue ? errorData.issue[0].diagnostics : 'Error desconocido al procesar la solicitud.');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert('Confirmación de medicamento registrada exitosamente!');
        // Opcional: Limpiar el formulario después del éxito
        document.getElementById('medicationConfirmationForm').reset();
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Hubo un error al registrar la confirmación del medicamento: ' + error.message);
    });
});