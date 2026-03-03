import { useState, useEffect, useRef } from 'react';

const RECONNECT_INTERVAL = 3000;

export const useTelemetry = (endpoint = 'ws/dashboard/telemetry/') => {
    const [data, setData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const ws = useRef(null);

    useEffect(() => {
        const connect = () => {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = 'localhost:8000'; // TODO: Make dynamic based on env
            const url = `${protocol}//${host}/${endpoint}`;

            ws.current = new WebSocket(url);

            ws.current.onopen = () => {
                setIsConnected(true);
                setError(null);
                console.log('Telemetry Stream Connected');
            };

            ws.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'telemetry_update') {
                        setData(message.data);
                    }
                } catch (e) {
                    console.error('Telemetry parse error:', e);
                }
            };

            ws.current.onclose = () => {
                setIsConnected(false);
                console.log('Telemetry Stream Disconnected. Reconnecting...');
                setTimeout(connect, RECONNECT_INTERVAL);
            };

            ws.current.onerror = (err) => {
                console.error('Telemetry WebSocket Error:', err);
                setError(err);
                ws.current.close();
            };
        };

        connect();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [endpoint]);

    return { data, isConnected, error };
};
