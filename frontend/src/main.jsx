import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
<<<<<<< HEAD

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
=======
import { Provider } from 'react-redux'
import store from './redux/store'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>  
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
>>>>>>> a8d0173 (added feture games)
)
