import { useState, useCallback } from 'react';
import { diseaseAPI } from '../../../services/apiService';

export function useDiseaseDetection() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [jobId, setJobId] = useState(null);
    const [modelTraining, setModelTraining] = useState(false);
    const [error, setError] = useState(null);

    const analyzeImage = useCallback(async (file) => {
        setLoading(true);
        setResult(null);
        setError(null);
        setModelTraining(false);
        setUploadedImage(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append('image', file);

        try {
            const resp = await diseaseAPI.detect(formData);

            if (resp.status === 503 || resp.status === 'model_not_found') {
                setModelTraining(true);
                setLoading(false);
                return;
            }

            if (resp.job_id) {
                setJobId(resp.job_id);
                // Poll for result
                let attempts = 0;
                const poll = setInterval(async () => {
                    attempts++;
                    try {
                        const resultResp = await diseaseAPI.getResult(resp.job_id);
                        if (resultResp.status === 'completed') {
                            clearInterval(poll);
                            setResult(resultResp.result);
                            setLoading(false);
                        } else if (resultResp.status === 'failed') {
                            clearInterval(poll);
                            setError('Disease analysis failed. Please try again.');
                            setLoading(false);
                        } else if (attempts >= 30) {
                            clearInterval(poll);
                            setError('Analysis timed out. Please try again.');
                            setLoading(false);
                        }
                    } catch {
                        clearInterval(poll);
                        setError('Failed to check analysis status.');
                        setLoading(false);
                    }
                }, 2000);
            } else {
                // Direct result (no async job)
                setResult(resp);
                setLoading(false);
            }
        } catch (err) {
            if (err?.status === 503) {
                setModelTraining(true);
            } else {
                setError(err.message || 'Upload failed. Check your connection.');
            }
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setResult(null);
        setUploadedImage(null);
        setJobId(null);
        setModelTraining(false);
        setError(null);
    }, []);

    return { analyzeImage, reset, loading, result, uploadedImage, modelTraining, error, jobId };
}
