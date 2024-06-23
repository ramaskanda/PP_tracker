import { Alert, Snackbar } from "@mui/material";

export default function ErrorToast(props){
    return(
        <Snackbar autoHideDuration={5000} open={props.toastOpen} onClose={props.closeToast}>

            <Alert severity="error">
                {props.message}
            </Alert>
        </Snackbar>
    )
}
