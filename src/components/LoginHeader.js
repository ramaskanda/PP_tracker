import {Row, Col} from 'react-bootstrap'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
function LoginHeader(){
    return(
    <div className="loginheader">
        <Row style={{verticalAlign: 'middle'}}>
            <Col xs={12} sm={12} lg={12} >
                <div className="company-name">
                    Practcon
                </div>
            </Col>
        </Row>
    </div>
    )
}

export default LoginHeader;