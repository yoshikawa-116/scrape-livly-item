import React from 'react'
import { createWorker } from 'tesseract.js'

const useOcr = () => {
  const worker = createWorker()

  const recognize = React.useCallback((img: HTMLImageElement): Promise<string> => {
    return new Promise((resolve) => {
      worker.load()
        .then(() => worker.loadLanguage('jpn'))
        .then(() => worker.initialize('jpn'))
        .then(() => worker.recognize(img))
        .then(({data: {text}}) => {
          const strippedText = text.replace(/\s+/g, '')
          resolve(strippedText)
        })
    })
  }, [worker])
  return recognize
}

export default useOcr
