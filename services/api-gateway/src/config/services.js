/**
 * Service configuration
 * Defines all backend microservices and their URLs
 */

export const services = {
  auth: {
    name: 'Auth Service',
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
    timeout: 5000,
    description: 'User authentication and JWT generation'
  },
  patient: {
    name: 'Patient Service',
    url: process.env.PATIENT_SERVICE_URL || 'http://localhost:5002',
    timeout: 5000,
    description: 'Patient profiles and medical records management'
  },
  consultation: {
    name: 'Consultation Service',
    url: process.env.CONSULTATION_SERVICE_URL || 'http://localhost:5003',
    timeout: 30000,
    description: 'AI health consultation and assistance'
  },
  appointment: {
    name: 'Appointment Service',
    url: process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5004',
    timeout: 5000,
    description: 'Appointment scheduling and management'
  },
  doctor: {
    name: 'Doctor Service',
    url: process.env.DOCTOR_SERVICE_URL || 'http://localhost:5005',
    timeout: 5000,
    description: 'Doctor profiles and registration'
  },
  payment: {
    name: 'Payment Service',
    url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:5006',
    timeout: 10000,
    description: 'Payment processing and transactions'
  },
  notification: {
    name: 'Notification Service',
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5007',
    timeout: 5000,
    description: 'Email and SMS notifications'
  }
};

/**
 * Get service URL by name
 */
export const getServiceUrl = (serviceName) => {
  const service = services[serviceName];
  if (!service) {
    throw new Error(`Service '${serviceName}' not found in configuration`);
  }
  return service.url;
};

/**
 * Get all services info
 */
export const getServicesInfo = () => {
  return Object.entries(services).map(([key, value]) => ({
    key,
    ...value
  }));
};
