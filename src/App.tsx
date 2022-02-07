import React from 'react'
import './App.scss'
import Header from './components/Header'
import DropZone from './components/DropZone'

function App() {
  const [files, setFiles] = React.useState<Array<File>>([])

  const onDrop = React.useCallback((acceptedFiles: Array<File>) => {
    setFiles(() => acceptedFiles)
  }, [])

  return (
    <div className="App">
      <Header />
      <main>
        <DropZone onDrop={onDrop} />
      </main>
    </div>
  )
}

export default App
