import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { api } from './services/api';
import './styles/app.css';

const categories = ['base','sauce','cheese','veggie'];

function groupInventory(items){
    return items.reduce((groups,item) => {
        groups[item.category] = groups[item.category] || [];
        groups[item.category].push(item);
        return groups;
    }, {});
}

function Auth({ onAuth }){
    const [mode,setMode] = useState('login');
    const [form,setForm] = useState({ name:'', email:'', password:'', role:'user' });
    const [message,setMessage] = useState('');

    async function submit(event){
        event.preventDefault();
        setMessage('');
        try{
            const data = await api(mode === 'login' ? '/auth/login' : '/auth/register', {
                method:'POST',
                body:form
            });
            localStorage.setItem('pizzaToken', data.token);
            localStorage.setItem('pizzaUser', JSON.stringify(data.user));
            onAuth(data.user);
        }catch(error){
            setMessage(error.message);
        }
    }

    return (
        <main className="auth-shell">
            <section className="auth-copy">
                <p>SliceCraft</p>
                <h1>Build your custom pizza and track it live.</h1>
                <span>React, Node, MongoDB, JWT auth, Razorpay test checkout and admin inventory in one project.</span>
            </section>
            <section className="auth-card">
                <div className="tabs">
                    <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
                    <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
                </div>
                <form onSubmit={submit}>
                    {mode === 'register' && <input placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name:e.target.value })} />}
                    <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email:e.target.value })} />
                    <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password:e.target.value })} />
                    {mode === 'register' && (
                        <select value={form.role} onChange={e => setForm({ ...form, role:e.target.value })}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    )}
                    <button type="submit">{mode === 'login' ? 'Login' : 'Create Account'}</button>
                    <small>{message}</small>
                </form>
            </section>
        </main>
    );
}

function PizzaBuilder({ inventory, onOrderCreated }){
    const [selected,setSelected] = useState({ base:'', sauce:'', cheese:'', veggies:[] });
    const grouped = useMemo(() => groupInventory(inventory), [inventory]);

    const amount = useMemo(() => {
        const ids = [selected.base, selected.sauce, selected.cheese, ...selected.veggies];
        return inventory.filter(item => ids.includes(item._id)).reduce((sum,item) => sum + item.price, 0);
    }, [inventory, selected]);

    function chooseVeggie(id){
        setSelected(current => ({
            ...current,
            veggies:current.veggies.includes(id) ? current.veggies.filter(item => item !== id) : [...current.veggies, id]
        }));
    }

    async function placeOrder(){
        const orderData = await api('/orders', { method:'POST', body:selected });
        await api(`/orders/${orderData.order._id}/confirm-payment`, { method:'POST', body:{ paymentId:'test_payment_success' } });
        onOrderCreated();
        setSelected({ base:'', sauce:'', cheese:'', veggies:[] });
    }

    return (
        <section className="panel">
            <div className="panel-title">
                <div>
                    <p>Pizza Builder</p>
                    <h2>Create your custom pizza</h2>
                </div>
                <strong>Rs. {amount}</strong>
            </div>
            {categories.map(category => (
                <div className="choice-group" key={category}>
                    <h3>{category}</h3>
                    <div className="choice-grid">
                        {(grouped[category] || []).map(item => {
                            const active = category === 'veggie' ? selected.veggies.includes(item._id) : selected[category] === item._id;
                            return (
                                <button
                                    className={active ? 'choice active' : 'choice'}
                                    key={item._id}
                                    disabled={item.stock <= 0}
                                    onClick={() => category === 'veggie' ? chooseVeggie(item._id) : setSelected({ ...selected, [category]:item._id })}
                                >
                                    <span>{item.name}</span>
                                    <small>Rs. {item.price} | Stock {item.stock}</small>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
            <button className="primary" disabled={!selected.base || !selected.sauce || !selected.cheese} onClick={placeOrder}>Pay Test Mode and Place Order</button>
        </section>
    );
}

function UserDashboard({ inventory, refreshInventory }){
    const [orders,setOrders] = useState([]);

    async function loadOrders(){
        setOrders(await api('/orders/mine'));
    }

    useEffect(() => { loadOrders(); }, []);

    async function afterOrder(){
        await loadOrders();
        await refreshInventory();
    }

    return (
        <>
            <PizzaBuilder inventory={inventory} onOrderCreated={afterOrder} />
            <section className="panel">
                <h2>My Orders</h2>
                <div className="orders">
                    {orders.map(order => (
                        <article key={order._id}>
                            <strong>{order.status}</strong>
                            <span>Payment: {order.paymentStatus} | Rs. {order.amount}</span>
                            <small>{order.items.map(item => item.name).join(', ')}</small>
                        </article>
                    ))}
                    {!orders.length && <p className="muted">No orders yet.</p>}
                </div>
            </section>
        </>
    );
}

function AdminDashboard({ inventory, refreshInventory }){
    const [orders,setOrders] = useState([]);

    async function loadOrders(){
        setOrders(await api('/orders'));
    }

    useEffect(() => { loadOrders(); }, []);

    async function updateStock(item, stock){
        await api(`/inventory/${item._id}`, { method:'PUT', body:{ ...item, stock:Number(stock) } });
        refreshInventory();
    }

    async function updateStatus(order, status){
        await api(`/orders/${order._id}/status`, { method:'PATCH', body:{ status } });
        loadOrders();
    }

    return (
        <>
            <section className="panel">
                <h2>Inventory Management</h2>
                <div className="inventory">
                    {inventory.map(item => (
                        <article className={item.stock < item.threshold ? 'low' : ''} key={item._id}>
                            <div>
                                <strong>{item.name}</strong>
                                <small>{item.category} | Threshold {item.threshold}</small>
                            </div>
                            <input type="number" defaultValue={item.stock} onBlur={e => updateStock(item, e.target.value)} />
                        </article>
                    ))}
                </div>
            </section>
            <section className="panel">
                <h2>Order Control</h2>
                <div className="orders">
                    {orders.map(order => (
                        <article key={order._id}>
                            <strong>{order.user?.name || 'Customer'} - Rs. {order.amount}</strong>
                            <span>{order.items.map(item => item.name).join(', ')}</span>
                            <select value={order.status} onChange={e => updateStatus(order, e.target.value)}>
                                <option>Order Received</option>
                                <option>In The Kitchen</option>
                                <option>Sent To Delivery</option>
                            </select>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}

function App(){
    const [user,setUser] = useState(() => JSON.parse(localStorage.getItem('pizzaUser') || 'null'));
    const [inventory,setInventory] = useState([]);

    async function refreshInventory(){
        setInventory(await api('/inventory'));
    }

    useEffect(() => {
        if(user) refreshInventory();
    }, [user]);

    function logout(){
        localStorage.removeItem('pizzaToken');
        localStorage.removeItem('pizzaUser');
        setUser(null);
    }

    if(!user) return <Auth onAuth={setUser} />;

    return (
        <main className="dashboard">
            <header>
                <div>
                    <p>SliceCraft Pizza</p>
                    <h1>{user.role === 'admin' ? 'Admin Dashboard' : 'Pizza Dashboard'}</h1>
                </div>
                <button onClick={logout}>Logout</button>
            </header>
            {user.role === 'admin'
                ? <AdminDashboard inventory={inventory} refreshInventory={refreshInventory} />
                : <UserDashboard inventory={inventory} refreshInventory={refreshInventory} />}
        </main>
    );
}

createRoot(document.getElementById('root')).render(<App />);
