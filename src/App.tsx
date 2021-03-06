import React from 'react'
import './App.scss'
import ReactLoading from 'react-loading'
import FormControl from '@mui/material/FormControl'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import Header from './components/Header'
import DropZone from './components/DropZone'
import useCrop from './hooks/useCrop'
import useOcr from './hooks/useOcr'

type Result = {
  title: string,
  attribute: string,
  description: string
}

type Rect = {
  x: number,
  y: number,
  w: number,
  h: number,
  file: File
}

function App() {
  const [files, setFiles] = React.useState<Array<File>>([])
  const [rects, setRects] = React.useState<Array<Array<Rect>>>([])
  const [results, setResults] = React.useState<Array<Result>>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [yami, setYami] = React.useState<boolean>(false)
  const cvs = React.useRef(null)
  const cropImage = useCrop()
  const recognize = useOcr()

  const getAvgValue = React.useCallback((image: ImageData, w: number, h: number) => {
    let sum = 0
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        sum += (image.data[(y * w + x) * 4 + 0] + image.data[(y * w + x) * 4 + 1] + image.data[(y * w + x) * 4 + 2]) / 3
      }
    }
    return sum / (w * h)
  }, [])
  
  const getRects = React.useCallback((ctx: CanvasRenderingContext2D, file: File) => {
    const titleRect = {x: 77, y: 934, w: 596, h: 48}
    const attrRect = {x: 203, y: 859, w: 200, h: 50}
    const descRect = {x: 77, y: 1048, w: 596, h: 40}
    const rareRect = {x: 75, y: 854, w: 62, h: 60}
    const checkRect = {x:0, y: 350, w: 750, h: 40}
    if (yami) {
      titleRect.y -= 58
      attrRect.y -= 58
      descRect.y -= 58
      rareRect.y -= 58
      checkRect.y -= 58
    }
    for (let i = 0; i < 3; i++)
    {
      const checkImage = ctx.getImageData(checkRect.x, checkRect.y - 40 * i, checkRect.w, checkRect.h)
      const valueCheck = getAvgValue(checkImage, checkRect.w, checkRect.h)
      if (valueCheck < 130) break
      else {
        titleRect.y -= 35
        attrRect.y -= 35
        descRect.y -= 35
        descRect.h += 35
        rareRect.y -= 35
      }
    }
    const rareImage = ctx.getImageData(rareRect.x, rareRect.y, rareRect.w, rareRect.h)
    const valueRare = getAvgValue(rareImage, rareRect.w, rareRect.h)
    if (valueRare > 220) {
      attrRect.x -= 63
      attrRect.w += 50
    }
    return [
      {x: titleRect.x, y: titleRect.y, w: titleRect.w, h: titleRect.h , file},
      {x: attrRect.x, y: attrRect.y, w: attrRect.w, h: attrRect.h, file},
      {x: descRect.x, y: descRect.y, w: descRect.w, h: descRect.h, file}
    ]
  }, [yami, getAvgValue])

  const DrawImage = React.useCallback((file: File, rect: Array<Rect>) => {
    if (file) {
      const img = new Image()
      img.onload = () => {
        if (cvs && cvs.current) {
          (cvs.current as HTMLCanvasElement).width = img.width;
          (cvs.current as HTMLCanvasElement).height = img.height
          const ctx = (cvs.current as HTMLCanvasElement).getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0, img.width, img.height)
            ctx.beginPath()
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
            rect.forEach(rect => {
              ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
            })
          }
        }
      }
      img.src = URL.createObjectURL(file)
    }
  }, [cvs])
 
  const ExecuteOcr = React.useCallback(async() => {
    setLoading(() => true)
    setRects(() => [])
    let resultAry: Array<Result> = []
    for (let i = 0; i < rects.length; i++) {
      let result: Result = {title: '', attribute: '', description: ''}
      for (let j = 0; j < rects[i].length; j++) {
        DrawImage(rects[i][j].file, rects[i])
        await cropImage(rects[i][j].file, rects[i][j].x, rects[i][j].y, rects[i][j].w, rects[i][j].h)
          .then((img: HTMLImageElement) => recognize(img))
          // eslint-disable-next-line
          .then((text: string) => {
            if (j === 0) {
              if (text.slice(-1) === '???') text = text.slice(0, -1)
              result.title = text
            }
            if (j === 1) result.attribute = text
            if (j === 2) result.description = text;
            console.log(text)
          })
      }
      resultAry.push(result)
    }
    setResults(() => resultAry)
    setLoading(() => false)
  }, [rects, setRects, setResults, setLoading, cropImage, recognize, DrawImage])

  const ExecuteScrapeImage = React.useCallback((file: File) => {
    if (file) {
      const img = new Image()
      img.onload = () => {
        if (cvs && cvs.current) {
          (cvs.current as HTMLCanvasElement).width = img.width;
          (cvs.current as HTMLCanvasElement).height = img.height
          const ctx = (cvs.current as HTMLCanvasElement).getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0, img.width, img.height)
            const rects = getRects(ctx, file)
            ctx.beginPath()
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
            rects.forEach(rect => {
              ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
            })
            setRects(prev => [...prev, rects])
          }
        }
      }
      img.src = URL.createObjectURL(file)
    }
  }, [setRects, cvs, getRects])

  React.useEffect(() => {
    files.forEach(file => ExecuteScrapeImage(file))
  }, [files, ExecuteScrapeImage])
  
  const check = rects.length !== 0 && files.length === rects.length
  React.useEffect(() => {
    if (check) ExecuteOcr()
  }, [check, ExecuteOcr])

  const onDrop = React.useCallback((acceptedFiles: Array<File>) => {
    if (loading) {
      window.alert('?????????????????????????????????????????????????????????????????????')
    } else {
      acceptedFiles.sort()
      setFiles(() => acceptedFiles)
      setRects(() => [])
      setResults(() => [])
    }
  }, [setFiles, setRects, setResults, loading])
  const onChangeRadio = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(() => [])
    setRects(() => [])
    setResults(() => [])
    setYami(() => (e.target as HTMLInputElement).value === 'true')
  }, [setFiles, setRects, setResults, setYami])

  return (
    <div className="App">
      <Header />
      <main>
        <DropZone onDrop={onDrop} />
        <div className="item-type">
          <FormControl>
            <RadioGroup row value={yami} onChange={onChangeRadio}>
              <FormControlLabel value={false} control={<Radio />} label="??????????????????" />
              <FormControlLabel value={true} control={<Radio />} label="??????????????????????????????" />
            </RadioGroup>
          </FormControl>
        </div>
        <div className="container">
          <div>
            <canvas className="canvas" ref={cvs} />
          </div>
          <div className="output">
            {
              loading ? 
                <ReactLoading className="loading" type="spinningBubbles" color="#aaf" /> :
                results.map((result, index) => (
                  <div key={index} className="result_line">
                    {result.title},{result.attribute},{result.description}
                  </div>
                ))
            }
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
