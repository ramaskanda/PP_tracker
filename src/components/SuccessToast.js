import { Alert, Snackbar } from "@mui/material";

export default function SuccessToast(props){
    return(
        <Snackbar autoHideDuration={5000} open={props.toastOpen} onClose={props.closeToast}>
            <Alert severity="success">
                {props.message}
            </Alert>
        </Snackbar>
    )
}
