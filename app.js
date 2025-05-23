        function showMessage(message, type) {
            const messageBox = document.getElementById('messageBox');
            messageBox.textContent = message;
            messageBox.className = ''; // Clear existing classes
            messageBox.classList.add(type, 'show'); // Add new type and show class

            // Hide the message after 3 seconds
            setTimeout(() => {
                messageBox.classList.remove('show');
            }, 3000);
        }

        document.getElementById('MedicamentosForm').addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission

            // Get values from the form
            const name = document.getElementById('name').value;
            const familyName = document.getElementById('familyName').value;
            // identifierSystem now gets value from select
            const identifierSystem = document.getElementById('identifierSystem').value;
            const identifierValue = document.getElementById('identifierValue').value;
            const medicationCode = document.getElementById('medicationCode').value;
            const medicationDisplay = document.getElementById('medicationDisplay').value;
            const dosage = document.getElementById('dosage').value;
            const frequency = document.getElementById('frequency').value;
            const duration = document.getElementById('duration').value;

            // New delivery verification fields
            const deliveryDate = document.getElementById('deliveryDate').value;
            const deliveredBy = document.getElementById('deliveredBy').value;
            const deliveryStatus = document.getElementById('deliveryStatus').value;

            // Create the MedicationRequest object
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
                        system: identifierSystem, // This will now be "http://example.org/fhir/sid/cedula" or "http://example.org/fhir/sid/pasaporte"
                        value: identifierValue
                    },
                    display: `${name} ${familyName}` // Use template literal for display
                },
                dosageInstruction: [{
                    text: `Tomar ${dosage} cada ${frequency} horas durante ${duration} días` // Use template literal for text
                }]
            };

            // Add delivery details if available
            if (deliveryDate || deliveredBy || deliveryStatus) {
                medicationRequest.deliveryDetails = {
                    deliveryDate: deliveryDate,
                    deliveredBy: deliveredBy,
                    deliveryStatus: deliveryStatus
                };
            }

            // Send the request to the backend
            fetch('https://meds-backend-fjhd.onrender.com/medication-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(medicationRequest)
            })
            .then(response => {
                if (!response.ok) {
                    // If response is not OK (e.g., 400, 500 status), throw an error
                    return response.json().then(errorData => {
                        throw new Error(errorData.message || 'Error en la solicitud');
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
                showMessage('Receta creada y entrega registrada exitosamente!', 'success');
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage(`Error al crear la receta: ${error.message}`, 'error');
            });
        });