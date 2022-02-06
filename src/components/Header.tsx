import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

const Header: React.FC = React.memo(() => {
  return (
    <div className="Header">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Scrape Livly Item</Typography>
        </Toolbar>
      </AppBar>
    </div>
  )
})

export default Header
