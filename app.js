            const medicationRequest = {
                resourceType: "MedicationRequest",
                status: "active",
                intent: "order",
                subject: {
                    identifier: {
                        system: identifierSystem,
                        value: identifierValue
                    },
                    display: `${name} ${familyName}`
                },
                medicationCodeableConcept: {
                    coding: [
                        {
                            system: "http://www.nlm.nih.gov/research/umls/rxnorm",
                            code: medicationCode,
                            display: medicationDisplay
                        }
                    ]
                },
                dosageInstruction: [
                    {
                        text: `${dosage}, cada ${frequency} horas por ${duration} días`
                    }
                ],
                authoredOn: new Date().toISOString()
            };

            const deliveryInfo = {
                deliveryDate: deliveryDate || null,
                deliveredBy: deliveredBy || null,
                deliveryStatus: deliveryStatus || "pending"
            };

            
            fetch('https://meds2-backend-0f8w.onrender.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(medicationRequest)
            })
            .then(response => {
                if (!response.ok) throw new Error('Error al registrar la solicitud');
                return response.json();
            })
            .then(data => {
                console.log('Respuesta del servidor:', data);
                showMessage('Receta creada y entrega registrada correctamente.', 'success');
                document.getElementById('MedicamentosForm').reset(); // limpiar el formulario
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('Ocurrió un error al enviar los datos.', 'error');
            });
