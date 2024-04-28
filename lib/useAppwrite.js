import { useEffect, useState } from "react";
import { Alert } from "react-native";

const useAppwrite = (fn) => {
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState([]);

    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);

        try {
            const response = await fn();
            setData(response);
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);

        await refetch();

        setRefreshing(false);
    };

    const refetch = () => {
        fetchData();
    }

    return { data, onRefresh, refreshing, refetch, loading }
}

export default useAppwrite