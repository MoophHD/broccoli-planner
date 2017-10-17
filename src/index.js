import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './containers/App'
import './styles/app.css'
import configureStore from './store/configureStore'
import Cookies from 'js-cookie'

const store = configureStore()

if (!Cookies.get('state')) {
  Cookies.set('state', store.getState().control, {expires: 2});
} 

// store.subscribe(() => {
//   let cookies = JSON.parse(Cookies.get('state'));  
//   cookies = {...cookies, ...store.getState().control};
//   Cookies.set('state', cookies);
// })

store.subscribe(() => {
  Cookies.set('ctrVal', document.querySelector('.ctrInput').value);
})



render(
  <Provider store={store}>
      <App />
  </Provider>,
  document.getElementById('root')
)
