import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateStock, Product, syncStockLog, fetchStockItems } from './stockSlice';
import { useRoute } from '@react-navigation/native';

export default function StoreroomDetailScreen() {
    const route = useRoute<any>();
    const { storeroomId, name } = route.params;
    const dispatch = useDispatch();

    const products = useSelector((state: RootState) => state.stock.products);
    const stockItems = useSelector((state: RootState) => state.stock.stockItems);
    const user = useSelector((state: RootState) => state.auth.user);

    React.useEffect(() => {
        // Ensure we have the latest stock data when viewing the storeroom
        // @ts-ignore
        dispatch(fetchStockItems());
    }, [dispatch]);

    // Helper to find stock for this product + storeroom + size
    const getStock = (productId: string, size: string) => {
        // Debugging logs
        // console.log(`Checking Stock: Prod=${productId}, Room=${storeroomId}, Size=${size}`);
        // console.log('Sample Item:', stockItems[0]);

        const item = stockItems.find(si =>
            // Loose comparison for IDs just in case
            String(si.productId) === String(productId) &&
            String(si.storeroomId) === String(storeroomId) &&
            si.size === size
        );
        return item ? item.quantity : 0;
    };

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [modalVisible, setModalVisible] = useState(false);
    const [amountStr, setAmountStr] = useState('');
    const [actionType, setActionType] = useState<'add' | 'remove'>('add');

    const handleAdjustStock = (product: Product, size: string, type: 'add' | 'remove') => {
        setSelectedProduct(product);
        setSelectedSize(size);
        setActionType(type);
        setAmountStr('');
        setModalVisible(true);
    };

    const confirmAdjustment = () => {
        if (!selectedProduct || !user || !selectedSize) return;

        const amount = parseInt(amountStr, 10);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid positive number.');
            return;
        }

        const currentQty = getStock(selectedProduct.id, selectedSize);
        let newQty = currentQty;

        if (actionType === 'add') {
            newQty += amount;
        } else {
            if (currentQty < amount) {
                Alert.alert('Error', 'Insufficient stock to remove.');
                return;
            }
            newQty -= amount;
        }

        // Update local state
        dispatch(updateStock({
            productId: selectedProduct.id,
            storeroomId,
            size: selectedSize,
            quantity: newQty
        }));

        // Sync with backend (Log)
        // @ts-ignore
        dispatch(syncStockLog({
            productId: selectedProduct.id,
            storeroomId,
            size: selectedSize,
            change: amount,
            type: actionType
        }));

        setModalVisible(false);
    };


    // Local state for stock adjustment selection inside each item? 
    // Actually, managing state for each item in a FlatList is tricky if we use local state.
    // Better to have a Modal or a specific "Manage Stock" button that opens a focused view.

    // Let's refactor renderItem to just show total stock and a "Manage" button.
    // Or, following the user request: "In the inventory section, implement a dropdown menu for selecting item sizes... Once a size is selected... input quantity".
    // I will implement this logic *inside the Modal* which triggered by "Adjust Stock".

    const handleOpenAdjustment = (product: Product) => {
        setSelectedProduct(product);
        if (product.sizes.length > 0) {
            setSelectedSize(product.sizes[0].size); // Default to first size
        }
        setAmountStr('');
        setModalVisible(true);
    };

    const renderItem = ({ item }: { item: Product }) => {
        // Calculate total stock for display
        const totalStock = item.sizes.reduce((acc, s) => acc + getStock(item.id, s.size), 0);

        return (
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={styles.infoContainer}>
                        <Text style={styles.productName}>{item.name}</Text>
                        <Text style={styles.productSku}>{item.sku}</Text>
                        <View style={styles.stockBadge}>
                            <Text style={styles.stockLabel}>Total: </Text>
                            <Text style={styles.stockValue}>{totalStock}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.manageBtn} onPress={() => handleOpenAdjustment(item)}>
                        <Text style={styles.manageBtnText}>Manage</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // ... And update the Modal content to include the Dropdown (Picker)

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />

            <Modal animationType="fade" transparent={true} visible={modalVisible}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Adjust Stock</Text>
                        <Text style={styles.modalText}>{selectedProduct?.name}</Text>

                        {/* Size Selection */}
                        <Text style={{ alignSelf: 'flex-start', marginLeft: 4, marginBottom: 6, color: '#666', fontSize: 12, fontWeight: '600' }}>SELECT SIZE</Text>
                        <View style={styles.sizeContainer}>
                            {selectedProduct?.sizes.map((s) => (
                                <TouchableOpacity
                                    key={s.size}
                                    style={[styles.sizeBtn, selectedSize === s.size && styles.selectedSizeBtn]}
                                    onPress={() => setSelectedSize(s.size)}
                                >
                                    <Text style={[styles.sizeBtnText, selectedSize === s.size && styles.selectedSizeBtnText]}>{s.size}</Text>
                                    <Text style={{ fontSize: 10, color: '#999', marginTop: 2 }}>Qty: {getStock(selectedProduct.id, s.size)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Action Type */}
                        <View style={styles.typeContainer}>
                            <TouchableOpacity style={[styles.typeBtn, actionType === 'add' && styles.activeTypeBtn]} onPress={() => setActionType('add')}>
                                <Text style={[styles.typeText, actionType === 'add' && styles.activeTypeText]}>ADD STOCK</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.typeBtn, actionType === 'remove' && styles.activeTypeBtn]} onPress={() => setActionType('remove')}>
                                <Text style={[styles.typeText, actionType === 'remove' && styles.activeTypeText]}>REMOVE STOCK</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Enter Quantity"
                            keyboardType="number-pad"
                            value={amountStr}
                            onChangeText={setAmountStr}
                            placeholderTextColor="#ccc"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={confirmAdjustment}>
                                <Text style={styles.confirmBtnText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    list: { padding: 16 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginHorizontal: 2,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
        marginRight: 10,
    },
    productName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
    productSku: { fontSize: 12, color: '#666', marginBottom: 8 },

    stockBadge: {
        flexDirection: 'row',
        alignItems: 'baseline',
        backgroundColor: '#e8f5e9',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4
    },
    stockLabel: { fontSize: 12, color: '#2e7d32', fontWeight: '600' },
    stockValue: { fontSize: 14, fontWeight: 'bold', color: '#1b5e20' },

    manageBtn: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#007AFF',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 }
    },
    manageBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

    // Modal Styles
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalView: { backgroundColor: 'white', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10, width: '85%' },
    modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8, color: '#111' },
    modalText: { marginBottom: 20, textAlign: 'center', fontSize: 16, color: '#666' },

    sizeContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20, width: '100%' },
    sizeBtn: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        margin: 5,
        minWidth: 70,
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    selectedSizeBtn: { backgroundColor: '#e3f2fd', borderColor: '#2196F3' },
    sizeBtnText: { color: '#444', fontWeight: '600', fontSize: 13 },
    selectedSizeBtnText: { color: '#1976D2', fontWeight: '800' },

    typeContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#f5f5f5', borderRadius: 12, padding: 4, width: '100%' },
    typeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    activeTypeBtn: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    typeText: { fontWeight: '600', color: '#777' },
    activeTypeText: { color: '#333' },

    headerInfo: { marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
    variantRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    variantLabel: { fontSize: 14, color: '#555', fontWeight: '600' },
    actions: { flexDirection: 'row', alignItems: 'center' },
    btn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    removeBtn: { backgroundColor: '#ffebee' },
    addBtn: { backgroundColor: '#e8f5e9' },
    btnText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    qty: { marginHorizontal: 12, fontSize: 16, fontWeight: '600', minWidth: 20, textAlign: 'center' },

    // Styles
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
    stockText: { fontSize: 14, color: '#555' },
    highlight: { fontWeight: 'bold', color: '#2e7d32' },

    input: { height: 50, width: '100%', borderColor: '#ddd', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, marginBottom: 20, fontSize: 18, textAlign: 'center', backgroundColor: '#fafafa' },
    modalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
    modalBtn: { borderRadius: 10, padding: 12, elevation: 0, flex: 0.48, alignItems: 'center', justifyContent: 'center' },
    cancelBtn: { backgroundColor: '#f5f5f5' },
    confirmBtn: { backgroundColor: '#007AFF' },
    cancelBtnText: { color: '#666', fontWeight: '600' },
    confirmBtnText: { color: 'white', fontWeight: 'bold' },
});
