import {Row, Col} from 'react-bootstrap'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { flushLocalstorage, getNameLocal } from '../constants/Common';
import { useNavigate } from 'react-router';
function Header(){
    const navigate = useNavigate();
    const handleLogout = () => {
        flushLocalstorage()
        navigate("/login")
    }

    return(
    <div className="header">
        <Row style={{verticalAlign: 'middle'}}>
            <Col xs={12} sm={12} lg={8} >
                <div className="company-name">
                    <img src="https://cescmysore.in/cesc/assets/landing-page-icons/CESC-logo.png" height={60} width={60} />&nbsp;&nbsp;&nbsp;Power Purchase Application
                </div>
            </Col>
            <Col xs={12} sm={12} lg={4} >
                <div className="logout">
                    Hello, {getNameLocal()}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <span onClick={() => {handleLogout()}} style={{textDecoration: 'underline'}}><AccountCircleOutlinedIcon/> Logout</span>
                </div>
            </Col>
        </Row>
    </div>
    )
}

export default Header;