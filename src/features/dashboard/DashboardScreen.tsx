import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Modal } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Product, StockItem } from '../stock/stockSlice';
import { LinearGradient } from 'expo-linear-gradient';

import { useDispatch } from 'react-redux';
import { fetchProducts, fetchStockItems } from '../stock/stockSlice';
import { LogOut } from 'lucide-react-native';
import { logoutUser } from '../auth/authSlice';

export default function DashboardScreen() {
    const dispatch = useDispatch();
    const { products, stockItems } = useSelector((state: RootState) => state.stock);
    const { user } = useSelector((state: RootState) => state.auth);

    React.useEffect(() => {
        // @ts-ignore
        dispatch(fetchProducts());
        // @ts-ignore
        dispatch(fetchStockItems());
    }, [dispatch]);

    const handleLogout = () => {
        // @ts-ignore
        dispatch(logoutUser());
    };

    const getTotalQuantity = (productId: string) => {
        return stockItems
            .filter((item) => item.productId === productId)
            .reduce((sum, item) => sum + item.quantity, 0);
    };


    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
    const [modalVisible, setModalVisible] = React.useState(false);
    const { storerooms } = useSelector((state: RootState) => state.stock);

    const handleProductPress = (item: Product) => {
        setSelectedProduct(item);
        setModalVisible(true);
    };

    const getBreakdown = (productId: string, size: string) => {
        // Find all stock items for this product and size
        const items = stockItems.filter(si => si.productId === productId && si.size === size);
        const total = items.reduce((sum, i) => sum + i.quantity, 0);

        // Detailed breakdown string: "Main Office: 5, Factory: 3"
        const details = items.map(i => {
            const roomName = storerooms.find(s => s.id === i.storeroomId)?.name || i.storeroomId;
            return `${roomName}: ${i.quantity}`;
        }).join(', ');

        return { total, details };
    };

    const renderProductItem = ({ item, index }: { item: Product; index: number }) => {
        const total = getTotalQuantity(item.id);
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => handleProductPress(item)}
                activeOpacity={0.7}
            >
                <View>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productSku}>SKU: {item.sku}</Text>
                </View>
                <View style={styles.stockContainer}>
                    <Text style={styles.stockLabel}>Total Stock</Text>
                    <Text style={[styles.stockValue, total < 10 && styles.lowStock]}>{total}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#4c669f', '#3b5998']}
                style={styles.header}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={styles.title}>Dashboard</Text>
                        <Text style={styles.subtitle}>Welcome back, {user?.username}</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 }}>
                        <LogOut color="#fff" size={24} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <View style={styles.summaryContainer}>
                <Text style={styles.sectionTitle}>Global Stock Summary</Text>
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    renderItem={renderProductItem}
                    contentContainerStyle={styles.listContent}
                />
            </View>

            {/* Product Details Modal */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{selectedProduct?.name}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeIcon}>
                                <Text style={{ fontSize: 20, color: '#999', fontWeight: 'bold' }}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalSku}>{selectedProduct?.sku}</Text>

                        <View style={styles.divider} />

                        <FlatList
                            data={selectedProduct?.sizes}
                            keyExtractor={(item) => item.size}
                            renderItem={({ item }) => {
                                const { total, details } = getBreakdown(selectedProduct!.id, item.size);
                                return (
                                    <View style={styles.breakdownRow}>
                                        <Text style={styles.sizeLabel}>{item.size}</Text>
                                        <View style={{ alignItems: 'flex-end', flex: 1 }}>
                                            <Text style={styles.sizeTotal}>{total}</Text>
                                            {total > 0 && <Text style={styles.sizeDetails}>{details}</Text>}
                                        </View>
                                    </View>
                                );
                            }}
                            style={{ maxHeight: 400, width: '100%' }}
                        />

                        <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { padding: 24, paddingBottom: 32, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    subtitle: { fontSize: 16, color: '#e3e3e3', marginTop: 4 },
    summaryContainer: { flex: 1, padding: 16, marginTop: -10 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#333', marginLeft: 8 },
    listContent: { paddingBottom: 20 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginHorizontal: 4,
    },
    productName: { fontSize: 16, fontWeight: '700', color: '#333' },
    productSku: { fontSize: 13, color: '#888', marginTop: 2 },
    stockContainer: { alignItems: 'flex-end' },
    stockLabel: { fontSize: 12, color: '#888' },
    stockValue: { fontSize: 20, fontWeight: 'bold', color: '#2e7d32' },
    lowStock: { color: '#d32f2f' },

    // Modal Styles
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%', maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 5 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', flex: 1 },
    closeIcon: { padding: 5 },
    modalSku: { fontSize: 14, color: '#777', alignSelf: 'flex-start', marginBottom: 15 },
    divider: { height: 1, backgroundColor: '#eee', width: '100%', marginBottom: 10 },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f9f9f9', width: '100%' },
    sizeLabel: { fontSize: 16, fontWeight: '600', color: '#444' },
    sizeTotal: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32' },
    sizeDetails: { fontSize: 11, color: '#999', marginTop: 2 },
    closeBtn: { marginTop: 20, backgroundColor: '#2196F3', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 30, elevation: 2 },
    closeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
