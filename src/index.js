import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './containers/App'
import './styles/app.css'
import configureStore from './store/configureStore'
import Cookies from 'js-cookie'

const store = configureStore()

// if (!Cookies.get('state')) {
//   Cookies.set('state', store.getState().control, {expires: 2});
// } 

// store.subscribe(() => {
//   let cookies = JSON.parse(Cookies.get('state'));  
//   cookies = {...cookies, ...store.getState().control};
//   Cookies.set('state', cookies);
// })

store.subscribe(() => {
  let state = store.getState();
  Cookies.set('ctrVal', document.querySelector('.ctrInput').value, {expires: 1});
  if (Object.keys(state.to).length === 0 || Object.keys(state.from).length === 0) return;
  Cookies.set('dt', {from:store.getState().from, to:store.getState().to}, {expires: 1})
})



render(
  <Provider store={store}>
      <App />
  </Provider>,
  document.getElementById('root')
)
