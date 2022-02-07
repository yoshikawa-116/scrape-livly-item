import React from 'react'

const useCrop = () => {
  const cropImage = React.useCallback((file: File, x: number, y: number, width: number, height: number): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const src = new Image()
      src.onload = () => {
        const cvs = document.createElement('canvas')
        cvs.width = width
        cvs.height = height
        const ctx = cvs.getContext('2d')
        if (ctx) {
          ctx.drawImage(src, -x, -y)
          const dst = new Image()
          dst.src = cvs.toDataURL()
          src.remove()
          cvs.remove()
          resolve(dst)
        }
      }
      src.src = URL.createObjectURL(file)
    })
  }, [])

  return cropImage
}

export default useCrop
