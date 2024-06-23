import axios from "axios";
import { Col, Row, Table } from "react-bootstrap";
import {useEffect, useState, useRef} from 'react'
import Header from "../components/Header";
import HTTPService from "../constants/HTTPService";
import UrlConstants from "../constants/Urlconstants";
import { Sidebar, SidebarItem } from 'react-responsive-sidebar'
import SideNavBar from "../components/SideNavBar";
import { Autocomplete, Button, Card, CardContent, CardHeader, Select, TextField } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import ErrorToast from "../components/ErrorToast";
import SuccessToast from "../components/SuccessToast";
import ConfirmDialog from "../components/ConfirmDialog";

import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, {Search} from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';

import './Users.css';
import { getTokenLocal, isLoggedInUserAdmin, isLoggedInUserOfficeUser, isLoggedInUserGenerator, isLoggedInUserBillingSupervisor, setUserIdLocal } from "../constants/Common";
import { useNavigate } from "react-router";
import Loader from "../components/Loader";

const { SearchBar, ClearSearchButton } = Search;

let userid = '';
let defaultobj = {id:0, label: ''}

function Users (){

    const [users, setUsers] = useState([])

    const [userIdState, setUserId] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [mobile, setMobile] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState(defaultobj)

    const[roles, setRoles] = useState([])

    const [errorToastMessage, setErrorToastMessage] = useState(null)
    const [successToastMessage, setSuccessToastMessage] = useState(null)

    const [openDialog, setOpenDialog] = useState(false)
    const [confirmDialogTitle, setConfirmDialogTitle] = useState("")
    const [confirmDialogContent, setConfirmDialogContent] = useState("")

    const [loader, setLoader] = useState(false)

    const scrollToRef = useRef()
    const navigate = useNavigate()

    const columns = [{
        dataField: 'index',
        text: 'Sl No.',
        headerClasses: 'text-center',
        classes: 'text-center'
      }, {
        dataField: 'name',
        text: 'Name',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      }, {
        dataField: 'email',
        text: 'Email',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'mobile',
        text: 'Mobile',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'password',
        text: 'Password',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center',
        formatter: (cell, row, rowIndex) => {
            return '*'.repeat(`${cell.length}`)
          }, 
      },{
        dataField: 'role_name',
        text: 'Role',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'action',
        text: 'Action',
        formatter: (cell, row, rowIndex) => {
            return <>
                        {isLoggedInUserAdmin() && <ModeEditIcon color="success" className="link"  onClick={() => {editUser(row.userid, row.name, row.email, row.mobile, row.password, row.role, row.role_name)}}></ModeEditIcon>}
                        {isLoggedInUserAdmin() && <DeleteIcon color="error" className="link" onClick={() => {deleteUser(row.userid)}}></DeleteIcon>}
                   </>
          },
        headerClasses: 'text-center',
        classes: 'text-center'
      }];

      const MySearch = (props) => {
        const [searchText, setSearchText] = useState("");
        let input;
    
        const handleClick = () => {
          props.onSearch("");
          setSearchText("");
        };
    
        const handleChange = (e) => {
          let valueArray = e.target.value.split(" ");
          let extraSpace = true;
    
          let twoSpaceRegex = /[ ]{2,}/;
          setSearchText(e.target.value.replace(twoSpaceRegex," "))
          props.onSearch(input.value);
        }

        return (
            <>
              <form>
                <div className="custom-input">
                  <input
                    id="search-bar-0"
                    className="form-control"
                    style={{ backgroundColor: "#ffffff" }}
                    ref={(n) => (input = n)}
                    type="text"
                    onChange={(e) => handleChange(e)}
                    placeholder="Search the table"
                    value={searchText}
                  />
                  {/*
                  <input
                    id="input-btn-close"
                    className="btn-close"
                    type="reset"
                    value=""
                    onClick={handleClick}
                  />*/}
                </div>
              </form>
            </>
          );
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if(event.nativeEvent.submitter.innerText.toLowerCase() === "add" || event.nativeEvent.submitter.innerText.toLowerCase() === "update"){
            setErrorToastMessage (null)
            setSuccessToastMessage(null)
            let url = UrlConstants.base_url + UrlConstants.add_user;
            let data = {
                'name': name.trim(),
                'email': email.trim(),
                'mobile': mobile.trim(),
                'password': password.trim(),
                'role': role.id,
                'isactive': true
            }
            userIdState ? data['userid'] = userIdState : data['name'] = name.trim();
    
            setLoader(true)
            HTTPService('POST', url, data, false, true)
            .then((res) => {
                setLoader(false)
                userIdState ? setSuccessToastMessage("User updated successfully !!") : setSuccessToastMessage("User added successfully !!")
                setUserId("")
                setName("")
                setEmail("")
                setMobile("")
                setPassword("")
                setRole(defaultobj)
                fetchUsersList()
            }).catch ((e) => {
                if (e.response.status == 401){
                    navigate("/login/sessionexpired")
                  }
                setLoader(false)
                setErrorToastMessage ("Could not add the user. Error: " + e.response.status)
            });
        }
        else{
            setUserId("")
            setName("")
            setEmail("")
            setMobile("")
            setPassword("")
            setRole(defaultobj)
        }
    }

    const rowEvents = {
        onClick: (e, row, rowIndex) => {
          //   console.log("clicked",e.target, row,rowIndex)
          if (e.target.innerText.toLowerCase() === "delete") {
            // handleShow()
            deleteUser(row.userid);
          }
          if (e.target.innerText.toLowerCase() === "edit") {
            // handleShow()
                setName(row.name)
                setMobile(row.mobile)
                setEmail(row.email)
                setPassword(row.password)
          }
        },
      };

    const deleteUser = (id) => {
        setErrorToastMessage (null)
        setSuccessToastMessage(null)
        userid = id
        setConfirmDialogTitle("Delete User")
        setConfirmDialogContent("Are you sure you want to delete the user ? This action is not reversible..")
        setOpenDialog(true)
    }

    const editUser = (id, name, email, mobile, password, role, role_name) => {
        setName(name)
        setMobile(mobile)
        setEmail(email)
        setPassword(password)
        setUserId(id)
        setRole({id: role, label: role_name})
        document.getElementById('main-container').scrollTo({ top: 0, behavior: 'smooth'})
        scrollToRef.current.scrollIntoView()
    }

    const handleConfirmDelete = () => {
        setErrorToastMessage (null)
        setSuccessToastMessage(null)
        setOpenDialog(false)
        let url = UrlConstants.base_url + UrlConstants.delete_user + "?user_id=" + userid
        setLoader(true)
        HTTPService('GET', url, '', false, true)
        .then((res) => {
            setLoader(false)
            setSuccessToastMessage("User deleted successfully !!")
            fetchUsersList()
        }).catch ((e) => {
            if (e.response.status == 401){
                navigate("/login/sessionexpired")
              }
            setLoader(false)
            setErrorToastMessage ("Could not delete the user. Error: " + e.response.status)
        });
    }
    
    const fetchUsersList = () => {
        setErrorToastMessage (null)
        //setSuccessToastMessage(null)
        let url = UrlConstants.base_url + UrlConstants.get_all_users
        setLoader(true)
        HTTPService('GET', url, '', false, true)
        .then((res) => {
            setLoader(false)
            let data = res.data.dt1.map((item, index) => {
                return {
                  index: index + 1,
                  userid: item.userid,
                  name: item.name,
                  email: item.email,
                  mobile: item.mobile,
                  password: item.password,
                  role: item.role,
                  role_name: item.rolename
                //   action: "Delete<br />Edit",
                };
              });
            setUsers(data)
        }).catch ((e) => {
            if (e.response.status == 401){
                navigate("/login/sessionexpired")
              }
            setLoader(false)
            setErrorToastMessage ("Could not fetch the details. Error: " + e.response.status)
        });
    }

    const fetchRolesList = () => {
        setErrorToastMessage (null)
        //setSuccessToastMessage(null)
        let url = UrlConstants.base_url + UrlConstants.get_all_roles
        setLoader(true)
        HTTPService('GET', url, '', false, true)
        .then((res) => {
            setLoader(false)
            let data = res.data.dt1.map((item, index) => {
                return {
                  id: item.roleid,
                  label: item.rolename
                //   action: "Delete<br />Edit",
                };
              });
            setRoles(data)
        }).catch ((e) => {
            if (e.response.status == 401){
                navigate("/login/sessionexpired")
              }
            setLoader(false)
            setErrorToastMessage ("Could not fetch the details. Error: " + e.response.status)
        });
    }

    useEffect(() => {
     if (!getTokenLocal()) 
            navigate ("/login")
      /*if ((isLoggedInUserAdmin() || isLoggedInUserOfficeUser()))
            navigate("/users")
      else if (isLoggedInUserSiteUser())
            navigate("/manpowerprojectcost")
      else if (isLoggedInUserBillingSupervisor())
            navigate("/customers")*/
      fetchUsersList();
      fetchRolesList();
    }, [])
    
    return (
    <>
        {errorToastMessage ? <ErrorToast message={errorToastMessage} 
                                         toastOpen={errorToastMessage ? true : false}
                                         closeToast={() => {setErrorToastMessage(null)}}/> : <></>}
        {successToastMessage ? <SuccessToast message={successToastMessage}
                                             toastOpen={successToastMessage ? true : false}
                                             closeToast={() => {setSuccessToastMessage(null)}}/>: <></>}
        {openDialog ? <ConfirmDialog title={confirmDialogTitle} content={confirmDialogContent} 
                        handleOk={handleConfirmDelete} 
                        handleClose={() => {setOpenDialog(false); return;}}/> : <></>}
        {loader ? <Loader /> : <></>}
        
        <Sidebar 
                content={(isLoggedInUserAdmin() || isLoggedInUserOfficeUser()) ? SideNavBar.admin_items : ((isLoggedInUserGenerator()) ? SideNavBar.siteuser_items : SideNavBar.billing_supervisor_items)} 
                background='rgba(21, 27, 88, 1.0)'
                hoverHighlight='rgba(100,100,100, 0.9)'
                activeHightlight='rgba(255,255,255, 0.9)'
                className='sidemenu'>
        <Header />
        <div className="main-container" ref={scrollToRef} id="main-container">
            {isLoggedInUserAdmin() ?
            <>
            <Card sx={{ width: '100%', fontFamily: 'Open Sans'}}>
            <CardHeader
                title="Add New User / Update an Existing User"
                sx={{
                background: 'rgba(21, 27, 88, 0.3)',
                color: 'black',
                fontSize: 12,
                
                }}
            />
            <CardContent bsStyle="success">
                <form onSubmit={handleSubmit}>
                    <Row>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <TextField 
                                required
                                value={name}
                                variant="outlined"
                                onChange={(e) => setName(e.target.value)}
                                type="text"
                                label="Name"
                                helperText={"Full name of the user"}
                                className="textfield"
                            />
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <TextField 
                                required
                                value={email}
                                variant="outlined"
                                onChange={(e) => setEmail(e.target.value.trim())}
                                helperText={"Email address"}
                                type="email"
                                label="Email ID"
                                className="textfield"
                            />
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <TextField 
                                required
                                value={mobile}
                                variant="outlined"
                                onChange={(e) => setMobile(e.target.value.trim())}
                                type="tel"
                                label="Mobile Number"
                                className="textfield"
                                inputProps={{ maxLength: 10, pattern: '[0-9]{10}', inputMode: 'numeric' }}
                                helperText={"10 digit mobile number"}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <TextField 
                                required
                                value={password}
                                variant="outlined"
                                onChange={(e) => setPassword(e.target.value.trim())}
                                type="password"
                                label="Password"
                                className="textfield"
                                helperText={"Set a new passsword"}
                            />
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <Autocomplete
                                required
                                id="role"
                                options={roles}
                                value={role}
                                renderInput={(params) => <TextField {...params} required label="Select Role" helperText="Select the role" className="textfield"/>}
                                onChange={(e, value) => setRole(value)}
                                sx={{width: '90%'}}
                            />
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12} sm={12} md={12} lg={12}>
                            <Button 
                                required
                                type="submit"
                                variant="outlined"
                                color="primary"
                            > {userIdState ? "Update" : "Add"}
                            </Button>
                            &nbsp;&nbsp;
                            <Button 
                                required
                                type="clear"
                                variant="outlined"
                                color="secondary"
                                onClick={() => {}}
                            > Clear
                            </Button>
                        </Col>
                    </Row>
                </form>
            </CardContent>
            </Card>
            <br /><br /></>:<></>}
            {/*  
            <Table striped bordered hover >
                <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => {
                        return(
                        <tr>
                        <td>{index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.mobile}</td>
                        <td>
                            {/* <ModeEditIcon color="primary" onClick={editUser}/> 
                            <DeleteIcon color="warning" onClick={deleteUser(user.userid)}/>
                        </td>
                        </tr>)
                    })
                    }            
                </tbody>
            </Table>
            */}
            {/* <Row>
                <Col xs={12} sm={12} md={4} lg={4}></Col>
                <Col xs={12} sm={12} md={4} lg={4}></Col>
                <Col xs={12} sm={12} md={4} lg={4}>
                    <Button 
                        required
                        type="submit"
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                            let url = UrlConstants.GenericDownload + "?storedprocedure=Sp_GetAllUsers&additionalinfo1=NA&additionalinfo2=NA&additionalinfo3=NA&additionalinfo4=NA&additionalinfo5=NA&additionalinfo6=NA";
                            window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                    > {"Export To Excel"}
                    </Button> &nbsp;&nbsp;
                 </Col>
            </Row>
            <br /> */}
            <ToolkitProvider
                    keyField="id"
                    data={users}
                    columns={columns}
                    pagination={ paginationFactory()}
                    search
                >
                    {(props) => (
                        <Row>
                        <Row>
                            <Col xl={8} md={12} sm={12} xs={12}>
                            {/* <SearchBar placeholder="Filter" srText="" { ...props.searchProps } /> */}
                            <MySearch {...props.searchProps} />
                            {/* <CloseButton onClick={ () => props.searchProps.onSearch('') }/> */}
                            </Col>
                        </Row>
                        <br />
                        {/* <hr /> */}
                        {/* <ExportCSVButton { ...props.csvProps }>Export CSV</ExportCSVButton> */}
                        {/* <hr /> */}
                        <BootstrapTable
                            className="table-container"
                            // rowEvents={rowEvents}
                            {...props.baseProps}
                            pagination={ paginationFactory()}
                            // pagination={ paginationFactory() }
                        />
                        </Row>
                    )}
                </ToolkitProvider>
            <br /><br />
        </div>
        </Sidebar>
    </>
    )
}

export default Users;