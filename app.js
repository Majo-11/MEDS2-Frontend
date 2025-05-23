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
                        system: identifierSystem,
                        value: identifierValue
                    },
                    display: `${name} ${familyName}`
                },
                dosageInstruction: [{
                    text: `Tomar ${dosage} cada ${frequency} horas durante ${duration} días`
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

            // --- DEBUGGING: Log the payload before sending ---
            console.log('Payload being sent to backend:', JSON.stringify(medicationRequest, null, 2));

            // Send the request to the backend
            fetch('https://meds-backend-fjhd.onrender.com/medication-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(medicationRequest)
            })
            .then(response => {
                // --- DEBUGGING: Log the raw response status and headers ---
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);

                if (!response.ok) {
                    // If response is not OK (e.g., 400, 500 status), throw an error
                    return response.json().then(errorData => {
                        // --- DEBUGGING: Log error data from backend ---
                        console.error('Error data from backend:', errorData);
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
                console.error('Error during fetch operation:', error);
                showMessage(`Error al crear la receta: ${error.message}`, 'error');
            });
        });