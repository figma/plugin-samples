import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './ui.css'
import Logo from './logo.svg'

declare function require(path: string): any

const App = () => {
  let textbox: HTMLInputElement;

  const countRef = (element: HTMLInputElement) => {
    if (element) element.value = '5'
    textbox = element
  }

  const onCreate = () => {
    const count = parseInt(textbox.value, 10)
    parent.postMessage({ pluginMessage: { type: 'create-rectangles', count } }, '*')
  }

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
  }

  render() {
    return <div>
      <img src={Logo} />
      <h2>Rectangle Creator</h2>
      <p>Count: <input ref={countRef} /></p>
      <button id="create" onClick={onCreate}>Create</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  }
}

ReactDOM.render(<App />, document.getElementById('react-page'))
