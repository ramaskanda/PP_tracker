import styled from "@emotion/styled"
import { CircularProgress } from "@mui/material"
import { Box } from "@mui/system"

export default function Loader (){
    return(    
    <>
      <div
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
        }}
      >
        <CircularProgress size={70} sx={{ color: 'white' }} /> &nbsp;{' '}
        <span style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
          Please wait while the request is being processed
        </span>
      </div>
      <DisabledBackground />
    </>)
}

  const DisabledBackground = styled(Box)({
    width: '100%',
    height: '100%',
    position: 'fixed',
    background: '#555',
    opacity: 0.8,
    zIndex: 1,
  })