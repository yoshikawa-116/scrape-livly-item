import React from 'react'
import './DropZone.scss'
import { useDropzone } from 'react-dropzone'

type onDropType = (files: Array<File>) => void
type Props = {
  onDrop: onDropType
}

const DropZone: React.FC<Props> = React.memo(({onDrop}: Props) => {
  const {getRootProps, getInputProps} = useDropzone({onDrop})
  return (
    <div className="DropZone">
      <div { ...getRootProps({className: 'dropzone'}) }>
        <input { ...getInputProps() } accept="image/*" />
        <p>Drag and drop some image files here, or click to select image files</p>
      </div>
    </div>
  )
})

export default DropZone
