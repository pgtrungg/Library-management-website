import {createSlice} from '@reduxjs/toolkit';

const initialState = localStorage.getItem('cart')
    ? JSON.parse(localStorage.getItem('cart'))
    : [];

const saveToLocalStorage = (state) => {
    localStorage.setItem('cart', JSON.stringify(state));
    return state;
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addBook: (state, action) => {
            // Check if the book is already in the cart and increment the quantity
            let book = state.find(book => book._id === action.payload._id);
            if (book) {
                book.quantity += action.payload.quantity;
            } else {
                state.push(action.payload);
            }
            saveToLocalStorage(state);
        },
        removeBook: (state, action) => {
            return saveToLocalStorage(state.filter(book => book._id !== action.payload._id));

        },
        clearCart: () => {
            localStorage.removeItem('cart');
            return [];
        }
    }

});


export const {addBook, removeBook, clearCart} = cartSlice.actions;
export default cartSlice.reducer;