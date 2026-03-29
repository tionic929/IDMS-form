import api from '@/api/axios';

/**
 * Submit a STUDENT ID card application.
 * Requires full details including guardian name, guardian contact, and course.
 */
export const submitApplication = (formData: FormData) =>
    api.post('/students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const submitEmployeeApplication = (formData: FormData) =>
    api.post('/students/employee', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });