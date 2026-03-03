import { useState, useEffect } from 'react';
import axios from 'axios';

// API Base URL
const API_BASE = 'http://localhost:8000/api/v1/farmers';

export const useCommandHierarchy = () => {
    const [level, setLevel] = useState('national'); // national, state, district, mandal
    const [parentId, setParentId] = useState(null);
    const [hierarchyData, setHierarchyData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [breadcrumbs, setBreadcrumbs] = useState([{ label: 'National', id: null, level: 'national' }]);

    useEffect(() => {
        fetchHierarchyData();
    }, [level, parentId]);

    const fetchHierarchyData = async () => {
        setLoading(true);
        try {
            let url = `${API_BASE}/v2/stats/${level}/`;
            if (parentId) {
                url += `${parentId}/`;
            }

            const response = await axios.get(url);
            setHierarchyData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Hierarchy Fetch Error:", error);
            setLoading(false);
        }
    };

    const drillDown = (newLevel, newItem) => {
        setLevel(newLevel);
        setParentId(newItem.id || newItem.state || newItem.district); // Handle dynamic ID keys

        // Update Breadcrumbs
        setBreadcrumbs(prev => [
            ...prev,
            { label: newItem.state || newItem.district || newItem.mandal || 'Selection', id: newItem.id, level: newLevel }
        ]);
    };

    const resetHierarchy = (index) => {
        const target = breadcrumbs[index];
        setBreadcrumbs(prev => prev.slice(0, index + 1));
        setLevel(target.level);
        setParentId(target.id);
    };

    return {
        level,
        hierarchyData,
        loading,
        drillDown,
        breadcrumbs,
        resetHierarchy
    };
};
