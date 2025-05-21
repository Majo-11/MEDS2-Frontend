document.getElementById('patientForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Obtener los valores del formulario
    const name = document.getElementById('name').value;
    const familyName = document.getElementById('familyName').value;
    const identifierSystem = document.getElementById('identifierSystem').value;
    const identifierValue = document.getElementById('identifierValue').value;
    const cellPhone = document.getElementById('cellPhone').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const postalCode = document.getElementById('postalCode').value;
    const medicationReceived = document.getElementById('medicationReceived').checked;
    const medicationName = document.getElementById('medicationName').value; // Agrega un campo para el nombre del medicamento
    const medicationDosage = document.getElementById('medicationDosage').value; // Agrega un campo para la dosis

    // Crear el objeto Patient en formato FHIR (si aún necesitas crear el paciente)
    const patient = {
        resourceType: "Patient",
        name: [{
            use: "official",
            given: [name],
            family: familyName
        }],
        identifier: [{
            system: identifierSystem,
            value: identifierValue
        }],
        telecom: [{
            system: "phone",
            value: cellPhone,
            use: "home"
        }, {
            system: "email",
            value: email,
            use: "home"
        }],
        address: [{
            use: "home",
            line: [address],
            city: city,
            postalCode: postalCode,
            country: "Colombia"
        }]
    };

    // Objeto MedicationAdministration en formato FHIR
    const medicationAdministration = {
        resourceType: "MedicationAdministration",
        status: "completed", // El medicamento ya fue administrado
        medicationCodeableConcept: {
            coding: [{
                system: "http://www.nlm.nih.gov/research/umls/rxnorm", // Ejemplo de sistema de codificación, ajusta según necesidad
                code: "YourMedicationCode", // Reemplaza con un código real del medicamento si tienes uno
                display: medicationName // Nombre del medicamento del formulario
            }],
            text: medicationName // Nombre legible del medicamento
        },
        subject: {
            reference: `Patient?identifier=${identifierSystem}|${identifierValue}` // Referencia al paciente por su identificador
        },
        effectiveDateTime: new Date().toISOString(), // Fecha y hora actual de la administración
        dosage: {
            text: medicationDosage // Dosis del medicamento
        }
    };

    // ---
    // Enviar el Patient (si es necesario)
    // ---
    // Si ya tienes un paciente existente y solo quieres registrar la administración del medicamento,
    // puedes omitir esta parte y solo enviar el MedicationAdministration.
    // Si necesitas crear el paciente y luego registrar la administración, encadena las promesas.

    fetch('https://hl7-fhir-ehr-majo-backend.onrender.com/patient', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(patient)
    })
    .then(response => response.json())
    .then(patientData => {
        console.log('Patient Success:', patientData);
        alert('Paciente creado exitosamente!');

        // Una vez que el paciente es creado (o si ya existe), enviar la administración del medicamento
        if (medicationReceived) { // Solo enviar si el checkbox está marcado
            return fetch('https://hl7-fhir-ehr-majo-backend.onrender.com/MedicationAdministration', { // Asegúrate de que tu backend tenga un endpoint para MedicationAdministration
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(medicationAdministration)
            });
        }
        return Promise.resolve(null); // Si no se marca, no hace nada más
    })
    .then(medicationAdminResponse => {
        if (medicationAdminResponse) {
            return medicationAdminResponse.json();
        }
        return null;
    })
    .then(medicationAdminData => {
        if (medicationAdminData) {
            console.log('Medication Administration Success:', medicationAdminData);
            alert('Administración de medicamento registrada exitosamente!');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Hubo un error al procesar la solicitud.');
    });
});