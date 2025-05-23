document.getElementById('MedicamentosForm').addEventListener('submit', function(event) {
  event.preventDefault();

  // Obtener los valores del formulario
  const name = document.getElementById('name').value;
  const familyName = document.getElementById('familyName').value;
  const identifierSystem = document.getElementById('identifierSystem').value;
  const identifierValue = document.getElementById('identifierValue').value;
  const medicationCode = document.getElementById('medicationCode').value;
  const medicationDisplay = document.getElementById('medicationDisplay').value;
  const dosage = document.getElementById('dosage').value;
  const frequency = document.getElementById('frequency').value;
  const duration = document.getElementById('duration').value;

  // Crear el objeto MedicationRequest
  const medicationRequest = {
    resourceType: "MedicationRequest",
    status: "active",
    intent: "order",
    medicationCodeableConcept: {
      coding: [{
        system: "http://www.nlm.nih.gov/research/umls/rxnorm",
        code: medicationCode,
        display: medicationDisplay
      }]
    },
    subject: {
      identifier: {
        system: identifierSystem,
        value: identifierValue
      },
      display: ${name} ${familyName}
    },
    dosageInstruction: [{
      text: Tomar ${dosage} cada ${frequency} horas durante ${duration} días
    }]
  };

  // Enviar la solicitud al backend
  fetch('https://meds-backend-fjhd.onrender.com/medication-request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(medicationRequest)
  })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      alert('Receta creada exitosamente');
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al crear la receta');
    });
});