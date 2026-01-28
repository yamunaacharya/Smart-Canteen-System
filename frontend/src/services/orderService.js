import api from './api';

export async function createOrder(items) {
  const res = await api.post('/orders', { items });
  return res.data;
}

export async function decreaseItemQuantity(itemId, quantity) {
  const res = await api.patch(`/menu/${itemId}/quantity`, { decreaseBy: quantity });
  return res.data;
}

export async function getUserOrders() {
  const res = await api.get('/orders');
  return res.data;
}

export async function getOrderById(orderId) {
  const res = await api.get(`/orders/${orderId}`);
  return res.data;
}
