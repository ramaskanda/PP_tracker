import axios from "axios";
import { Col, Row, Table } from "react-bootstrap";
import {useEffect, useState, useRef} from 'react'
import Header from "../components/Header";
import HTTPService from "../constants/HTTPService";
import UrlConstants from "../constants/Urlconstants";
import { Sidebar, SidebarItem } from 'react-responsive-sidebar'
import SideNavBar from "../components/SideNavBar";
import { Autocomplete, Button, Card, CardContent, CardHeader, TextField } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import ErrorToast from "../components/ErrorToast";
import SuccessToast from "../components/SuccessToast";
import ConfirmDialog from "../components/ConfirmDialog";

import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, {Search} from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';

import './Users.css';
import { getTokenLocal, isLoggedInUserAdmin, isLoggedInUserOfficeUser, isLoggedInUserGenerator, isLoggedInUserBillingSupervisor, setUserIdLocal, getUserLocal } from "../constants/Common";
import { useNavigate } from "react-router";
import Loader from "../components/Loader";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const { SearchBar, ClearSearchButton } = Search;

let meterIdGlobal = '';
let defaultObj = {id: 0, label: ''}
let PPAsGlobal = []

function Meter (){

    const [meters, setMeters] = useState([])
    const [PPAs, setPPAs] = useState([])

    const [meterTypes, setMeterTypes] = useState([{id:1, label: "Main"}, {id:2, label: "Check"}])

    const [PPA, setPPA] = useState("")
    const [meterIdState, setMeterIdState] = useState("")
    const [meterType, setMeterType] = useState(defaultObj)
    const [meterSlNo, setMeterSlNo] = useState("")
    const [meterConstant, setMeterConstant] = useState("")

    const [errorToastMessage, setErrorToastMessage] = useState(null)
    const [successToastMessage, setSuccessToastMessage] = useState(null)

    const [openDialog, setOpenDialog] = useState(false)
    const [confirmDialogTitle, setConfirmDialogTitle] = useState("")
    const [confirmDialogContent, setConfirmDialogContent] = useState("")
    const [loader, setLoader] = useState(false)

    const scrollToRef = useRef()
    const fileRef = useRef()

    const navigate = useNavigate()

    const columns = [{
        dataField: 'index',
        text: 'Sl No.',
        headerClasses: 'text-center',
        classes: 'text-center'
      }, {
        dataField: 'meterid',
        text: 'Meter Id',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      }, {
        dataField: 'ppaid',
        text: 'PPA',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center',
        formatter: (cell, row, rowIndex) => {
            let ppa = PPAsGlobal.filter(item => item && item.id === row.ppaid)[0]
            if (ppa)
                return ppa.label
            else
                return <></>
        },
      },{
        dataField: 'mainorcheck',
        text: 'Meter type',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'meterserialnumber',
        text: 'Meter Sl No.',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'multiplicationconstant',
        text: 'Meter constant',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'action',
        text: 'Action',
        formatter: (cell, row, rowIndex) => {
            return <>
                        {isLoggedInUserAdmin() && <ModeEditIcon color="success" className="link"  onClick={() => {editMeter(row)}}></ModeEditIcon>}
                        {isLoggedInUserAdmin() && <DeleteIcon color="error" className="link" onClick={() => {deleteMeter(row.meterid)}}></DeleteIcon>}
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
                    placeholder="Filter"
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
            let url = UrlConstants.base_url + UrlConstants.Meter;
            let data = 
            {
                "PpaId": PPA.id,
                "MainOrCheck": meterType.label,
                "MeterSerialNumber": meterSlNo,
                "MultiplicationConstant": meterConstant,
                "IsActive": true,
            }
            
            meterIdState ? data['MeterId'] = meterIdState : data['MainOrCheck'] = meterType.label.trim();
            
            setLoader(true)
            HTTPService('POST', url, data, false, true)
            .then((res) => {
                setLoader(false)
                meterIdState ? setSuccessToastMessage("Meter updated successfully !!") : setSuccessToastMessage("Meter added successfully !!")
                clearForm()
                fetchMeterList()
            }).catch ((e) => {
                if (e.response.status == 401){
                    navigate("/login/sessionexpired")
                  }
                setLoader(false)
                setErrorToastMessage ("Could not add the Meter. Error: " + e.response.status)
            });
        }
        else{
            clearForm()
        }
    }

    const clearForm = () => {
        setMeterIdState(0)
        setMeterType(defaultObj)
        setPPA(defaultObj)
        setMeterSlNo("")
        setMeterConstant("")
        meterIdGlobal=0
    }
    const deleteMeter = (id) => {
        setErrorToastMessage (null)
        setSuccessToastMessage(null)
        meterIdGlobal = id
        setConfirmDialogTitle("Delete Meter")
        setConfirmDialogContent("Are you sure you want to delete the Meter ? This action is not reversible..")
        setOpenDialog(true)
    }

    const editMeter = (row) => {
        meterIdGlobal = row.meterid
        setMeterIdState(row.meterid)
        setMeterType(meterTypes.filter(item => item.label === row.mainorcheck)[0])
        setPPA(PPAs.filter(item => item.id === row.ppaid)[0])
        setMeterSlNo(row.meterserialnumber)
        setMeterConstant(row.multiplicationconstant)

        document.getElementById('main-container').scrollTo({ top: 0, behavior: 'smooth'})
        scrollToRef.current.scrollIntoView()
    }

    const handleConfirmDelete = () => {
        setErrorToastMessage (null)
        setSuccessToastMessage(null)
        setOpenDialog(false)
        let url = UrlConstants.base_url + UrlConstants.DeleteMeter + "?meterid=" + meterIdGlobal
        setLoader(true)
        HTTPService('GET', url, '', false, true)
        .then((res) => {
            setLoader(false)
            setSuccessToastMessage("Meter deleted successfully !!")
            fetchMeterList()
        }).catch ((e) => {
            if (e.response.status == 401){
                navigate("/login/sessionexpired")
              }
            setLoader(false)
            setErrorToastMessage ("Could not delete the Meter. Error: " + e.response.status)
        });
    }

      const fetchMeterList = () => {
        setErrorToastMessage (null)
        //setSuccessToastMessage(null)
        let url = UrlConstants.base_url + UrlConstants.Meter + "?ppaid=0"
        setLoader(true)
        HTTPService('GET', url, '', false, true)
        .then((res) => {
            setLoader(false)
            let data = res.data.dt.map((item, index) => {
                return {
                  index: index + 1,
                  meterid: item.meterid,
                  ppaid: item.ppaid,
                  mainorcheck: item.mainorcheck,
                  meterserialnumber: item.meterserialnumber,
                  multiplicationconstant: item.multiplicationconstant,
                  createdtime: item.createdtime,
                };
              });
            setMeters(data)
        }).catch ((e) => {
            if (e.response.status == 401){
                navigate("/login/sessionexpired")
              }
            setLoader(false)
            setErrorToastMessage ("Could not fetch the details. Error: " + e.response.status)
        });
      }

      const fetchPPAList = () => {
        setErrorToastMessage (null)
        //setSuccessToastMessage(null)
        let url = UrlConstants.base_url + UrlConstants.PPA + "?ppaid=0"
        setLoader(true)
        HTTPService('GET', url, '', false, true)
        .then((res) => {
            setLoader(false)
            let data = res.data.dt.map((item, index) => {
                return {
                  index: index + 1,
                  id: item.ppaid,
                  label: item.generatorname + " - " + item.siteaddress + " - " + new Date(item.ppadate).toLocaleDateString('en-GB'),
                };
              });
            setPPAs(data)
            PPAsGlobal = data
            fetchMeterList()
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
            navigate("/manpowerPPAcost")
      else if (isLoggedInUserBillingSupervisor())
            navigate("/customers")*/
      fetchPPAList();

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
                activeHightlight='rgba(100,100,100, 0.9)'
                className='sidemenu'>
        <Header />
        <div className="main-container" ref={scrollToRef} id="main-container">
        {isLoggedInUserAdmin() ?
            <>
            <Card sx={{ width: '100%', fontFamily: 'Open Sans'}}>
            <CardHeader
                title="Add New Meter / Update an Existing Meter"
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
                            <Autocomplete
                                required
                                id="ppa"
                                options={PPAs}
                                value={PPA}
                                renderInput={(params) => <TextField {...params}  required label="PPA" helperText="Select the PPA" className="textfield"/>}
                                onChange={(e, value) => setPPA(value)}
                                sx={{width: '90%'}}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <Autocomplete
                                required
                                id="metertype"
                                options={meterTypes}
                                value={meterType}
                                renderInput={(params) => <TextField {...params}  required label="Meter Type" helperText="Select the Meter type" className="textfield"/>}
                                onChange={(e, value) => setMeterType(value)}
                                sx={{width: '90%'}}
                            />
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <TextField 
                                required
                                value={meterSlNo}
                                variant="outlined"
                                onChange={(e) => setMeterSlNo(e.target.value.trim())}
                                type="text"
                                label="Meter Sl No"
                                className="textfield"
                                helperText={"Meter Sl No"}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <TextField 
                                required
                                value={meterConstant}
                                variant="outlined"
                                onChange={(e) => setMeterConstant(e.target.value)}
                                type="number"
                                label="Meter constant"
                                className="textfield"
                                helperText={"Meter multiplication constant"}
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
                            > {meterIdState ? "Update" : "Add"}
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
            <Row>
                <Col xs={12} sm={12} md={4} lg={4}></Col>
                <Col xs={12} sm={12} md={4} lg={4}></Col>
                <Col xs={12} sm={12} md={4} lg={4}>
                    <Button 
                        required
                        type="submit"
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                            let url = UrlConstants.GenericDownload + "?storedprocedure=Sp_GetAllPPA&additionalinfo1=NA&additionalinfo2=NA&additionalinfo3=NA&additionalinfo4=NA&additionalinfo5=NA&additionalinfo6=NA";
                            window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                    > {"Export To Excel"}
                    </Button> &nbsp;&nbsp;
                 </Col>
            </Row>
            <br />
            <ToolkitProvider
                    keyField="id"
                    data={meters}
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

export default Meter;